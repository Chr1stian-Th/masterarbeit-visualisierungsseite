interface Props {
  /** `no-files` — shown before any files are loaded; `no-matches` — shown when filters exclude all files. */
  variant: 'no-files' | 'no-matches';
}

/**
 * Full-page placeholder displayed in the main content area.
 * Variant `no-files` includes usage instructions; `no-matches` prompts the user to adjust filters.
 */
export function EmptyState({ variant }: Props) {
  if (variant === 'no-files') {
    return (
      <div className="empty">
        <div className="big">Drop eval JSONs to begin.</div>
        <div className="small">
          Upload <span className="kbd">eval_*.json</span> files. Also load source{' '}
          <span className="kbd">*.json</span> files for real tokens & agentic filters. Drop a{' '}
          <span className="kbd">questions.json</span> (array with id, domain, difficulty…) to
          unlock question-level filtering & breakdown charts. Files stay local.
        </div>
      </div>
    );
  }
  return (
    <div className="empty">
      <div className="big">No files match the active filters.</div>
      <div className="small muted">Adjust filters or select files in the sidebar.</div>
    </div>
  );
}
