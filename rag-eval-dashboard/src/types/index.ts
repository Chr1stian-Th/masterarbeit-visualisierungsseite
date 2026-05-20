/* ============================================================
   Shared TypeScript types for the dashboard.
   The shapes match the JSON files dropped into the sidebar.
   ============================================================ */

/* -------- Eval file -------- */

/** Score and pass/fail outcome for one question on one metric. */
export interface PerQuestionScore {
  score?: number;
  passed?: boolean;
}

/** Aggregate statistics for a single metric across all questions in an eval run. */
export interface MetricTotals {
  average_score: number;
  pass_rate: number;
  total_cases: number;
  passed: number;
  threshold?: number;
  per_question_scores?: PerQuestionScore[];
}

/** Per-metric result for one question: score, pass/fail, optional error flag and judge reason. */
export interface PerQuestionMetric {
  score?: number;
  passed?: boolean;
  errored?: boolean;
  reason?: string;
}

/** One question's input/output pair and its per-metric evaluation results. */
export interface PerQuestion {
  question_id: string;
  input?: string;
  output?: string;
  ground_truth?: string;
  metrics?: Record<string, PerQuestionMetric>;
}

/** LLM configuration used when running the eval (generation, embedding, classifier models). */
export interface ModelConfig {
  generation_model?: string;
  embedding_model?: string;
  classifier_model?: string;
  query_mode?: string;
}

/** Top-level shape of an eval result JSON file. */
export interface EvalData {
  approach: string;
  evaluation_timestamp?: string;
  model_config?: ModelConfig;
  metrics: Record<string, MetricTotals>;
  per_question: PerQuestion[];
  source_file?: string;
}

/** An eval file loaded into the dashboard, with a stable id and selection state. */
export interface EvalFile {
  id: string;
  name: string;
  data: EvalData;
  selected: boolean;
}

/* -------- Source file -------- */

/** Result of the hallucination / grounding check for one answer. */
export interface HallucinationCheck {
  is_grounded?: boolean;
  confidence?: number;
  unsupported_claims?: string[];
}

/** Agentic-pipeline metadata attached to each source result (classification tier, retries, grounding). */
export interface SourceResultMetadata {
  classification_tier?: string;
  hallucination_retries?: number;
  hallucination_check?: HallucinationCheck;
}

/** Raw token counts for a single LLM call. */
export interface TokenUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
}

/** Per-question runtime data from the agentic pipeline (latency, token usage, metadata). */
export interface SourceResult {
  question_id: string;
  latency_seconds?: number;
  token_usage?: TokenUsage;
  metadata?: SourceResultMetadata;
}

/** Top-level shape of a source data JSON file containing per-question runtime results. */
export interface SourceData {
  results: SourceResult[];
  total_token_usage?: TokenUsage;
}

/** A source file loaded into the dashboard, with a pre-built lookup map by question id. */
export interface SourceFile {
  data: SourceData;
  byQId: Record<string, SourceResult>;
}

/* -------- Questions metadata -------- */

/** Rich metadata for a question from the optional questions JSON file. */
export interface QuestionMeta {
  id: string;
  question?: string;
  ground_truth?: string;
  domain?: string;
  domain_rationale?: string;
  answer_type?: string;
  answer_type_rationale?: string;
  /** Difficulty score in [0, 1]; higher means harder. */
  difficulty?: number;
  difficulty_rationale?: string;
  gdpr_articles?: string[];
  ai_act_relevant?: boolean;
}

/* -------- Cost & stats -------- */

/** Pricing for one model: USD per million input and output tokens. */
export interface CostEntry {
  input_per_1m: number;
  output_per_1m: number;
}

/** Map of model identifier to its pricing entry. */
export type CostConfig = Record<string, CostEntry>;

/** Cost breakdown for one question-run, with a flag for whether real token counts were used. */
export interface CostBreakdown {
  inT: number;
  outT: number;
  inCost: number;
  outCost: number;
  total: number;
  /** True when no pricing entry was found for the model. */
  missing: boolean;
  /** True when token counts came from real usage data rather than estimates. */
  isReal: boolean;
}

/** File-level cost totals, extending CostBreakdown with per-question average and question count. */
export interface FileCost extends CostBreakdown {
  in: number;
  out: number;
  /** Average cost per question-run. */
  perQ: number;
  nQ: number;
}

/** Wilson score confidence interval for a binomial proportion (pass rate). */
export interface WilsonCI {
  /** Point estimate (proportion of passing cases). */
  p: number;
  lo: number;
  hi: number;
}

/** Normal-approximation confidence interval for a sample mean (average score). */
export interface MeanCI {
  mean: number;
  lo: number;
  hi: number;
  sd: number;
  se?: number;
}

/** Supported confidence levels for interval calculations. */
export type CILevel = '0.80' | '0.90' | '0.95' | '0.99';

/* -------- Per-question row (for the big table) -------- */

export type PassFilter = 'all' | 'pass' | 'partial' | 'fail' | 'errored';
export type GrounderFilter = 'all' | 'grounded' | 'ungrounded';
export type AiActFilter = 'all' | 'yes' | 'no';

/** Flattened row used by the per-question table and modals. Joins eval, source, and metadata. */
export interface PerQRow {
  fileId: string;
  fileName: string;
  approach: string;
  gen_model: string | undefined;
  emb_model: string;
  question_id: string;
  input?: string;
  output?: string;
  ground_truth?: string;
  metrics: Record<string, PerQuestionMetric>;
  /** Average score across all selected metrics. */
  avgScore: number;
  /** True when every selected metric passed. */
  allPass: boolean;
  anyErr: boolean;
  anyPass: boolean;
  /** True when some (but not all) metrics passed and none errored. */
  partialPass: boolean;
  cost: CostBreakdown;
  classTier: string | null;
  isGrounded: boolean | null;
  latency: number | null;
  sourceQData: SourceResult | undefined;
  qMeta: QuestionMeta | null;
}

/* -------- Per-file aggregate -------- */

/** Aggregated metric statistics for one file, including CI bounds. */
export interface FileMetricAgg {
  average_score: number;
  pass_rate: number;
  total_cases: number;
  passed: number;
  threshold?: number;
  wilson: WilsonCI;
  mci: MeanCI;
}

/** Full aggregation for one eval file: per-metric stats, cost totals, and source-link status. */
export interface FileAgg {
  file: EvalFile;
  perMetric: Record<string, FileMetricAgg>;
  cost: FileCost;
  /** True when a source file is linked and real token counts are available. */
  sourceLinked: boolean;
}

/* -------- Chart data -------- */

export type YMetric = 'average_score' | 'pass_rate';

export type GroupDim =
  | 'approach'
  | 'gen_model'
  | 'emb_model'
  | 'domain'
  | 'answer_type'
  | 'difficulty_bucket';

/** Single bar value with optional CI bounds and sample count. */
export interface BarValue {
  metric: string;
  value: number | null;
  lo?: number;
  hi?: number;
  n?: number;
}

/** One group of bars (e.g. one approach or model) in the bar chart. */
export interface BarGroup {
  key: string;
  label: string;
  values: BarValue[];
}

/** All data needed to render the bar chart. */
export interface BarChartData {
  groups: BarGroup[];
  metrics: string[];
}

/** One point on the radar chart at the position for a given metric. */
export interface RadarPoint {
  metric: string;
  value: number;
}

/** One series (polygon) on the radar chart, representing one group. */
export interface RadarSeries {
  key: string;
  label: string;
  /** Default palette color used when no custom color is set. */
  fallback: string;
  points: RadarPoint[];
}

/** All data needed to render the radar chart. */
export interface RadarChartData {
  series: RadarSeries[];
  metrics: string[];
}

/* -------- Color picker target -------- */

/** Identifies which chart series the color picker should edit, and where to position the popover. */
export interface ColorPickerTarget {
  key: string;
  x: number;
  y: number;
  fallback: string;
}

/* -------- Chart export ref API -------- */

/** Imperative handle exposed by BarChart and RadarChart via forwardRef. */
export interface ChartExportHandle {
  /** Compose the chart + legend into a PNG and download it with the given title. */
  exportPng: (title: string) => void;
}
