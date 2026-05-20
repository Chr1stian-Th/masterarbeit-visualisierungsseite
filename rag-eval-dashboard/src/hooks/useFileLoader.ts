import { useCallback, useState } from 'react';
import { parseFile } from '@/lib/fileParser';
import type { EvalFile, QuestionMeta, SourceFile } from '@/types';

export interface UseFileLoaderResult {
  files: EvalFile[];
  sourceFiles: Record<string, SourceFile>;
  questionsMeta: Record<string, QuestionMeta>;
  questionFileNames: string[];
  errors: string[];
  dragOver: boolean;
  setDragOver: (over: boolean) => void;

  onPickFiles: (fs: File[]) => Promise<void>;
  onDrop: (e: React.DragEvent) => void;
  toggleFileSelected: (id: string, selected: boolean) => void;
  removeFile: (id: string) => void;
  removeSourceFile: (name: string) => void;
  removeQuestionsFile: (name: string) => void;

  selectAll: () => void;
  selectNone: () => void;
  clearAll: () => void;
  clearErrors: () => void;
}

/**
 * Owns the three file-collection states (evals, source, questions metadata)
 * plus the drag-and-drop UX state. Centralises the dedupe rules so adding a
 * duplicate eval file (same id) is a no-op rather than producing duplicates.
 */
export function useFileLoader(): UseFileLoaderResult {
  const [files, setFiles] = useState<EvalFile[]>([]);
  const [sourceFiles, setSourceFiles] = useState<Record<string, SourceFile>>({});
  const [questionsMeta, setQuestionsMeta] = useState<Record<string, QuestionMeta>>({});
  const [questionFileNames, setQuestionFileNames] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState<boolean>(false);

  const onPickFiles = useCallback(async (fileList: File[]) => {
    const errs: string[] = [];
    const evalFiles: EvalFile[] = [];
    const srcEntries: Record<string, SourceFile> = {};
    const qEntries: Record<string, QuestionMeta> = {};
    const qNames: string[] = [];

    for (const f of fileList) {
      const result = await parseFile(f);
      switch (result.kind) {
        case 'eval':
          evalFiles.push(result.file);
          break;
        case 'source':
          srcEntries[result.name] = result.file;
          break;
        case 'questions':
          for (const q of result.entries) qEntries[q.id] = q;
          qNames.push(result.name);
          break;
        case 'unrecognized':
          errs.push(`${result.name}: ${result.reason}`);
          break;
      }
    }

    if (errs.length) setErrors(p => [...p, ...errs]);
    if (evalFiles.length) {
      setFiles(prev => {
        const seen = new Set(prev.map(p => p.id));
        const m = [...prev];
        for (const n of evalFiles) if (!seen.has(n.id)) m.push(n);
        return m;
      });
    }
    if (Object.keys(srcEntries).length) setSourceFiles(p => ({ ...p, ...srcEntries }));
    if (Object.keys(qEntries).length) {
      setQuestionsMeta(p => ({ ...p, ...qEntries }));
      setQuestionFileNames(p => [...new Set([...p, ...qNames])]);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files?.length) {
        void onPickFiles([...e.dataTransfer.files]);
      }
    },
    [onPickFiles]
  );

  const toggleFileSelected = useCallback((id: string, selected: boolean) => {
    setFiles(p => p.map(x => (x.id === id ? { ...x, selected } : x)));
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(p => p.filter(x => x.id !== id));
  }, []);

  const removeSourceFile = useCallback((name: string) => {
    setSourceFiles(p => {
      const n = { ...p };
      delete n[name];
      return n;
    });
  }, []);

  const removeQuestionsFile = useCallback((name: string) => {
    setQuestionFileNames(prev => {
      const remaining = prev.filter(x => x !== name);
      // Can't easily remove by filename alone, so clear all when the last one is removed.
      if (remaining.length === 0) setQuestionsMeta({});
      return remaining;
    });
  }, []);

  const selectAll = useCallback(() => {
    setFiles(p => p.map(f => ({ ...f, selected: true })));
  }, []);

  const selectNone = useCallback(() => {
    setFiles(p => p.map(f => ({ ...f, selected: false })));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    setSourceFiles({});
  }, []);

  const clearErrors = useCallback(() => setErrors([]), []);

  return {
    files,
    sourceFiles,
    questionsMeta,
    questionFileNames,
    errors,
    dragOver,
    setDragOver,
    onPickFiles,
    onDrop,
    toggleFileSelected,
    removeFile,
    removeSourceFile,
    removeQuestionsFile,
    selectAll,
    selectNone,
    clearAll,
    clearErrors,
  };
}
