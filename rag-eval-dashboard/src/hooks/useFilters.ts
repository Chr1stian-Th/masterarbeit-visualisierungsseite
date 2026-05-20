import { useState } from 'react';
import type { AiActFilter, CILevel, GrounderFilter } from '@/types';

/** Snapshot of all active sidebar filter values. Empty Sets mean "no filter applied". */
export interface FiltersState {
  selApproaches: Set<string>;
  selGenModels: Set<string>;
  selEmbModels: Set<string>;
  selClsModels: Set<string>;
  selQueryModes: Set<string>;
  selMetrics: Set<string>;
  selClassTiers: Set<string>;
  grounderFilter: GrounderFilter;
  /** String representation of the max-latency cutoff; empty string means unlimited. */
  latencyMax: string;
  selDomains: Set<string>;
  selAnswerTypes: Set<string>;
  aiActFilter: AiActFilter;
  diffMin: number;
  diffMax: number;
  ciLevel: CILevel;
}

/** Setter callbacks for each field in FiltersState. */
export interface FiltersSetters {
  setSelApproaches: (s: Set<string>) => void;
  setSelGenModels: (s: Set<string>) => void;
  setSelEmbModels: (s: Set<string>) => void;
  setSelClsModels: (s: Set<string>) => void;
  setSelQueryModes: (s: Set<string>) => void;
  setSelMetrics: (s: Set<string>) => void;
  setSelClassTiers: (s: Set<string>) => void;
  setGrounderFilter: (v: GrounderFilter) => void;
  setLatencyMax: (v: string) => void;
  setSelDomains: (s: Set<string>) => void;
  setSelAnswerTypes: (s: Set<string>) => void;
  setAiActFilter: (v: AiActFilter) => void;
  setDiffMin: (n: number) => void;
  setDiffMax: (n: number) => void;
  setCiLevel: (v: CILevel) => void;
  /** Reset all question-metadata filters (domain, answer type, difficulty, AI Act) to defaults. */
  resetQuestionFilters: () => void;
}

/** Bundles the dozen sidebar filter states + setters. */
export function useFilters(): { filters: FiltersState; setters: FiltersSetters } {
  const [selApproaches, setSelApproaches] = useState<Set<string>>(new Set());
  const [selGenModels, setSelGenModels] = useState<Set<string>>(new Set());
  const [selEmbModels, setSelEmbModels] = useState<Set<string>>(new Set());
  const [selClsModels, setSelClsModels] = useState<Set<string>>(new Set());
  const [selQueryModes, setSelQueryModes] = useState<Set<string>>(new Set());
  const [selMetrics, setSelMetrics] = useState<Set<string>>(new Set());
  const [selClassTiers, setSelClassTiers] = useState<Set<string>>(new Set());
  const [grounderFilter, setGrounderFilter] = useState<GrounderFilter>('all');
  const [latencyMax, setLatencyMax] = useState<string>('');
  const [selDomains, setSelDomains] = useState<Set<string>>(new Set());
  const [selAnswerTypes, setSelAnswerTypes] = useState<Set<string>>(new Set());
  const [aiActFilter, setAiActFilter] = useState<AiActFilter>('all');
  const [diffMin, setDiffMin] = useState<number>(0);
  const [diffMax, setDiffMax] = useState<number>(1);
  const [ciLevel, setCiLevel] = useState<CILevel>('0.95');

  const resetQuestionFilters = (): void => {
    setSelDomains(new Set());
    setSelAnswerTypes(new Set());
    setAiActFilter('all');
    setDiffMin(0);
    setDiffMax(1);
  };

  return {
    filters: {
      selApproaches,
      selGenModels,
      selEmbModels,
      selClsModels,
      selQueryModes,
      selMetrics,
      selClassTiers,
      grounderFilter,
      latencyMax,
      selDomains,
      selAnswerTypes,
      aiActFilter,
      diffMin,
      diffMax,
      ciLevel,
    },
    setters: {
      setSelApproaches,
      setSelGenModels,
      setSelEmbModels,
      setSelClsModels,
      setSelQueryModes,
      setSelMetrics,
      setSelClassTiers,
      setGrounderFilter,
      setLatencyMax,
      setSelDomains,
      setSelAnswerTypes,
      setAiActFilter,
      setDiffMin,
      setDiffMax,
      setCiLevel,
      resetQuestionFilters,
    },
  };
}
