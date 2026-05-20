import type { EvalFile } from '@/types';

/** "google/gemini-3-flash-preview" → "gemini-3-flash-preview" */
export function shortModel(m: string | undefined | null): string {
  return m ? m.split('/').pop()! : '—';
}

/** "approach / model / 2026-01-15" */
export function fileLabel(f: EvalFile): string {
  return `${f.data.approach} / ${shortModel(f.data.model_config?.generation_model)} / ${(f.data.evaluation_timestamp || '').slice(0, 10)}`;
}

/** Format a [0,1] value as a percentage string (e.g. 0.873 → "87.3%"). Returns "—" for null/undefined. */
export const fmtPct = (x: number | null | undefined): string =>
  x == null ? '—' : (x * 100).toFixed(1) + '%';

/** Format a number to `d` decimal places. Returns "—" for null/undefined. */
export const fmtNum = (x: number | null | undefined, d = 3): string =>
  x == null ? '—' : x.toFixed(d);

/** Format a USD amount with adaptive precision (5 dp for < $0.01, 4 dp for < $1, 2 dp otherwise). */
export const fmtUSD = (x: number | null | undefined): string =>
  '$' + (x == null ? '0' : x.toFixed(x < 0.01 ? 5 : x < 1 ? 4 : 2));

/** Shorter USD formatter (4 dp for < $0.01, 2 dp otherwise). */
export const fmtUSDShort = (x: number | null | undefined): string =>
  '$' + (x == null ? '0' : x.toFixed(x < 0.01 ? 4 : 2));

/** "answer_relevancy" → "ans·rel" */
export function abbrevMetric(n: string): string {
  return n
    .split('_')
    .map(w => w.slice(0, 3))
    .join('·');
}

/** Truncate a string to `n` characters, appending "…" when truncated. Returns "" for falsy input. */
export function truncate(s: string | undefined | null, n: number): string {
  if (!s) return '';
  return s.length <= n ? s : s.slice(0, n - 1) + '…';
}

/** Abbreviate a known answer type to a short label (e.g. "definitional" → "def"). */
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
