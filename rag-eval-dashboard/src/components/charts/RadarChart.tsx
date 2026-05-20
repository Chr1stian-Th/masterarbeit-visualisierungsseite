import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { doExport } from '@/lib/chartExport';
import type {
  ChartExportHandle,
  ColorPickerTarget,
  RadarChartData,
  YMetric,
} from '@/types';
import { ChartLegend } from './ChartLegend';

interface Props {
  data: RadarChartData;
  yMetric: YMetric;
  customColors: Record<string, string>;
  onColorPick: (t: ColorPickerTarget) => void;
}

/**
 * SVG radar/spider chart comparing metric profiles across groups.
 * Hovering a series highlights it and dims the others.
 * Clicking a legend item opens the color picker for that series.
 * Exposes an imperative `exportPng` handle via `ref` for PNG download.
 */
export const RadarChart = forwardRef<ChartExportHandle, Props>(function RadarChart(
  { data, yMetric, customColors, onColorPick },
  ref
) {
  const { series, metrics } = data;
  const W = 720;
  const H = 560;
  const cx = W / 2;
  const cy = H / 2 - 10;
  const R = Math.min(W, H) * 0.32;
  const rings = [0.25, 0.5, 0.75, 1];

  const [hover, setHover] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getColor = (key: string, fb: string): string => customColors[key] || fb;

  useImperativeHandle(ref, () => ({
    exportPng: (title: string) => {
      const legendItems = series.map(s => ({
        label: s.label,
        color: getColor(s.key, s.fallback),
      }));
      doExport(svgRef.current, legendItems, title);
    },
  }));

  if (!series.length || !metrics.length) {
    return <div className="muted" style={{ padding: 30 }}>Nothing to plot — adjust filters.</div>;
  }

  const angle = (i: number): number => -Math.PI / 2 + (i / metrics.length) * 2 * Math.PI;
  const pt = (i: number, v: number): [number, number] => [
    cx + R * v * Math.cos(angle(i)),
    cy + R * v * Math.sin(angle(i)),
  ];

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width={W} height={H} style={{ display: 'block', margin: '0 auto' }}>
        {rings.map(r => (
          <polygon
            key={r}
            points={metrics.map((_, i) => pt(i, r).join(',')).join(' ')}
            fill="none"
            stroke="#d6d0bf"
            strokeWidth="1"
            strokeDasharray={r === 1 ? '' : '2 3'}
          />
        ))}
        {rings.map(r => (
          <text
            key={r}
            x={cx + 4}
            y={cy - R * r - 2}
            fontSize="9.5"
            fontFamily="monospace"
            fill="#8a857b"
          >
            {(r * 100).toFixed(0)}%
          </text>
        ))}
        {metrics.map((m, i) => {
          const [x, y] = pt(i, 1);
          const cosA = Math.cos(angle(i));
          return (
            <g key={m}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke="#d6d0bf" strokeWidth="1" />
              <text
                x={cx + (R + 18) * cosA}
                y={cy + (R + 18) * Math.sin(angle(i))}
                fontSize="11"
                fontFamily="monospace"
                fill="#4a4640"
                textAnchor={Math.abs(cosA) < 0.2 ? 'middle' : cosA > 0 ? 'start' : 'end'}
                dy="3"
              >
                {m}
              </text>
            </g>
          );
        })}
        {series.map(s => {
          const color = getColor(s.key, s.fallback);
          const pts = s.points.map((p, i) => pt(i, p.value));
          const path =
            pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.join(' ')).join(' ') + ' Z';
          const isHover = hover === s.key;
          return (
            <g
              key={s.key}
              style={{
                opacity: hover && !isHover ? 0.18 : 1,
                transition: 'opacity .15s',
              }}
            >
              <path
                d={path}
                fill={color}
                fillOpacity={isHover ? 0.25 : 0.12}
                stroke={color}
                strokeWidth={isHover ? 2.5 : 1.5}
              />
              {pts.map((p, i) => (
                <circle
                  key={i}
                  cx={p[0]}
                  cy={p[1]}
                  r={isHover ? 4 : 3}
                  fill={color}
                  stroke="#fdfbf5"
                  strokeWidth="1.5"
                  onMouseEnter={() => setHover(s.key)}
                  onMouseLeave={() => setHover(null)}
                />
              ))}
            </g>
          );
        })}
      </svg>

      <ChartLegend
        entries={series.map(s => ({
          key: s.key,
          label: s.label,
          color: getColor(s.key, s.fallback),
          fallback: s.fallback,
        }))}
        onColorPick={onColorPick}
        onHover={setHover}
      />

      <div
        className="muted"
        style={{ marginTop: 8, fontSize: 11, fontFamily: 'var(--mono)' }}
      >
        Hover to highlight · Click legend to recolor ·{' '}
        {yMetric === 'average_score' ? 'avg score' : 'pass rate'} per metric
      </div>
    </div>
  );
});
