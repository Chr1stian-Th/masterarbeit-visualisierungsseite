/* ============================================================
   Shared TypeScript types for the dashboard.
   The shapes match the JSON files dropped into the sidebar.
   ============================================================ */

/* -------- Eval file -------- */

export interface PerQuestionScore {
  score?: number;
  passed?: boolean;
}

export interface MetricTotals {
  average_score: number;
  pass_rate: number;
  total_cases: number;
  passed: number;
  threshold?: number;
  per_question_scores?: PerQuestionScore[];
}

export interface PerQuestionMetric {
  score?: number;
  passed?: boolean;
  errored?: boolean;
  reason?: string;
}

export interface PerQuestion {
  question_id: string;
  input?: string;
  output?: string;
  ground_truth?: string;
  metrics?: Record<string, PerQuestionMetric>;
}

export interface ModelConfig {
  generation_model?: string;
  embedding_model?: string;
  classifier_model?: string;
  query_mode?: string;
}

export interface EvalData {
  approach: string;
  evaluation_timestamp?: string;
  model_config?: ModelConfig;
  metrics: Record<string, MetricTotals>;
  per_question: PerQuestion[];
  source_file?: string;
}

export interface EvalFile {
  id: string;
  name: string;
  data: EvalData;
  selected: boolean;
}

/* -------- Source file -------- */

export interface HallucinationCheck {
  is_grounded?: boolean;
  confidence?: number;
  unsupported_claims?: string[];
}

export interface SourceResultMetadata {
  classification_tier?: string;
  hallucination_retries?: number;
  hallucination_check?: HallucinationCheck;
}

export interface TokenUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
}

export interface SourceResult {
  question_id: string;
  latency_seconds?: number;
  token_usage?: TokenUsage;
  metadata?: SourceResultMetadata;
}

export interface SourceData {
  results: SourceResult[];
  total_token_usage?: TokenUsage;
}

export interface SourceFile {
  data: SourceData;
  byQId: Record<string, SourceResult>;
}

/* -------- Questions metadata -------- */

export interface QuestionMeta {
  id: string;
  question?: string;
  ground_truth?: string;
  domain?: string;
  domain_rationale?: string;
  answer_type?: string;
  answer_type_rationale?: string;
  difficulty?: number;
  difficulty_rationale?: string;
  gdpr_articles?: string[];
  ai_act_relevant?: boolean;
}

/* -------- Cost & stats -------- */

export interface CostEntry {
  input_per_1m: number;
  output_per_1m: number;
}

export type CostConfig = Record<string, CostEntry>;

export interface CostBreakdown {
  inT: number;
  outT: number;
  inCost: number;
  outCost: number;
  total: number;
  missing: boolean;
  isReal: boolean;
}

export interface FileCost extends CostBreakdown {
  in: number;
  out: number;
  perQ: number;
  nQ: number;
}

export interface WilsonCI {
  p: number;
  lo: number;
  hi: number;
}

export interface MeanCI {
  mean: number;
  lo: number;
  hi: number;
  sd: number;
  se?: number;
}

export type CILevel = '0.80' | '0.90' | '0.95' | '0.99';

/* -------- Per-question row (for the big table) -------- */

export type PassFilter = 'all' | 'pass' | 'partial' | 'fail' | 'errored';
export type GrounderFilter = 'all' | 'grounded' | 'ungrounded';
export type AiActFilter = 'all' | 'yes' | 'no';

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
  avgScore: number;
  allPass: boolean;
  anyErr: boolean;
  anyPass: boolean;
  partialPass: boolean;
  cost: CostBreakdown;
  classTier: string | null;
  isGrounded: boolean | null;
  latency: number | null;
  sourceQData: SourceResult | undefined;
  qMeta: QuestionMeta | null;
}

/* -------- Per-file aggregate -------- */

export interface FileMetricAgg {
  average_score: number;
  pass_rate: number;
  total_cases: number;
  passed: number;
  threshold?: number;
  wilson: WilsonCI;
  mci: MeanCI;
}

export interface FileAgg {
  file: EvalFile;
  perMetric: Record<string, FileMetricAgg>;
  cost: FileCost;
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

export interface BarValue {
  metric: string;
  value: number | null;
  lo?: number;
  hi?: number;
  n?: number;
}

export interface BarGroup {
  key: string;
  label: string;
  values: BarValue[];
}

export interface BarChartData {
  groups: BarGroup[];
  metrics: string[];
}

export interface RadarPoint {
  metric: string;
  value: number;
}

export interface RadarSeries {
  key: string;
  label: string;
  fallback: string;
  points: RadarPoint[];
}

export interface RadarChartData {
  series: RadarSeries[];
  metrics: string[];
}

/* -------- Color picker target -------- */

export interface ColorPickerTarget {
  key: string;
  x: number;
  y: number;
  fallback: string;
}

/* -------- Chart export ref API -------- */

export interface ChartExportHandle {
  exportPng: (title: string) => void;
}
