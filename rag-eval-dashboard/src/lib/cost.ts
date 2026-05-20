import type {
  CostConfig,
  CostBreakdown,
  PerQuestion,
  SourceResult,
} from '@/types';

/** Built-in pricing table (USD per 1M tokens). Editable in the UI. */
export const DEFAULT_COSTS: CostConfig = {
  'google/gemini-3-flash-preview': { input_per_1m: 0.5, output_per_1m: 3.0 },
  'mistralai/mistral-small-2603': { input_per_1m: 0.15, output_per_1m: 0.6 },
  'mistralai/mistral-large-2512': { input_per_1m: 0.5, output_per_1m: 1.5 },
};

/** Crude length-based token estimate. */
export function estimateTokens(text: string | undefined, charsPerToken: number): number {
  return text ? Math.ceil(text.length / Math.max(1, charsPerToken)) : 0;
}

/**
 * Compute input/output token & cost for one question. Uses real token usage
 * from the source file when available, otherwise falls back to a length-based
 * estimate.
 */
export function costForQuestion(
  q: PerQuestion,
  model: string | undefined,
  costs: CostConfig,
  charsPerToken: number,
  sourceQData: SourceResult | undefined
): CostBreakdown {
  const cfg = model ? costs[model] : undefined;
  if (!cfg) {
    return { inT: 0, outT: 0, inCost: 0, outCost: 0, total: 0, missing: true, isReal: false };
  }
  let inT: number;
  let outT: number;
  let isReal = false;
  if (sourceQData?.token_usage?.prompt_tokens != null) {
    inT = sourceQData.token_usage.prompt_tokens || 0;
    outT = sourceQData.token_usage.completion_tokens || 0;
    isReal = true;
  } else {
    inT = estimateTokens(q.input, charsPerToken);
    outT = estimateTokens(q.output, charsPerToken);
  }
  const inCost = (inT / 1e6) * (cfg.input_per_1m || 0);
  const outCost = (outT / 1e6) * (cfg.output_per_1m || 0);
  return { inT, outT, inCost, outCost, total: inCost + outCost, missing: false, isReal };
}
