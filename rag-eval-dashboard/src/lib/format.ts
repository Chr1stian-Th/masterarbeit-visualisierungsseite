import type { EvalFile } from '@/types';

/** "google/gemini-3-flash-preview" → "gemini-3-flash-preview" */
export function shortModel(m: string | undefined | null): string {
  return m ? m.split('/').pop()! : '—';
}

/** "approach / model / 2026-01-15" */
export function fileLabel(f: EvalFile): string {
  return `${f.data.approach} / ${shortModel(f.data.model_config?.generation_model)} / ${(f.data.evaluation_timestamp || '').slice(0, 10)}`;
}

export const fmtPct = (x: number | null | undefined): string =>
  x == null ? '—' : (x * 100).toFixed(1) + '%';

export const fmtNum = (x: number | null | undefined, d = 3): string =>
  x == null ? '—' : x.toFixed(d);

export const fmtUSD = (x: number | null | undefined): string =>
  '$' + (x == null ? '0' : x.toFixed(x < 0.01 ? 5 : x < 1 ? 4 : 2));

export const fmtUSDShort = (x: number | null | undefined): string =>
  '$' + (x == null ? '0' : x.toFixed(x < 0.01 ? 4 : 2));

/** "answer_relevancy" → "ans·rel" */
export function abbrevMetric(n: string): string {
  return n
    .split('_')
    .map(w => w.slice(0, 3))
    .join('·');
}

export function truncate(s: string | undefined | null, n: number): string {
  if (!s) return '';
  return s.length <= n ? s : s.slice(0, n - 1) + '…';
}

export function shortAnswerType(t: string | undefined | null): string {
  const map: Record<string, string> = {
    definitional: 'def',
    enumerative: 'enum',
    procedural: 'proc',
    comparative: 'comp',
    analytical: 'anal',
  };
  if (!t) return '?';
  return map[t] ?? t.slice(0, 4);
}
