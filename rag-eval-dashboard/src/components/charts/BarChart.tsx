import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { PALETTE } from '@/lib/colors';
import { doExport } from '@/lib/chartExport';
import { fmtNum, truncate } from '@/lib/format';
import type {
  BarChartData,
  CILevel,
  ChartExportHandle,
  ColorPickerTarget,
  YMetric,
} from '@/types';
import { ChartLegend } from './ChartLegend';

interface Props {
  data: BarChartData;
  ciLevel: CILevel;
  yMetric: YMetric;
  customColors: Record<string, string>;
  onColorPick: (t: ColorPickerTarget) => void;
}

interface TipState {
  x: number;
  y: number;
  group: string;
  metric: string;
  value: number;
  lo?: number;
  hi?: number;
  n?: number;
  color: string;
}

export const BarChart = forwardRef<ChartExportHandle, Props>(function BarChart(
  { data, yMetric, customColors, onColorPick },
  ref
) {
  const W = Math.max(
    720,
    data.groups.length * Math.max(120, data.metrics.length * 28) + 120
  );
  const H = 460;
  const padL = 64;
  const padR = 24;
  const padT = 24;
  const padB = 120;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const { groups, metrics } = data;
  const yMax = 1;
  const yScale = (v: number) => padT + plotH - (v / yMax) * plotH;
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const gW = plotW / Math.max(1, groups.length);
  const innerPad = 12;
  const barAreaW = gW - innerPad * 2;
  const barW = barAreaW / Math.max(1, metrics.length);

  const [tip, setTip] = useState<TipState | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getColor = (key: string, i: number): string =>
    customColors[key] || PALETTE[i % PALETTE.length]!;

  useImperativeHandle(ref, () => ({
    exportPng: (title: string) => {
      const legendItems = metrics.map((m, i) => ({ label: m, color: getColor(m, i) }));
      doExport(svgRef.current, legendItems, title);
    },
  }));

  if (!groups.length || !metrics.length) {
    return <div className="muted" style={{ padding: 30 }}>Nothing to plot — adjust filters.</div>;
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <svg ref={svgRef} width={W} height={H} style={{ display: 'block' }}>
        {ticks.map(t => (
          <g key={t}>
            <line
              x1={padL}
              x2={W - padR}
              y1={yScale(t)}
              y2={yScale(t)}
              stroke="#d6d0bf"
              strokeWidth="1"
              strokeDasharray={t === 0 ? '' : '2 3'}
            />
            <text
              x={padL - 8}
              y={yScale(t) + 4}
              fontSize="10"
              textAnchor="end"
              fontFamily="monospace"
              fill="#8a857b"
            >
              {(t * 100).toFixed(0)}%
            </text>
          </g>
        ))}
        <text
          x={14}
          y={padT + plotH / 2}
          fontSize="10"
          fontFamily="monospace"
          fill="#4a4640"
          transform={`rotate(-90,14,${padT + plotH / 2})`}
          textAnchor="middle"
        >
          {yMetric === 'average_score' ? 'AVERAGE SCORE' : 'PASS RATE'}
        </text>
        {groups.map((g, gi) => {
          const gx = padL + gi * gW;
          return (
            <g key={g.key}>
              {gi > 0 && (
                <line
                  x1={gx}
                  x2={gx}
                  y1={padT}
                  y2={padT + plotH}
                  stroke="#e6e0cf"
                  strokeWidth="1"
                  strokeDasharray="1 2"
                />
              )}
              {g.values.map((v, mi) => {
                if (v.value == null) return null;
                const x = gx + innerPad + mi * barW;
                const y = yScale(v.value);
                const h = padT + plotH - y;
                const color = getColor(v.metric, mi);
                return (
                  <g key={v.metric}>
                    <rect
                      x={x + 1}
                      y={y}
                      width={barW - 2}
                      height={h}
                      fill={color}
                      onMouseMove={e => {
                        const r = wrapRef.current!.getBoundingClientRect();
                        setTip({
                          x: e.clientX - r.left,
                          y: e.clientY - r.top,
                          group: g.label,
                          metric: v.metric,
                          value: v.value!,
                          lo: v.lo,
                          hi: v.hi,
                          n: v.n,
                          color,
                        });
                      }}
                      onMouseLeave={() => setTip(null)}
                    />
                    {v.lo != null && v.hi != null && (
                      <g stroke="rgba(0,0,0,0.55)" strokeWidth="1">
                        <line
                          x1={x + barW / 2}
                          x2={x + barW / 2}
                          y1={yScale(v.lo)}
                          y2={yScale(v.hi)}
                        />
                        <line
                          x1={x + barW / 2 - 3}
                          x2={x + barW / 2 + 3}
                          y1={yScale(v.lo)}
                          y2={yScale(v.lo)}
                        />
                        <line
                          x1={x + barW / 2 - 3}
                          x2={x + barW / 2 + 3}
                          y1={yScale(v.hi)}
                          y2={yScale(v.hi)}
                        />
                      </g>
                    )}
                  </g>
                );
              })}
              <text
                x={gx + gW / 2}
                y={padT + plotH + 12}
                fontSize="10.5"
                textAnchor="end"
                fontFamily="monospace"
                fill="#4a4640"
                transform={`rotate(-35,${gx + gW / 2},${padT + plotH + 12})`}
              >
                {truncate(g.label, 36)}
              </text>
            </g>
          );
        })}
        <line
          x1={padL}
          x2={W - padR}
          y1={padT + plotH}
          y2={padT + plotH}
          stroke="#1a1815"
          strokeWidth="1"
        />
      </svg>

      <ChartLegend
        entries={metrics.map((m, i) => ({
          key: m,
          label: m,
          color: getColor(m, i),
          fallback: PALETTE[i % PALETTE.length]!,
        }))}
        onColorPick={onColorPick}
      />

      {tip && (
        <div className="tt" style={{ left: tip.x, top: tip.y - 4 }}>
          <div className="tt-row">
            <span className="dot" style={{ background: tip.color }} />
            {tip.metric}
          </div>
          <div style={{ opacity: 0.7, fontSize: 10 }}>{tip.group}</div>
          <div style={{ marginTop: 4 }}>
            {fmtNum(tip.value, 3)}
            {tip.lo != null && (
              <>
                {' '}
                · [{fmtNum(tip.lo, 3)}–{fmtNum(tip.hi, 3)}]
              </>
            )}
          </div>
          {tip.n != null && (
            <div style={{ opacity: 0.7, fontSize: 10 }}>n={tip.n}</div>
          )}
        </div>
      )}
    </div>
  );
});
