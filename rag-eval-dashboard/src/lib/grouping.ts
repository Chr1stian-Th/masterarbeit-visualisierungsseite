import type { EvalFile, GroupDim } from '@/types';
import { fileLabel, shortModel } from './format';

export interface DimDescriptor {
  key: GroupDim;
  label: string;
}

/** Dimensions derived from the eval-run config (always available). */
export const ALL_DIMS: DimDescriptor[] = [
  { key: 'approach', label: 'Approach' },
  { key: 'gen_model', label: 'Generation model' },
  { key: 'emb_model', label: 'Embedding model' },
];

/** Dimensions that require a questions metadata file. */
export const QUESTION_DIMS: DimDescriptor[] = [
  { key: 'domain', label: 'Domain' },
  { key: 'answer_type', label: 'Answer type' },
  { key: 'difficulty_bucket', label: 'Difficulty' },
];

export const Q_DIM_KEYS: Set<GroupDim> = new Set(QUESTION_DIMS.map(d => d.key));

export function diffLabel(d: number): string {
  if (d <= 0.2) return 'easy';
  if (d <= 0.4) return 'medium';
  if (d <= 0.6) return 'hard';
  return 'v.hard';
}

export function diffBucket(d: number): string {
  if (d <= 0.2) return 'easy (≤0.2)';
  if (d <= 0.4) return 'medium (0.2–0.4)';
  if (d <= 0.6) return 'hard (0.4–0.6)';
  return 'v.hard (>0.6)';
}

/** Pull the raw value for a given grouping dim from a file. */
export function getDim(file: EvalFile, dim: GroupDim): string {
  switch (dim) {
    case 'approach':
      return file.data.approach;
    case 'gen_model':
      return file.data.model_config?.generation_model || '—';
    case 'emb_model':
      return file.data.model_config?.embedding_model || '—';
    default:
      return file.id;
  }
}

/** Human-readable label for a grouping dim value. */
export function getDimLabel(file: EvalFile, dim: GroupDim): string {
  switch (dim) {
    case 'approach':
      return file.data.approach;
    case 'gen_model':
      return shortModel(file.data.model_config?.generation_model);
    case 'emb_model':
      return shortModel(file.data.model_config?.embedding_model);
    default:
      return fileLabel(file);
  }
}

/** Add-or-remove a key in a Set via a React setter. */
export function toggleSet<T>(
  setter: (next: Set<T>) => void,
  current: Set<T>,
  key: T
): void {
  const n = new Set(current);
  if (n.has(key)) n.delete(key);
  else n.add(key);
  setter(n);
}
