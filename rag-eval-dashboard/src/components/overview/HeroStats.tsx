import { meanCI, wilsonCI } from '@/lib/stats';
import { fmtNum, fmtPct, fmtUSD, fmtUSDShort } from '@/lib/format';
import type { CILevel, PerQRow } from '@/types';

interface Props {
  rows: PerQRow[];
  ciLevel: CILevel;
  selMetrics: Set<string>;
  allMetrics: string[];
}

export function HeroStats({ rows, ciLevel, selMetrics, allMetrics }: Props) {
  const allScores: number[] = [];
  let tp = 0;
  let tc = 0;
  let totalCost = 0;
  let inT = 0;
  let outT = 0;
  let missing = 0;
  let nQ = 0;
  let anyReal = false;

  for (const r of rows) {
    for (const m of allMetrics) {
      if (selMetrics.size && !selMetrics.has(m)) continue;
      const mm = r.metrics[m];
      if (!mm) continue;
      if (typeof mm.score === 'number') allScores.push(mm.score);
      tc++;
      if (mm.passed) tp++;
    }
    totalCost += r.cost.total;
    inT += r.cost.inT;
    outT += r.cost.outT;
    nQ++;
    if (r.cost.missing) missing++;
    if (r.cost.isReal) anyReal = true;
  }

  const mci = meanCI(allScores, ciLevel);
  const w = wilsonCI(tp, tc, ciLevel);

  return (
    <div className="grid g4" style={{ marginTop: 14 }}>
      <div className="card stat">
        <div className="label">Avg score</div>
        <div className="val num">{fmtNum(mci.mean, 3)}</div>
        <div className="ci num">[{fmtNum(mci.lo, 3)} – {fmtNum(mci.hi, 3)}]</div>
      </div>
      <div className="card stat">
        <div className="label">Pass rate</div>
        <div className="val num">{fmtPct(w.p)}</div>
        <div className="ci num">[{fmtPct(w.lo)} – {fmtPct(w.hi)}]</div>
      </div>
      <div className="card stat">
        <div className="label">
          Total cost{' '}
          {anyReal ? (
            <span className="real-cost-badge">real</span>
          ) : (
            <span className="est-cost-badge">est.</span>
          )}
        </div>
        <div className="val num">{fmtUSD(totalCost)}</div>
        <div className="ci num">
          {fmtUSDShort(nQ ? totalCost / nQ : 0)} / q-run · {missing ? `${missing} missing` : 'all priced'}
        </div>
      </div>
      <div className="card stat">
        <div className="label">
          Tokens{' '}
          {anyReal ? (
            <span className="real-cost-badge">real</span>
          ) : (
            <span className="est-cost-badge">est.</span>
          )}
        </div>
        <div className="val num">{(inT + outT).toLocaleString()}</div>
        <div className="ci num">
          {inT.toLocaleString()} in · {outT.toLocaleString()} out
        </div>
      </div>
    </div>
  );
}
