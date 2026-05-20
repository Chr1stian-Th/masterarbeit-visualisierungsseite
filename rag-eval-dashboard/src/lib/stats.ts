import type { CILevel, WilsonCI, MeanCI } from '@/types';

/* z-scores for normal-approx confidence intervals */
export const Z: Record<CILevel, number> = {
  '0.80': 1.2816,
  '0.90': 1.6449,
  '0.95': 1.96,
  '0.99': 2.5758,
};

/** Wilson score interval for a binomial proportion (pass rate). */
export function wilsonCI(passed: number, total: number, level: CILevel = '0.95'): WilsonCI {
  if (!total) return { p: 0, lo: 0, hi: 0 };
  const z = Z[level] ?? 1.96;
  const p = passed / total;
  const n = total;
  const d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const m = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return { p, lo: Math.max(0, c - m), hi: Math.min(1, c + m) };
}

/** Normal-approximation CI for a sample mean (average score in [0,1]). */
export function meanCI(values: number[], level: CILevel = '0.95'): MeanCI {
  const n = values.length;
  if (!n) return { mean: 0, lo: 0, hi: 0, sd: 0 };
  const z = Z[level] ?? 1.96;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(
    n > 1 ? values.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (n - 1) : 0
  );
  const se = sd / Math.sqrt(n);
  return { mean, lo: Math.max(0, mean - z * se), hi: Math.min(1, mean + z * se), sd, se };
}
