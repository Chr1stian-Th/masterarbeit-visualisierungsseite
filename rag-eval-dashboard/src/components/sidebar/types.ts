/**
 * Re-exports the shape returned by `useCollapsibleSections` so sidebar
 * components can type their `sections` prop without importing the hook
 * file directly (avoids circular-ish dependency).
 */
export type UseCollapsibleSectionsResult = ReturnType<
  typeof import('@/hooks/useCollapsibleSections').useCollapsibleSections
>;
