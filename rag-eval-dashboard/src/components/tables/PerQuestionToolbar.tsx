import type { PassFilter } from '@/types';

interface Props {
  passFilter: PassFilter;
  setPassFilter: (v: PassFilter) => void;
  scoreMin: number;
  setScoreMin: (n: number) => void;
  scoreMax: number;
  setScoreMax: (n: number) => void;
  qSearch: string;
  setQSearch: (v: string) => void;
  filteredCount: number;
  totalCount: number;
}

export function PerQuestionToolbar({
  passFilter,
  setPassFilter,
  scoreMin,
  setScoreMin,
  scoreMax,
  setScoreMax,
  qSearch,
  setQSearch,
  filteredCount,
  totalCount,
}: Props) {
  return (
    <div className="pq-toolbar">
      <div className="field">
        <label>Pass status</label>
        <select
          value={passFilter}
          onChange={e => setPassFilter(e.target.value as PassFilter)}
          style={{ minWidth: 180 }}
        >
          <option value="all">all</option>
          <option value="pass">pass — all metrics passed</option>
          <option value="partial">partial pass — mixed results</option>
          <option value="fail">fail — all metrics failed</option>
          <option value="errored">errored</option>
        </select>
      </div>
      <div className="field">
        <label>min score</label>
        <input
          type="number"
          min="0"
          max="1"
          step="0.05"
          value={scoreMin}
          onChange={e => setScoreMin(+e.target.value)}
          style={{ width: 70 }}
        />
      </div>
      <div className="field">
        <label>max score</label>
        <input
          type="number"
          min="0"
          max="1"
          step="0.05"
          value={scoreMax}
          onChange={e => setScoreMax(+e.target.value)}
          style={{ width: 70 }}
        />
      </div>
      <div className="field" style={{ flex: 1, minWidth: 160 }}>
        <label>search</label>
        <input
          type="text"
          placeholder="input / output / id…"
          value={qSearch}
          onChange={e => setQSearch(e.target.value)}
        />
      </div>
      <span className="pq-count">
        {filteredCount} / {totalCount}
      </span>
    </div>
  );
}
