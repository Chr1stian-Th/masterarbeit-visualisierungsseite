import { Fragment } from 'react';
import { approachColor } from '@/lib/colors';
import { shortModel } from '@/lib/format';
import { toggleSet } from '@/lib/grouping';
import type { EvalFile, GrounderFilter, QuestionMeta, SourceFile } from '@/types';
import type { FiltersSetters, FiltersState } from '@/hooks/useFilters';
import type { UseCollapsibleSectionsResult } from '@/components/sidebar/types';
import { FileDrop } from './FileDrop';
import { FileList } from './FileList';
import { PillsFilter } from './PillsFilter';
import { SidebarSection } from './SidebarSection';
import { QuestionAttributesFilter } from './QuestionAttributesFilter';

interface Props {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;

  /* File loader state */
  files: EvalFile[];
  sourceFiles: Record<string, SourceFile>;
  questionsMeta: Record<string, QuestionMeta>;
  questionFileNames: string[];
  errors: string[];
  dragOver: boolean;
  setDragOver: (over: boolean) => void;
  onDrop: (e: React.DragEvent) => void;
  onPickFiles: (fs: File[]) => Promise<void>;
  onToggleFileSelected: (id: string, selected: boolean) => void;
  onRemoveFile: (id: string) => void;
  onRemoveSourceFile: (name: string) => void;
  onRemoveQuestionsFile: (name: string) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onClearAll: () => void;
  onClearErrors: () => void;

  /* Filter state + setters */
  filters: FiltersState;
  setters: FiltersSetters;

  /* Bucket lists for filter options */
  allApproaches: string[];
  allGenModels: string[];
  allEmbModels: string[];
  allClsModels: string[];
  allQueryModes: string[];
  allClassTiers: string[];
  allDomains: string[];
  allAnswerTypes: string[];
  allMetrics: string[];

  /* Collapsible-section helper */
  sections: UseCollapsibleSectionsResult;

  /* Cost editing */
  charsPerToken: number;
  setCharsPerToken: (n: number) => void;
  onOpenCostEditor: () => void;
}

/**
 * Left-hand navigation and filter panel. Composes FileDrop, FileList,
 * PillsFilter, SidebarSection, and QuestionAttributesFilter into a vertically
 * scrollable sidebar that can be fully collapsed with a toggle button.
 */
export function Sidebar(props: Props) {
  const {
    sidebarCollapsed,
    onToggleSidebar,
    files,
    sourceFiles,
    questionsMeta,
    questionFileNames,
    errors,
    dragOver,
    setDragOver,
    onDrop,
    onPickFiles,
    onToggleFileSelected,
    onRemoveFile,
    onRemoveSourceFile,
    onRemoveQuestionsFile,
    onSelectAll,
    onSelectNone,
    onClearAll,
    onClearErrors,
    filters,
    setters,
    allApproaches,
    allGenModels,
    allEmbModels,
    allClsModels,
    allQueryModes,
    allClassTiers,
    allDomains,
    allAnswerTypes,
    allMetrics,
    sections,
    charsPerToken,
    setCharsPerToken,
    onOpenCostEditor,
  } = props;

  const hasFiles = files.length > 0;
  const hasSourceFiles = Object.keys(sourceFiles).length > 0;
  const hasQuestionsMeta = Object.keys(questionsMeta).length > 0;

  return (
    <div className="sidebar-outer">
      <div className="sidebar-wrap">
        <button
          className="sb-toggle"
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
        <div className="sb-brand-mini">ES</div>

        <div className="sidebar-inner">
          <div className="sb-content">
            <h1 className="brand">
              Eval<em>·</em>scope
            </h1>
            <div className="brand-sub">RAG evaluation explorer</div>

            <SidebarSection
              title="Files"
              sectionKey="files"
              isCollapsed={sections.isCollapsed}
              onToggle={sections.toggle}
              count={files.length}
              maxHeight={800}
            >
              <FileDrop
                dragOver={dragOver}
                setDragOver={setDragOver}
                onDrop={onDrop}
                onPick={onPickFiles}
              />
              {errors.length > 0 && (
                <div>
                  {errors.map((e, i) => (
                    <div key={i} className="err-banner">{e}</div>
                  ))}
                  <div style={{ textAlign: 'right', marginTop: 6 }}>
                    <button className="pill-btn" onClick={onClearErrors}>
                      clear errors
                    </button>
                  </div>
                </div>
              )}
              {hasFiles && (
                <FileList
                  files={files}
                  sourceFiles={sourceFiles}
                  onToggleSelected={onToggleFileSelected}
                  onRemoveFile={onRemoveFile}
                  onRemoveSourceFile={onRemoveSourceFile}
                  onSelectAll={onSelectAll}
                  onSelectNone={onSelectNone}
                  onClearAll={onClearAll}
                />
              )}
            </SidebarSection>

            {hasFiles && (
              <Fragment>
                {allApproaches.length > 0 && (
                  <SidebarSection
                    title="Approach"
                    sectionKey="approach"
                    isCollapsed={sections.isCollapsed}
                    onToggle={sections.toggle}
                  >
                    <PillsFilter
                      options={allApproaches}
                      selected={filters.selApproaches}
                      onToggle={k => toggleSet(setters.setSelApproaches, filters.selApproaches, k)}
                      colorFor={a => approachColor(a)}
                    />
                  </SidebarSection>
                )}

                {allGenModels.length > 0 && (
                  <SidebarSection
                    title="Generation model"
                    sectionKey="genmodel"
                    isCollapsed={sections.isCollapsed}
                    onToggle={sections.toggle}
                  >
                    <PillsFilter
                      options={allGenModels}
                      selected={filters.selGenModels}
                      onToggle={k => toggleSet(setters.setSelGenModels, filters.selGenModels, k)}
                      labelFor={shortModel}
                    />
                  </SidebarSection>
                )}

                {allEmbModels.length > 0 && (
                  <SidebarSection
                    title="Embedding model"
                    sectionKey="embmodel"
                    isCollapsed={sections.isCollapsed}
                    onToggle={sections.toggle}
                  >
                    <PillsFilter
                      options={allEmbModels}
                      selected={filters.selEmbModels}
                      onToggle={k => toggleSet(setters.setSelEmbModels, filters.selEmbModels, k)}
                      labelFor={shortModel}
                    />
                  </SidebarSection>
                )}

                {allClsModels.length > 0 && (
                  <SidebarSection
                    title="Classifier model"
                    sectionKey="clsmodel"
                    isCollapsed={sections.isCollapsed}
                    onToggle={sections.toggle}
                    badge="agentic"
                  >
                    <PillsFilter
                      options={allClsModels}
                      selected={filters.selClsModels}
                      onToggle={k => toggleSet(setters.setSelClsModels, filters.selClsModels, k)}
                      labelFor={shortModel}
                    />
                  </SidebarSection>
                )}

                {allQueryModes.length > 0 && (
                  <SidebarSection
                    title="Query mode"
                    sectionKey="querymode"
                    isCollapsed={sections.isCollapsed}
                    onToggle={sections.toggle}
                    badge="lightrag"
                  >
                    <PillsFilter
                      options={allQueryModes}
                      selected={filters.selQueryModes}
                      onToggle={k => toggleSet(setters.setSelQueryModes, filters.selQueryModes, k)}
                    />
                  </SidebarSection>
                )}

                {allClassTiers.length > 0 && (
                  <SidebarSection
                    title="Classification tier"
                    sectionKey="classtier"
                    isCollapsed={sections.isCollapsed}
                    onToggle={sections.toggle}
                    badge="source"
                  >
                    <PillsFilter
                      options={allClassTiers}
                      selected={filters.selClassTiers}
                      onToggle={k => toggleSet(setters.setSelClassTiers, filters.selClassTiers, k)}
                      labelFor={t => t.replace(/_/g, ' ')}
                    />
                  </SidebarSection>
                )}

                {hasSourceFiles && (
                  <SidebarSection
                    title="Hallucination check"
                    sectionKey="halluc"
                    isCollapsed={sections.isCollapsed}
                    onToggle={sections.toggle}
                    badge="source"
                    maxHeight={200}
                  >
                    <div className="pills">
                      {(['all', 'grounded', 'ungrounded'] as GrounderFilter[]).map(v => (
                        <button
                          key={v}
                          className={'pill-btn ' + (filters.grounderFilter === v ? 'on' : '')}
                          onClick={() => setters.setGrounderFilter(v)}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </SidebarSection>
                )}

                {hasSourceFiles && (
                  <SidebarSection
                    title="Max latency (s)"
                    sectionKey="latency"
                    isCollapsed={sections.isCollapsed}
                    onToggle={sections.toggle}
                    badge="source"
                    maxHeight={100}
                  >
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="unlimited"
                      value={filters.latencyMax}
                      onChange={e => setters.setLatencyMax(e.target.value)}
                    />
                  </SidebarSection>
                )}

                <SidebarSection
                  title="Metrics"
                  sectionKey="metrics"
                  isCollapsed={sections.isCollapsed}
                  onToggle={sections.toggle}
                  maxHeight={500}
                >
                  <PillsFilter
                    options={allMetrics}
                    selected={filters.selMetrics}
                    onToggle={k => toggleSet(setters.setSelMetrics, filters.selMetrics, k)}
                  />
                  <div className="row" style={{ marginTop: 8 }}>
                    <button
                      className="pill-btn"
                      onClick={() => setters.setSelMetrics(new Set(allMetrics))}
                    >
                      all
                    </button>
                    <button className="pill-btn" onClick={() => setters.setSelMetrics(new Set())}>
                      none
                    </button>
                  </div>
                </SidebarSection>

                <SidebarSection
                  title="Confidence interval"
                  sectionKey="ci"
                  isCollapsed={sections.isCollapsed}
                  onToggle={sections.toggle}
                  maxHeight={120}
                >
                  <div className="pills">
                    {(['0.80', '0.90', '0.95', '0.99'] as const).map(L => (
                      <button
                        key={L}
                        className={'pill-btn ' + (filters.ciLevel === L ? 'on' : '')}
                        onClick={() => setters.setCiLevel(L)}
                      >
                        {(+L * 100).toFixed(0)}%
                      </button>
                    ))}
                  </div>
                  <div
                    className="muted"
                    style={{ marginTop: 6, fontSize: 11, fontFamily: 'var(--mono)' }}
                  >
                    Wilson for pass-rate · normal-approx for mean score
                  </div>
                </SidebarSection>

                <SidebarSection
                  title="Cost model"
                  sectionKey="cost"
                  isCollapsed={sections.isCollapsed}
                  onToggle={sections.toggle}
                  maxHeight={200}
                >
                  {hasSourceFiles && (
                    <div
                      className="muted"
                      style={{
                        fontSize: 11,
                        fontFamily: 'var(--mono)',
                        marginBottom: 8,
                        color: 'var(--pass)',
                      }}
                    >
                      ✓ Real token counts from source files.
                    </div>
                  )}
                  {!hasSourceFiles && (
                    <div className="field">
                      <label>chars per token (est.)</label>
                      <input
                        type="number"
                        min="1"
                        step="0.1"
                        value={charsPerToken}
                        onChange={e => setCharsPerToken(+e.target.value || 4)}
                      />
                    </div>
                  )}
                  <button
                    className="pill-btn"
                    style={{ width: '100%' }}
                    onClick={onOpenCostEditor}
                  >
                    edit pricing config →
                  </button>
                </SidebarSection>

                {hasQuestionsMeta && (
                  <Fragment>
                    <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '8px 0' }} />
                    <SidebarSection
                      title="Question attributes"
                      sectionKey="qmeta"
                      isCollapsed={sections.isCollapsed}
                      onToggle={sections.toggle}
                      count={Object.keys(questionsMeta).length}
                      maxHeight={900}
                    >
                      <QuestionAttributesFilter
                        questionFileNames={questionFileNames}
                        questionsMeta={questionsMeta}
                        onRemoveQuestionsFile={onRemoveQuestionsFile}
                        onResetQuestionFilters={setters.resetQuestionFilters}
                        allDomains={allDomains}
                        selDomains={filters.selDomains}
                        setSelDomains={setters.setSelDomains}
                        allAnswerTypes={allAnswerTypes}
                        selAnswerTypes={filters.selAnswerTypes}
                        setSelAnswerTypes={setters.setSelAnswerTypes}
                        diffMin={filters.diffMin}
                        setDiffMin={setters.setDiffMin}
                        diffMax={filters.diffMax}
                        setDiffMax={setters.setDiffMax}
                        aiActFilter={filters.aiActFilter}
                        setAiActFilter={setters.setAiActFilter}
                      />
                    </SidebarSection>
                  </Fragment>
                )}
              </Fragment>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
