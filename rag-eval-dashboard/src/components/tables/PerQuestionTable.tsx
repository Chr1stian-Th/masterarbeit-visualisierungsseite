import { useMemo, useState } from 'react';
import { abbrevMetric } from '@/lib/format';
import type { PassFilter, PerQRow, QuestionMeta } from '@/types';
import { PerQuestionRow } from './PerQuestionRow';
import { PerQuestionToolbar } from './PerQuestionToolbar';

interface Props {
  rows: PerQRow[];
  onOpen: (r: PerQRow) => void;
  selMetrics: Set<string>;
  allMetrics: string[];
  questionsMeta: Record<string, QuestionMeta>;
}

type SortKey = 'question_id' | 'avgScore' | 'qDomain' | 'qDiff' | 'latency';
type SortDir = 'asc' | 'desc';

interface SortedRow extends PerQRow {
  qDomain: string;
  qDiff: number | null;
}

/**
 * Paginated, sortable table of all per-question rows across active eval files.
 * Manages its own local state for pass-status filter, score range, free-text
 * search, sort key/direction, and pagination limit.
 */
export function PerQuestionTable({
  rows,
  onOpen,
  selMetrics,
  allMetrics,
  questionsMeta,
}: Props) {
  const [passFilter, setPassFilter] = useState<PassFilter>('all');
  const [scoreMin, setScoreMin] = useState<number>(0);
  const [scoreMax, setScoreMax] = useState<number>(1);
  const [qSearch, setQSearch] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>('avgScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [limit, setLimit] = useState<number>(50);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (passFilter === 'pass' && !r.allPass) return false;
      if (passFilter === 'partial' && !r.partialPass) return false;
      if (passFilter === 'fail' && (r.allPass || r.anyErr || r.anyPass)) return false;
      if (passFilter === 'errored' && !r.anyErr) return false;
      if (r.avgScore < scoreMin || r.avgScore > scoreMax) return false;
      if (qSearch) {
        const t = qSearch.toLowerCase();
        if (
          !(r.input || '').toLowerCase().includes(t) &&
          !(r.output || '').toLowerCase().includes(t) &&
          !(r.question_id || '').toLowerCase().includes(t)
        )
          return false;
      }
      return true;
    });
  }, [rows, passFilter, scoreMin, scoreMax, qSearch]);

  const sorted = useMemo<SortedRow[]>(() => {
    const arr: SortedRow[] = filtered.map(r => ({
      ...r,
      qDomain: r.qMeta?.domain || '',
      qDiff: r.qMeta?.difficulty ?? null,
    }));
    arr.sort((a, b) => {
      const av = (a as unknown as Record<SortKey, unknown>)[sortKey];
      const bv = (b as unknown as Record<SortKey, unknown>)[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const an = av as number;
      const bn = bv as number;
      return sortDir === 'asc' ? an - bn : bn - an;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (k: SortKey): void => {
    if (sortKey === k) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(k);
      setSortDir('desc');
    }
  };
  const sortIcon = (k: SortKey): string =>
    sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  const metrics = allMetrics.filter(m => selMetrics.has(m));
  const visible = sorted.slice(0, limit);
  const hasQM = Object.keys(questionsMeta).length > 0;

  return (
    <div className="card" style={{ overflowX: 'auto' }}>
      <PerQuestionToolbar
        passFilter={passFilter}
        setPassFilter={setPassFilter}
        scoreMin={scoreMin}
        setScoreMin={setScoreMin}
        scoreMax={scoreMax}
        setScoreMax={setScoreMax}
        qSearch={qSearch}
        setQSearch={setQSearch}
        filteredCount={filtered.length}
        totalCount={rows.length}
      />

      <table>
        <thead>
          <tr>
            <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('question_id')}>
              Q-id{sortIcon('question_id')}
            </th>
            <th>Approach</th>
            <th>Model</th>
            <th>Tier</th>
            {hasQM && (
              <th
                style={{ cursor: 'pointer' }}
                onClick={() => toggleSort('qDomain')}
                title="Domain · Answer type"
              >
                Q.Type{sortIcon('qDomain')}
              </th>
            )}
            {hasQM && (
              <th
                className="num"
                style={{ cursor: 'pointer' }}
                onClick={() => toggleSort('qDiff')}
                title="Difficulty 0–1"
              >
                Diff{sortIcon('qDiff')}
              </th>
            )}
            <th>Input</th>
            <th className="num" style={{ cursor: 'pointer' }} onClick={() => toggleSort('avgScore')}>
              Avg{sortIcon('avgScore')}
            </th>
            {metrics.map(m => (
              <th key={m} className="num" title={m}>
                {abbrevMetric(m)}
              </th>
            ))}
            <th className="num" style={{ cursor: 'pointer' }} onClick={() => toggleSort('latency')}>
              Lat(s){sortIcon('latency')}
            </th>
            <th className="num">Cost</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {visible.map(r => (
            <PerQuestionRow
              key={r.fileId + r.question_id}
              row={r}
              metrics={metrics}
              hasQuestionsMeta={hasQM}
              onOpen={onOpen}
              onTogglePassFilter={status =>
                setPassFilter(p => (p === status ? 'all' : status))
              }
            />
          ))}
          {!visible.length && (
            <tr>
              <td
                colSpan={metrics.length + 9 + (hasQM ? 2 : 0)}
                className="muted"
                style={{ textAlign: 'center', padding: 30 }}
              >
                No rows match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {sorted.length > limit && (
        <div style={{ padding: 12, textAlign: 'center' }}>
          <button className="pill-btn" onClick={() => setLimit(l => l + 50)}>
            show 50 more · {visible.length} / {sorted.length}
          </button>
        </div>
      )}
    </div>
  );
}
