import { useEffect, useMemo } from 'react';
import { meanCI, wilsonCI } from '@/lib/stats';
import { costForQuestion } from '@/lib/cost';
import { PALETTE } from '@/lib/colors';
import { diffBucket, diffLabel } from '@/lib/grouping';
import { shortModel } from '@/lib/format';
import type {
  BarChartData,
  CILevel,
  CostConfig,
  EvalFile,
  FileAgg,
  GroupDim,
  PerQRow,
  QuestionMeta,
  RadarChartData,
  SourceFile,
  YMetric,
} from '@/types';
import type { FiltersState } from './useFilters';

export interface UseDerivedDataInput {
  files: EvalFile[];
  sourceFiles: Record<string, SourceFile>;
  questionsMeta: Record<string, QuestionMeta>;
  filters: FiltersState;
  costs: CostConfig;
  charsPerToken: number;
  groupDim: GroupDim;
  yMetric: YMetric;
  onMetricsDiscovered: (m: string[]) => void;
}

export interface UseDerivedDataResult {
  allMetrics: string[];
  allApproaches: string[];
  allGenModels: string[];
  allEmbModels: string[];
  allClsModels: string[];
  allQueryModes: string[];
  allDomains: string[];
  allAnswerTypes: string[];
  allClassTiers: string[];

  activeFiles: EvalFile[];
  fileAggs: FileAgg[];
  perQRows: PerQRow[];

  barData: BarChartData;
  radarData: RadarChartData;
}

/**
 * Centralised memoization of every derived value the UI needs. Filters are
 * applied here so individual components only consume the final shapes.
 */
export function useDerivedData(input: UseDerivedDataInput): UseDerivedDataResult {
  const {
    files,
    sourceFiles,
    questionsMeta,
    filters,
    costs,
    charsPerToken,
    groupDim,
    yMetric,
    onMetricsDiscovered,
  } = input;

  const ciLevel: CILevel = filters.ciLevel;

  /* --------- bucket lists for sidebar dropdowns --------- */
  const allMetrics = useMemo(() => {
    const s = new Set<string>();
    for (const f of files) for (const m of Object.keys(f.data.metrics || {})) s.add(m);
    return [...s].sort();
  }, [files]);

  // When new metrics appear, give the caller a chance to populate selMetrics.
  useEffect(() => {
    onMetricsDiscovered(allMetrics);
  }, [allMetrics, onMetricsDiscovered]);

  const allApproaches = useMemo(
    () => [...new Set(files.map(f => f.data.approach))].sort(),
    [files]
  );
  const allGenModels = useMemo(
    () =>
      [
        ...new Set(
          files.map(f => f.data.model_config?.generation_model).filter((x): x is string => !!x)
        ),
      ].sort(),
    [files]
  );
  const allEmbModels = useMemo(
    () =>
      [
        ...new Set(
          files.map(f => f.data.model_config?.embedding_model).filter((x): x is string => !!x)
        ),
      ].sort(),
    [files]
  );
  const allClsModels = useMemo(
    () =>
      [
        ...new Set(
          files.map(f => f.data.model_config?.classifier_model).filter((x): x is string => !!x)
        ),
      ].sort(),
    [files]
  );
  const allQueryModes = useMemo(
    () =>
      [
        ...new Set(
          files.map(f => f.data.model_config?.query_mode).filter((x): x is string => !!x)
        ),
      ].sort(),
    [files]
  );
  const allDomains = useMemo(
    () =>
      [
        ...new Set(
          Object.values(questionsMeta)
            .map(q => q.domain)
            .filter((x): x is string => !!x)
        ),
      ].sort(),
    [questionsMeta]
  );
  const allAnswerTypes = useMemo(
    () =>
      [
        ...new Set(
          Object.values(questionsMeta)
            .map(q => q.answer_type)
            .filter((x): x is string => !!x)
        ),
      ].sort(),
    [questionsMeta]
  );
  const allClassTiers = useMemo(() => {
    const s = new Set<string>();
    for (const f of files) {
      const sf = f.data.source_file ? sourceFiles[f.data.source_file] : undefined;
      if (!sf) continue;
      for (const r of Object.values(sf.byQId)) {
        const t = r.metadata?.classification_tier;
        if (t) s.add(t);
      }
    }
    return [...s].sort();
  }, [files, sourceFiles]);

  /* --------- active files (sidebar filters applied) --------- */
  const activeFiles = useMemo(
    () =>
      files.filter(f => {
        if (!f.selected) return false;
        const cfg = f.data.model_config;
        if (filters.selApproaches.size && !filters.selApproaches.has(f.data.approach)) return false;
        if (
          filters.selGenModels.size &&
          (!cfg?.generation_model || !filters.selGenModels.has(cfg.generation_model))
        )
          return false;
        if (
          filters.selEmbModels.size &&
          (!cfg?.embedding_model || !filters.selEmbModels.has(cfg.embedding_model))
        )
          return false;
        if (filters.selClsModels.size && cfg?.classifier_model && !filters.selClsModels.has(cfg.classifier_model))
          return false;
        if (filters.selQueryModes.size && cfg?.query_mode && !filters.selQueryModes.has(cfg.query_mode))
          return false;
        return true;
      }),
    [
      files,
      filters.selApproaches,
      filters.selGenModels,
      filters.selEmbModels,
      filters.selClsModels,
      filters.selQueryModes,
    ]
  );

  /* --------- per-file aggregates --------- */
  const fileAggs = useMemo<FileAgg[]>(
    () =>
      activeFiles.map(f => {
        const m = f.data.metrics || {};
        const perMetric: FileAgg['perMetric'] = {};
        for (const name of Object.keys(m)) {
          const totals = m[name]!;
          const scores = (totals.per_question_scores || []).map(s => s.score ?? 0);
          const passed = (totals.per_question_scores || []).filter(s => s.passed).length;
          perMetric[name] = {
            average_score: totals.average_score,
            pass_rate: totals.pass_rate,
            total_cases: totals.total_cases,
            passed: totals.passed,
            threshold: totals.threshold,
            wilson: wilsonCI(passed, scores.length, ciLevel),
            mci: meanCI(scores, ciLevel),
          };
        }
        const gen = f.data.model_config?.generation_model;
        const sf = f.data.source_file ? sourceFiles[f.data.source_file] : undefined;
        const ca = { in: 0, out: 0, total: 0, inT: 0, outT: 0, missing: !(gen && costs[gen]), isReal: false };
        const qs = f.data.per_question || [];
        for (const q of qs) {
          const c = costForQuestion(q, gen, costs, charsPerToken, sf?.byQId?.[q.question_id]);
          ca.in += c.inCost;
          ca.out += c.outCost;
          ca.total += c.total;
          ca.inT += c.inT;
          ca.outT += c.outT;
          if (c.isReal) ca.isReal = true;
        }
        // Prefer file-level real token usage when available
        if (sf?.data?.total_token_usage && gen && costs[gen]) {
          const tu = sf.data.total_token_usage;
          const cfg = costs[gen];
          ca.inT = tu.prompt_tokens || ca.inT;
          ca.outT = tu.completion_tokens || ca.outT;
          ca.in = (ca.inT / 1e6) * (cfg.input_per_1m || 0);
          ca.out = (ca.outT / 1e6) * (cfg.output_per_1m || 0);
          ca.total = ca.in + ca.out;
          ca.isReal = true;
        }
        const nQ = qs.length || 1;
        return {
          file: f,
          perMetric,
          cost: { ...ca, inCost: ca.in, outCost: ca.out, perQ: ca.total / nQ, nQ },
          sourceLinked: !!sf,
        };
      }),
    [activeFiles, costs, charsPerToken, ciLevel, sourceFiles]
  );

  /* --------- per-question rows (sidebar filters only;
     table-local filters live in PerQuestionTable) --------- */
  const perQRows = useMemo<PerQRow[]>(() => {
    const rows: PerQRow[] = [];
    const latMax = filters.latencyMax !== '' ? parseFloat(filters.latencyMax) : null;
    const hasQM = Object.keys(questionsMeta).length > 0;

    for (const f of activeFiles) {
      const gen = f.data.model_config?.generation_model;
      const sf = f.data.source_file ? sourceFiles[f.data.source_file] : undefined;

      for (const q of f.data.per_question || []) {
        const sqd = sf?.byQId?.[q.question_id];
        const qm = questionsMeta[q.question_id] || null;
        const c = costForQuestion(q, gen, costs, charsPerToken, sqd);
        const classTier = sqd?.metadata?.classification_tier || null;
        const isGrounded = sqd?.metadata?.hallucination_check?.is_grounded ?? null;
        const latency = sqd?.latency_seconds ?? null;

        if (filters.selClassTiers.size && classTier && !filters.selClassTiers.has(classTier))
          continue;
        if (filters.grounderFilter === 'grounded' && isGrounded !== true) continue;
        if (filters.grounderFilter === 'ungrounded' && isGrounded !== false) continue;
        if (latMax !== null && latency !== null && latency > latMax) continue;

        // Question-level filters (only when metadata is loaded)
        if (hasQM && filters.selDomains.size > 0 && (!qm?.domain || !filters.selDomains.has(qm.domain)))
          continue;
        if (
          hasQM &&
          filters.selAnswerTypes.size > 0 &&
          (!qm?.answer_type || !filters.selAnswerTypes.has(qm.answer_type))
        )
          continue;
        if (hasQM && filters.aiActFilter === 'yes' && !qm?.ai_act_relevant) continue;
        if (hasQM && filters.aiActFilter === 'no' && qm?.ai_act_relevant === true) continue;
        if (hasQM && qm) {
          const d = qm.difficulty ?? 0;
          if (d < filters.diffMin || d > filters.diffMax) continue;
        }

        let allPass = true;
        let anyErr = false;
        let anyPass = false;
        let ss = 0;
        let nM = 0;
        for (const name of allMetrics) {
          if (filters.selMetrics.size && !filters.selMetrics.has(name)) continue;
          const mm = q.metrics?.[name];
          if (!mm) continue;
          if (mm.errored) anyErr = true;
          if (!mm.passed) allPass = false;
          else anyPass = true;
          if (typeof mm.score === 'number') {
            ss += mm.score;
            nM++;
          }
        }
        const avgScore = nM ? ss / nM : 0;
        const partialPass = !allPass && anyPass && !anyErr;

        rows.push({
          fileId: f.id,
          fileName: f.name,
          approach: f.data.approach,
          gen_model: gen,
          emb_model: f.data.model_config?.embedding_model || '—',
          question_id: q.question_id,
          input: q.input,
          output: q.output,
          ground_truth: q.ground_truth,
          metrics: q.metrics || {},
          avgScore,
          allPass,
          anyErr,
          anyPass,
          partialPass,
          cost: c,
          classTier,
          isGrounded,
          latency,
          sourceQData: sqd,
          qMeta: qm,
        });
      }
    }
    return rows;
  }, [
    activeFiles,
    sourceFiles,
    costs,
    charsPerToken,
    filters.selMetrics,
    allMetrics,
    filters.selClassTiers,
    filters.grounderFilter,
    filters.latencyMax,
    questionsMeta,
    filters.selDomains,
    filters.selAnswerTypes,
    filters.aiActFilter,
    filters.diffMin,
    filters.diffMax,
  ]);

  /* --------- chart groups (both bar & radar derive from perQRows) --------- */
  const _chartGroups = useMemo(() => {
    const metricsList = allMetrics.filter(m => filters.selMetrics.has(m));
    const groups = new Map<
      string,
      { key: string; label: string; sm: Record<string, { scores: number[]; passed: number; total: number }> }
    >();
    for (const r of perQRows) {
      const qm = r.qMeta;
      let key: string;
      let label: string;
      if (groupDim === 'approach') {
        key = r.approach;
        label = r.approach;
      } else if (groupDim === 'gen_model') {
        key = r.gen_model || '—';
        label = shortModel(r.gen_model);
      } else if (groupDim === 'emb_model') {
        key = r.emb_model;
        label = shortModel(r.emb_model);
      } else if (groupDim === 'domain') {
        key = qm?.domain || 'unknown';
        label = (qm?.domain || 'unknown').replace(/_/g, ' ');
      } else if (groupDim === 'answer_type') {
        key = qm?.answer_type || 'unknown';
        label = qm?.answer_type || 'unknown';
      } else {
        const d = qm?.difficulty ?? 0.5;
        key = diffBucket(d);
        label = diffLabel(d <= 0.2 ? 0.1 : d <= 0.4 ? 0.3 : d <= 0.6 ? 0.5 : 0.7);
      }
      if (!groups.has(key)) groups.set(key, { key, label, sm: {} });
      const g = groups.get(key)!;
      for (const metric of metricsList) {
        if (!g.sm[metric]) g.sm[metric] = { scores: [], passed: 0, total: 0 };
        const mm = r.metrics[metric];
        if (mm) {
          if (typeof mm.score === 'number') g.sm[metric]!.scores.push(mm.score);
          g.sm[metric]!.total++;
          if (mm.passed) g.sm[metric]!.passed++;
        }
      }
    }
    return { groups, metricsList };
  }, [perQRows, groupDim, allMetrics, filters.selMetrics]);

  const barData = useMemo<BarChartData>(() => {
    const { groups, metricsList } = _chartGroups;
    const rows = [...groups.values()].map(g => ({
      key: g.key,
      label: g.label,
      values: metricsList.map(metric => {
        const ms = g.sm[metric];
        if (!ms || !ms.scores.length) return { metric, value: null };
        if (yMetric === 'average_score') {
          const m = meanCI(ms.scores, ciLevel);
          return { metric, value: m.mean, lo: m.lo, hi: m.hi, n: ms.scores.length };
        } else {
          const w = wilsonCI(ms.passed, ms.total, ciLevel);
          return { metric, value: w.p, lo: w.lo, hi: w.hi, n: ms.total };
        }
      }),
    }));
    return { groups: rows, metrics: metricsList };
  }, [_chartGroups, yMetric, ciLevel]);

  const radarData = useMemo<RadarChartData>(() => {
    const { groups, metricsList } = _chartGroups;
    const series = [...groups.values()].map((g, i) => {
      const points = metricsList.map(metric => {
        const ms = g.sm[metric];
        if (!ms || !ms.scores.length) return { metric, value: 0 };
        const value =
          yMetric === 'average_score'
            ? ms.scores.reduce((a, b) => a + b, 0) / ms.scores.length
            : ms.total
              ? ms.passed / ms.total
              : 0;
        return { metric, value };
      });
      return { key: g.key, label: g.label, fallback: PALETTE[i % PALETTE.length]!, points };
    });
    return { series, metrics: metricsList };
  }, [_chartGroups, yMetric]);

  return {
    allMetrics,
    allApproaches,
    allGenModels,
    allEmbModels,
    allClsModels,
    allQueryModes,
    allDomains,
    allAnswerTypes,
    allClassTiers,
    activeFiles,
    fileAggs,
    perQRows,
    barData,
    radarData,
  };
}
