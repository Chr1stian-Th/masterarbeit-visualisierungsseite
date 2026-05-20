import { Fragment, useEffect, useState } from 'react';
import { DEFAULT_COSTS } from '@/lib/cost';
import { useTheme } from '@/hooks/useTheme';
import { useFileLoader } from '@/hooks/useFileLoader';
import { useFilters } from '@/hooks/useFilters';
import { useDerivedData } from '@/hooks/useDerivedData';
import { useCollapsibleSections } from '@/hooks/useCollapsibleSections';
import { EmptyState } from '@/components/common/EmptyState';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { HeroStats } from '@/components/overview/HeroStats';
import { ChartPanel } from '@/components/charts/ChartPanel';
import { ColorPickerPopover } from '@/components/charts/ColorPickerPopover';
import { FileSummaryTable } from '@/components/tables/FileSummaryTable';
import { PerQuestionTable } from '@/components/tables/PerQuestionTable';
import { QuestionModal } from '@/components/modals/QuestionModal';
import { CostEditor } from '@/components/modals/CostEditor';
import type {
  ColorPickerTarget,
  CostConfig,
  GroupDim,
  PerQRow,
  YMetric,
} from '@/types';

export function App() {
  /* Theme */
  const { darkMode, toggle: toggleTheme } = useTheme();

  /* Sidebar collapse / sub-section collapse */
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const sections = useCollapsibleSections();

  /* Files + filters + cost config */
  const loader = useFileLoader();
  const { filters, setters } = useFilters();
  const [costs, setCosts] = useState<CostConfig>(DEFAULT_COSTS);
  const [charsPerToken, setCharsPerToken] = useState<number>(4);

  /* Chart controls */
  const [chartType, setChartType] = useState<'bar' | 'radar'>('bar');
  const [yMetric, setYMetric] = useState<YMetric>('average_score');
  const [groupDim, setGroupDim] = useState<GroupDim>('approach');

  /* Modal / popover state */
  const [openQ, setOpenQ] = useState<PerQRow | null>(null);
  const [costEditorOpen, setCostEditorOpen] = useState<boolean>(false);
  const [colorPickerTarget, setColorPickerTarget] = useState<ColorPickerTarget | null>(null);
  const [customColors, setCustomColors] = useState<Record<string, string>>({});

  /* Derived data — uses everything above */
  const derived = useDerivedData({
    files: loader.files,
    sourceFiles: loader.sourceFiles,
    questionsMeta: loader.questionsMeta,
    filters,
    costs,
    charsPerToken,
    groupDim,
    yMetric,
    // When new metrics appear, default to all-selected.
    onMetricsDiscovered: metrics => {
      if (metrics.length && filters.selMetrics.size === 0) {
        setters.setSelMetrics(new Set(metrics));
      }
    },
  });

  /* Auto-collapse "files" / source / qmeta sections once each is populated. */
  const hasFiles = loader.files.length > 0;
  const hasSourceFiles = Object.keys(loader.sourceFiles).length > 0;
  const hasQuestionsMeta = Object.keys(loader.questionsMeta).length > 0;

  useEffect(() => {
    if (hasFiles) sections.collapse('files');
  }, [hasFiles, sections]);
  useEffect(() => {
    if (hasSourceFiles) sections.collapse('sourcefiles');
  }, [hasSourceFiles, sections]);
  useEffect(() => {
    if (hasQuestionsMeta) sections.collapse('qmeta');
  }, [hasQuestionsMeta, sections]);

  const ciPct = (+filters.ciLevel * 100).toFixed(0);

  return (
    <div className={'app ' + (sidebarCollapsed ? 'sb-collapsed' : '')}>
      <ThemeToggle darkMode={darkMode} onToggle={toggleTheme} />

      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(c => !c)}
        files={loader.files}
        sourceFiles={loader.sourceFiles}
        questionsMeta={loader.questionsMeta}
        questionFileNames={loader.questionFileNames}
        errors={loader.errors}
        dragOver={loader.dragOver}
        setDragOver={loader.setDragOver}
        onDrop={loader.onDrop}
        onPickFiles={loader.onPickFiles}
        onToggleFileSelected={loader.toggleFileSelected}
        onRemoveFile={loader.removeFile}
        onRemoveSourceFile={loader.removeSourceFile}
        onRemoveQuestionsFile={loader.removeQuestionsFile}
        onSelectAll={loader.selectAll}
        onSelectNone={loader.selectNone}
        onClearAll={loader.clearAll}
        onClearErrors={loader.clearErrors}
        filters={filters}
        setters={setters}
        allApproaches={derived.allApproaches}
        allGenModels={derived.allGenModels}
        allEmbModels={derived.allEmbModels}
        allClsModels={derived.allClsModels}
        allQueryModes={derived.allQueryModes}
        allClassTiers={derived.allClassTiers}
        allDomains={derived.allDomains}
        allAnswerTypes={derived.allAnswerTypes}
        allMetrics={derived.allMetrics}
        sections={sections}
        charsPerToken={charsPerToken}
        setCharsPerToken={setCharsPerToken}
        onOpenCostEditor={() => setCostEditorOpen(true)}
      />

      <main className="main">
        {!hasFiles && <EmptyState variant="no-files" />}
        {hasFiles && derived.activeFiles.length === 0 && (
          <EmptyState variant="no-matches" />
        )}

        {hasFiles && derived.activeFiles.length > 0 && (
          <Fragment>
            <h2 className="section">Overview</h2>
            <div className="section-sub">
              {derived.activeFiles.length} file
              {derived.activeFiles.length === 1 ? '' : 's'} active ·{' '}
              {derived.perQRows.length} question-runs · {ciPct}% CI
              {hasSourceFiles ? ' · real costs' : ''}
            </div>
            <HeroStats
              rows={derived.perQRows}
              ciLevel={filters.ciLevel}
              selMetrics={filters.selMetrics}
              allMetrics={derived.allMetrics}
            />

            <hr className="sep" />
            <h2 className="section">Compare</h2>
            <div className="section-sub">
              Pick axes & chart type. Click legend items to recolor.
            </div>
            <ChartPanel
              chartType={chartType}
              setChartType={setChartType}
              groupDim={groupDim}
              setGroupDim={setGroupDim}
              yMetric={yMetric}
              setYMetric={setYMetric}
              ciLevel={filters.ciLevel}
              barData={derived.barData}
              radarData={derived.radarData}
              customColors={customColors}
              onColorPick={setColorPickerTarget}
              hasQuestionsMeta={hasQuestionsMeta}
            />

            <hr className="sep" />
            <h2 className="section">By file</h2>
            <div className="section-sub">
              Aggregates with confidence intervals & cost per file.
            </div>
            <FileSummaryTable
              fileAggs={derived.fileAggs}
              selMetrics={filters.selMetrics}
              allMetrics={derived.allMetrics}
              yMetric={yMetric}
            />

            <hr className="sep" />
            <h2 className="section">Per-question</h2>
            <div className="section-sub">
              Click any row for full text & per-metric reasons.
            </div>
            <PerQuestionTable
              rows={derived.perQRows}
              onOpen={setOpenQ}
              selMetrics={filters.selMetrics}
              allMetrics={derived.allMetrics}
              questionsMeta={loader.questionsMeta}
            />
          </Fragment>
        )}
      </main>

      {openQ && (
        <QuestionModal
          q={openQ}
          allMetrics={derived.allMetrics}
          selMetrics={filters.selMetrics}
          onClose={() => setOpenQ(null)}
          questionsMeta={loader.questionsMeta}
        />
      )}
      {costEditorOpen && (
        <CostEditor
          costs={costs}
          setCosts={setCosts}
          onClose={() => setCostEditorOpen(false)}
        />
      )}
      {colorPickerTarget && (
        <ColorPickerPopover
          target={colorPickerTarget}
          customColors={customColors}
          setCustomColors={setCustomColors}
          onClose={() => setColorPickerTarget(null)}
        />
      )}
    </div>
  );
}
