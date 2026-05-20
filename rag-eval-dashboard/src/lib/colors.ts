/** Categorical palette for chart series, custom-color picker, etc. */
export const PALETTE: string[] = [
  '#c2410c', '#1d4ed8', '#15803d', '#6d28d9', '#0f766e', '#b45309',
  '#9f1239', '#1e3a5f', '#a16207', '#7c2d12', '#0369a1', '#365314',
  '#831843', '#3730a3', '#166534', '#374151', '#d97706', '#0891b2',
];

/** Approach-specific colors that match the CSS variables. */
export function approachColor(a: string | undefined | null): string {
  const map: Record<string, string> = {
    agentic_rag: 'var(--c-agentic)',
    crag: 'var(--c-crag)',
    lightrag: 'var(--c-lightrag)',
  };
  if (!a) return 'var(--ink)';
  return map[a] ?? 'var(--ink)';
}

/** Traffic-light coloring for difficulty values in [0,1]. */
export function diffColor(d: number): string {
  if (d <= 0.2) return 'var(--pass)';
  if (d <= 0.4) return '#84cc16';
  if (d <= 0.6) return 'var(--warn)';
  if (d <= 0.8) return '#ea580c';
  return 'var(--fail)';
}

/** Deterministic hash-based palette pick for a domain name. */
export function domainColor(domain: string | undefined | null): string {
  if (!domain) return 'var(--ink-3)';
  let h = 0;
  for (let i = 0; i < domain.length; i++) h = (h * 31 + domain.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length]!;
}
