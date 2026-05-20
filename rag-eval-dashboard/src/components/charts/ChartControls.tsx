import { ALL_DIMS, QUESTION_DIMS, Q_DIM_KEYS } from '@/lib/grouping';
import type { GroupDim, YMetric } from '@/types';

interface Props {
  chartType: 'bar' | 'radar';
  setChartType: (t: 'bar' | 'radar') => void;
  groupDim: GroupDim;
  setGroupDim: (d: GroupDim) => void;
  yMetric: YMetric;
  setYMetric: (m: YMetric) => void;
  hasQuestionsMeta: boolean;
  onExport: () => void;
}

/**
 * Toolbar above the chart: chart-type tabs (bar/radar), group-by and y-axis
 * selects, and the Export PNG button.
 */
export function ChartControls({
  chartType,
  setChartType,
  groupDim,
  setGroupDim,
  yMetric,
  setYMetric,
  hasQuestionsMeta,
  onExport,
}: Props) {
  const radarDisabled = Q_DIM_KEYS.has(groupDim);
  return (
    <div className="chart-controls">
      <div className="tabs">
        <button
          className={chartType === 'bar' ? 'active' : ''}
          onClick={() => setChartType('bar')}
        >
          Bar
        </button>
        <button
          className={chartType === 'radar' ? 'active' : ''}
          onClick={() => setChartType('radar')}
          disabled={radarDisabled}
          title={radarDisabled ? 'Radar not available for question-level grouping' : ''}
          style={{ opacity: radarDisabled ? 0.35 : 1 }}
        >
          Radar
        </button>
      </div>
      <div className="field">
        <label>group by</label>
        <select
          value={groupDim}
          onChange={e => {
            const next = e.target.value as GroupDim;
            setGroupDim(next);
            if (Q_DIM_KEYS.has(next)) setChartType('bar');
          }}
        >
          <optgroup label="By run">
            {ALL_DIMS.map(d => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </optgroup>
          {hasQuestionsMeta && (
            <optgroup label="By question">
              {QUESTION_DIMS.map(d => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>
      <div className="field">
        <label>y-axis</label>
        <select value={yMetric} onChange={e => setYMetric(e.target.value as YMetric)}>
          <option value="average_score">average score</option>
          <option value="pass_rate">pass rate</option>
        </select>
      </div>
      <button className="export-btn" onClick={onExport}>
        ↓ Export PNG
      </button>
    </div>
  );
}
