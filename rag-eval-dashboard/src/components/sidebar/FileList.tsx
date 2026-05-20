import { approachColor } from '@/lib/colors';
import { shortModel } from '@/lib/format';
import type { EvalFile, SourceFile } from '@/types';

interface Props {
  files: EvalFile[];
  sourceFiles: Record<string, SourceFile>;
  onToggleSelected: (id: string, selected: boolean) => void;
  onRemoveFile: (id: string) => void;
  onRemoveSourceFile: (name: string) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onClearAll: () => void;
}

export function FileList({
  files,
  sourceFiles,
  onToggleSelected,
  onRemoveFile,
  onRemoveSourceFile,
  onSelectAll,
  onSelectNone,
  onClearAll,
}: Props) {
  return (
    <div className="file-list">
      {files.map(f => {
        const sf = f.data.source_file ? sourceFiles[f.data.source_file] : undefined;
        return (
          <div key={f.id} className={'file-row ' + (f.selected ? 'selected' : '')}>
            <input
              type="checkbox"
              className="cb"
              checked={f.selected}
              onChange={e => onToggleSelected(f.id, e.target.checked)}
            />
            <div className="meta">
              <div className="name" title={f.name}>{f.name}</div>
              <div className="sub">
                <span className="dot" style={{ background: approachColor(f.data.approach) }} />
                {f.data.approach} · {shortModel(f.data.model_config?.generation_model)}
                {sf && <span style={{ color: 'var(--pass)' }}>·linked</span>}
              </div>
            </div>
            <button className="x" onClick={() => onRemoveFile(f.id)}>×</button>
          </div>
        );
      })}

      {Object.keys(sourceFiles).length > 0 && (
        <>
          <div className="h" style={{ marginTop: 8, marginBottom: 4, color: 'var(--ink-3)' }}>
            source files
          </div>
          {Object.keys(sourceFiles).map(name => (
            <div key={name} className="file-row source-file">
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 2,
                  border: '1px solid var(--line-2)',
                  display: 'inline-block',
                }}
              />
              <div className="meta">
                <div className="name" title={name}>{name}</div>
                <div className="sub">
                  <span className="dot" style={{ background: 'var(--ink-3)' }} />
                  {Object.keys(sourceFiles[name]!.byQId).length} q · real tokens
                </div>
              </div>
              <button className="x" onClick={() => onRemoveSourceFile(name)}>×</button>
            </div>
          ))}
        </>
      )}

      <div className="row" style={{ marginTop: 6 }}>
        <button className="pill-btn" onClick={onSelectAll}>all</button>
        <button className="pill-btn" onClick={onSelectNone}>none</button>
        <button className="pill-btn" onClick={onClearAll}>clear</button>
      </div>
    </div>
  );
}
