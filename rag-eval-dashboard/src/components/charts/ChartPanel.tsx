import { useRef } from 'react';
import { ALL_DIMS, QUESTION_DIMS } from '@/lib/grouping';
import type {
  BarChartData,
  CILevel,
  ChartExportHandle,
  ColorPickerTarget,
  GroupDim,
  RadarChartData,
  YMetric,
} from '@/types';
import { BarChart } from './BarChart';
import { RadarChart } from './RadarChart';
import { ChartControls } from './ChartControls';

interface Props {
  chartType: 'bar' | 'radar';
  setChartType: (t: 'bar' | 'radar') => void;
  groupDim: GroupDim;
  setGroupDim: (d: GroupDim) => void;
  yMetric: YMetric;
  setYMetric: (m: YMetric) => void;
  ciLevel: CILevel;
  barData: BarChartData;
  radarData: RadarChartData;
  customColors: Record<string, string>;
  onColorPick: (t: ColorPickerTarget) => void;
  hasQuestionsMeta: boolean;
}

export function ChartPanel({
  chartType,
  setChartType,
  groupDim,
  setGroupDim,
  yMetric,
  setYMetric,
  ciLevel,
  barData,
  radarData,
  customColors,
  onColorPick,
  hasQuestionsMeta,
}: Props) {
  const chartRef = useRef<ChartExportHandle>(null);

  const dimLabel =
    [...ALL_DIMS, ...QUESTION_DIMS].find(d => d.key === groupDim)?.label || groupDim;
  const exportTitle = `${chartType === 'bar' ? 'Bar' : 'Radar'} · ${dimLabel} · ${
    yMetric === 'average_score' ? 'Avg Score' : 'Pass Rate'
  }`;

  return (
    <div className="chart-frame">
      <ChartControls
        chartType={chartType}
        setChartType={setChartType}
        groupDim={groupDim}
        setGroupDim={setGroupDim}
        yMetric={yMetric}
        setYMetric={setYMetric}
        hasQuestionsMeta={hasQuestionsMeta}
        onExport={() => chartRef.current?.exportPng(exportTitle)}
      />
      <div className="chart-svg-wrap">
        {chartType === 'bar' ? (
          <BarChart
            ref={chartRef}
            data={barData}
            ciLevel={ciLevel}
            yMetric={yMetric}
            customColors={customColors}
            onColorPick={onColorPick}
          />
        ) : (
          <RadarChart
            ref={chartRef}
            data={radarData}
            yMetric={yMetric}
            customColors={customColors}
            onColorPick={onColorPick}
          />
        )}
      </div>
    </div>
  );
}
