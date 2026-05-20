import { domainColor } from '@/lib/colors';
import { toggleSet } from '@/lib/grouping';
import type { AiActFilter, QuestionMeta } from '@/types';
import { PillsFilter } from './PillsFilter';

interface Props {
  questionFileNames: string[];
  questionsMeta: Record<string, QuestionMeta>;
  onRemoveQuestionsFile: (name: string) => void;
  onResetQuestionFilters: () => void;

  allDomains: string[];
  selDomains: Set<string>;
  setSelDomains: (s: Set<string>) => void;

  allAnswerTypes: string[];
  selAnswerTypes: Set<string>;
  setSelAnswerTypes: (s: Set<string>) => void;

  diffMin: number;
  setDiffMin: (n: number) => void;
  diffMax: number;
  setDiffMax: (n: number) => void;

  aiActFilter: AiActFilter;
  setAiActFilter: (v: AiActFilter) => void;
}

const DIFF_PRESETS: Array<[string, string, number, number]> = [
  ['easy', '≤0.2', 0, 0.2],
  ['med', '0.2–0.4', 0.2, 0.4],
  ['hard', '0.4–0.6', 0.4, 0.6],
  ['v.hard', '>0.6', 0.6, 1],
];

export function QuestionAttributesFilter({
  questionFileNames,
  questionsMeta: _questionsMeta,
  onRemoveQuestionsFile,
  onResetQuestionFilters,
  allDomains,
  selDomains,
  setSelDomains,
  allAnswerTypes,
  selAnswerTypes,
  setSelAnswerTypes,
  diffMin,
  setDiffMin,
  diffMax,
  setDiffMax,
  aiActFilter,
  setAiActFilter,
}: Props) {
  return (
    <>
      <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--ink-3)', marginBottom: 10 }}>
        {questionFileNames.map(n => (
          <div
            key={n}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
              title={n}
            >
              {n}
            </span>
            <button
              className="x"
              style={{
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
                color: 'var(--ink-3)',
                fontSize: 13,
                padding: '0 0 0 6px',
              }}
              onClick={() => {
                onRemoveQuestionsFile(n);
                // If that was the last questions file, reset dependent filters.
                if (questionFileNames.length === 1) onResetQuestionFilters();
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {allDomains.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div className="h" style={{ marginBottom: 6 }}>Domain</div>
          <PillsFilter
            options={allDomains}
            selected={selDomains}
            onToggle={k => toggleSet(setSelDomains, selDomains, k)}
            labelFor={d => d.replace(/_/g, ' ')}
            colorFor={d => domainColor(d)}
            titleFor={d => d}
          />
          {selDomains.size > 0 && (
            <button
              className="pill-btn"
              style={{ marginTop: 4, fontSize: 9 }}
              onClick={() => setSelDomains(new Set())}
            >
              clear
            </button>
          )}
        </div>
      )}

      {allAnswerTypes.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div className="h" style={{ marginBottom: 6 }}>Answer type</div>
          <PillsFilter
            options={allAnswerTypes}
            selected={selAnswerTypes}
            onToggle={k => toggleSet(setSelAnswerTypes, selAnswerTypes, k)}
          />
          {selAnswerTypes.size > 0 && (
            <button
              className="pill-btn"
              style={{ marginTop: 4, fontSize: 9 }}
              onClick={() => setSelAnswerTypes(new Set())}
            >
              clear
            </button>
          )}
        </div>
      )}

      <div style={{ marginBottom: 10 }}>
        <div className="h" style={{ marginBottom: 6 }}>Difficulty</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type="number"
            min="0"
            max="1"
            step="0.05"
            value={diffMin}
            onChange={e => setDiffMin(+e.target.value)}
            style={{ width: 54 }}
          />
          <span className="muted" style={{ fontSize: 10 }}>–</span>
          <input
            type="number"
            min="0"
            max="1"
            step="0.05"
            value={diffMax}
            onChange={e => setDiffMax(+e.target.value)}
            style={{ width: 54 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
          {DIFF_PRESETS.map(([l, tip, lo, hi]) => (
            <button
              key={l}
              className={'pill-btn ' + (diffMin === lo && diffMax === hi ? 'on' : '')}
              title={tip}
              onClick={() => { setDiffMin(lo); setDiffMax(hi); }}
              style={{ fontSize: 9 }}
            >
              {l}
            </button>
          ))}
          <button
            className="pill-btn"
            style={{ fontSize: 9 }}
            onClick={() => { setDiffMin(0); setDiffMax(1); }}
          >
            all
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 6 }}>
        <div className="h" style={{ marginBottom: 6 }}>AI Act relevant</div>
        <div className="pills">
          {(['all', 'yes', 'no'] as AiActFilter[]).map(v => (
            <button
              key={v}
              className={'pill-btn ' + (aiActFilter === v ? 'on' : '')}
              onClick={() => setAiActFilter(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
