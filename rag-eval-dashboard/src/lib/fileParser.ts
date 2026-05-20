import type {
  EvalFile,
  SourceFile,
  SourceResult,
  QuestionMeta,
} from '@/types';

/**
 * Discriminated result of trying to classify an uploaded JSON file.
 * `unrecognized` is returned for malformed or unknown shapes so the caller
 * can collect them as user-visible errors.
 */
export type ParseResult =
  | { kind: 'eval'; file: EvalFile }
  | { kind: 'source'; name: string; file: SourceFile }
  | { kind: 'questions'; name: string; entries: QuestionMeta[] }
  | { kind: 'unrecognized'; name: string; reason: string };

function isEvalShape(data: unknown): boolean {
  return (
    !!data &&
    typeof data === 'object' &&
    'metrics' in (data as object) &&
    'per_question' in (data as object)
  );
}

function isSourceShape(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const r = (data as { results?: unknown }).results;
  return Array.isArray(r);
}

function isQuestionsShape(data: unknown): boolean {
  if (!Array.isArray(data) || data.length === 0) return false;
  const first = data[0] as Record<string, unknown> | undefined;
  if (!first || first.id === undefined) return false;
  return first.domain !== undefined || first.difficulty !== undefined || first.answer_type !== undefined;
}

/**
 * Parse one uploaded file's text content and classify it.
 * Wraps JSON.parse errors as `unrecognized` results.
 */
export async function parseFile(f: File): Promise<ParseResult> {
  let data: unknown;
  try {
    data = JSON.parse(await f.text());
  } catch (e) {
    return { kind: 'unrecognized', name: f.name, reason: (e as Error).message };
  }

  if (isEvalShape(data)) {
    const evalData = data as EvalFile['data'];
    const id = `${f.name}::${evalData.evaluation_timestamp || Math.random()}`;
    return {
      kind: 'eval',
      file: { id, name: f.name, data: evalData, selected: true },
    };
  }

  if (isSourceShape(data)) {
    const sd = data as SourceFile['data'];
    const byQId: Record<string, SourceResult> = {};
    for (const r of sd.results) byQId[r.question_id] = r;
    return { kind: 'source', name: f.name, file: { data: sd, byQId } };
  }

  if (isQuestionsShape(data)) {
    return { kind: 'questions', name: f.name, entries: data as QuestionMeta[] };
  }

  return { kind: 'unrecognized', name: f.name, reason: 'unrecognized format.' };
}
