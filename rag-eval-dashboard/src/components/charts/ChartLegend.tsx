interface LegendEntry {
  key: string;
  label: string;
  color: string;
  fallback: string;
}

interface Props {
  entries: LegendEntry[];
  onColorPick: (e: { key: string; x: number; y: number; fallback: string }) => void;
  onHover?: (key: string | null) => void;
}

/** Re-usable legend strip; clicking an item opens the color picker. */
export function ChartLegend({ entries, onColorPick, onHover }: Props) {
  return (
    <div className="legend">
      {entries.map(entry => (
        <div
          key={entry.key}
          className="item"
          title="Click to change color"
          onMouseEnter={onHover ? () => onHover(entry.key) : undefined}
          onMouseLeave={onHover ? () => onHover(null) : undefined}
          onClick={e =>
            onColorPick({
              key: entry.key,
              x: e.clientX,
              y: e.clientY,
              fallback: entry.fallback,
            })
          }
        >
          <span className="swatch" style={{ background: entry.color }} />
          <span>{entry.label}</span>
        </div>
      ))}
    </div>
  );
}
