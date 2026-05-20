import { useRef } from 'react';

interface Props {
  dragOver: boolean;
  setDragOver: (over: boolean) => void;
  onDrop: (e: React.DragEvent) => void;
  onPick: (files: File[]) => void;
}

export function FileDrop({ dragOver, setDragOver, onDrop, onPick }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <div
        className={'drop ' + (dragOver ? 'over' : '')}
        onDragOver={e => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => ref.current?.click()}
      >
        <span className="big">＋</span>
        <span className="small">drop or click · eval & source JSONs</span>
      </div>
      <input
        ref={ref}
        type="file"
        accept=".json,application/json"
        multiple
        style={{ display: 'none' }}
        onChange={e => {
          if (e.target.files) onPick([...e.target.files]);
          e.target.value = '';
        }}
      />
    </>
  );
}
