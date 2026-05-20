import { approachColor } from '@/lib/colors';
import { fmtNum, fmtPct, fmtUSD, fmtUSDShort, shortModel } from '@/lib/format';
import type { FileAgg, YMetric } from '@/types';

interface Props {
  fileAggs: FileAgg[];
  selMetrics: Set<string>;
  allMetrics: string[];
  yMetric: YMetric;
}

/**
 * Aggregated results table — one row per active eval file.
 * Shows per-metric averages or pass rates with CI bands, and cost totals.
 */
export function FileSummaryTable({ fileAggs, selMetrics, allMetrics, yMetric }: Props) {
  const metrics = allMetrics.filter(m => selMetrics.has(m));
  return (
    <div className="card" style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>File</th>
            <th>Approach</th>
            <th>Gen model</th>
            <th className="num">N</th>
            {metrics.map(m => (
              <th key={m} className="num">{m}</th>
            ))}
            <th className="num">Cost</th>
          </tr>
        </thead>
        <tbody>
          {fileAggs.map(a => (
            <tr key={a.file.id}>
              <td>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11.5 }}>{a.file.name}</div>
                <div className="muted" style={{ fontSize: 10.5, fontFamily: 'var(--mono)' }}>
                  {(a.file.data.evaluation_timestamp || '').slice(0, 10)}
                </div>
                {a.sourceLinked && (
                  <div
                    style={{
                      fontSize: 9.5,
                      color: 'var(--pass)',
                      fontFamily: 'var(--mono)',
                    }}
                  >
                    source linked · real tokens
                  </div>
                )}
              </td>
              <td>
                <span
                  className="badge"
                  style={{
                    background: 'transparent',
                    color: 'inherit',
                    border: `1px solid ${approachColor(a.file.data.approach)}`,
                  }}
                >
                  {a.file.data.approach}
                </span>
              </td>
              <td className="num">{shortModel(a.file.data.model_config?.generation_model)}</td>
              <td className="num">{a.cost.nQ}</td>
              {metrics.map(m => {
                const pm = a.perMetric[m];
                if (!pm) return <td key={m} className="num muted">—</td>;
                return (
                  <td key={m} className="num">
                    {yMetric === 'average_score' ? (
                      <>
                        <div>{fmtNum(pm.mci.mean, 3)}</div>
                        <div className="muted" style={{ fontSize: 10 }}>
                          [{fmtNum(pm.mci.lo, 3)}–{fmtNum(pm.mci.hi, 3)}]
                        </div>
                      </>
                    ) : (
                      <>
                        <div>{fmtPct(pm.wilson.p)}</div>
                        <div className="muted" style={{ fontSize: 10 }}>
                          [{fmtPct(pm.wilson.lo)}–{fmtPct(pm.wilson.hi)}]
                        </div>
                      </>
                    )}
                  </td>
                );
              })}
              <td className="num">
                <div>
                  {a.cost.missing ? (
                    <span className="muted">no price</span>
                  ) : (
                    fmtUSD(a.cost.total)
                  )}{' '}
                  {!a.cost.missing &&
                    (a.cost.isReal ? (
                      <span className="real-cost-badge">real</span>
                    ) : (
                      <span className="est-cost-badge">est.</span>
                    ))}
                </div>
                <div className="muted" style={{ fontSize: 10, fontFamily: 'var(--mono)' }}>
                  {a.cost.missing
                    ? ''
                    : fmtUSDShort(a.cost.total / Math.max(1, a.cost.nQ)) + ' / q'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
