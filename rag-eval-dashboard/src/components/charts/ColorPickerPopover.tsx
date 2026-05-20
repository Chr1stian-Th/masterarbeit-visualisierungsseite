import { useEffect, useRef } from 'react';
import { PALETTE } from '@/lib/colors';
import { truncate } from '@/lib/format';
import type { ColorPickerTarget } from '@/types';

interface Props {
  target: ColorPickerTarget;
  customColors: Record<string, string>;
  setCustomColors: (next: Record<string, string>) => void;
  onClose: () => void;
}

export function ColorPickerPopover({
  target,
  customColors,
  setCustomColors,
  onClose,
}: Props) {
  const current = customColors[target.key] || target.fallback;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    // Defer attachment so the click that opened the popover doesn't immediately close it.
    const t = setTimeout(() => document.addEventListener('mousedown', h), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', h);
    };
  }, [onClose]);

  const setColor = (hex: string) => setCustomColors({ ...customColors, [target.key]: hex });
  const reset = () => {
    const { [target.key]: _omit, ...rest } = customColors;
    void _omit;
    setCustomColors(rest);
    onClose();
  };

  const left = Math.min(target.x, window.innerWidth - 220);
  const top = Math.min(target.y, window.innerHeight - 280);

  return (
    <div ref={ref} className="color-picker-popover" style={{ left, top }}>
      <div className="color-picker-title">Color — {truncate(target.key, 24)}</div>
      <div className="color-swatches">
        {PALETTE.map(c => (
          <div
            key={c}
            className={'color-swatch-opt' + (current === c ? ' active' : '')}
            style={{ background: c }}
            onClick={() => {
              setColor(c);
              onClose();
            }}
          />
        ))}
      </div>
      <input
        type="color"
        className="color-picker-native"
        value={current.startsWith('#') ? current : '#c2410c'}
        onChange={e => setColor(e.target.value)}
      />
      <div className="color-picker-actions">
        <button className="pill-btn" style={{ flex: 1 }} onClick={reset}>Reset</button>
        <button className="pill-btn on" style={{ flex: 1 }} onClick={onClose}>Done</button>
      </div>
    </div>
  );
}
