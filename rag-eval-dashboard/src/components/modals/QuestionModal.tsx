import { Section } from '@/components/common/Section';
import { Stat } from '@/components/common/Stat';
import { ModalShell } from '@/components/common/ModalShell';
import { fmtNum, fmtUSD, shortModel } from '@/lib/format';
import type { PerQRow, QuestionMeta } from '@/types';
import { QuestionMetaCard } from './QuestionMetaCard';

interface Props {
  q: PerQRow;
  allMetrics: string[];
  selMetrics: Set<string>;
  onClose: () => void;
  questionsMeta: Record<string, QuestionMeta>;
}

export function QuestionModal({
  q,
  allMetrics,
  selMetrics,
  onClose,
  questionsMeta,
}: Props) {
  const qm = questionsMeta[q.question_id];

  return (
    <ModalShell onClose={onClose}>
      <header>
        <div>
          <div
            style={{
              fontFamily: 'var(--sans)',
              fontWeight: 700,
              fontSize: 20,
              lineHeight: 1.1,
            }}
          >
            Question {q.question_id}
          </div>
          <div
            className="muted"
            style={{ fontSize: 11, marginTop: 4, fontFamily: 'var(--mono)' }}
          >
            {q.approach} · {shortModel(q.gen_model)} · {q.fileName}
            {q.classTier && (
              <>
                {' '}· <span className="badge tier">{q.classTier.replace(/_/g, ' ')}</span>
              </>
            )}
            {q.latency != null && <> · {q.latency.toFixed(2)}s</>}
            {q.isGrounded === true && (
              <>
                {' '}· <span className="badge grounded">grounded</span>
              </>
            )}
            {q.isGrounded === false && (
              <>
                {' '}· <span className="badge ungrounded">not grounded</span>
              </>
            )}
          </div>
        </div>
        <button className="close" onClick={onClose}>✕</button>
      </header>
      <div className="body">
        {qm && <QuestionMetaCard qm={qm} />}
        <Section title="Input" markdown={false}>{q.input}</Section>
        <Section title="Output" markdown={true}>{q.output}</Section>
        <Section title="Ground truth" markdown={false}>{q.ground_truth}</Section>

        <h3 className="h" style={{ marginTop: 18 }}>Metric scores</h3>
        <div className="card" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th className="num">Score</th>
                <th>Status</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {allMetrics.map(m => {
                const mm = q.metrics[m];
                if (!mm) return null;
                const isSel = selMetrics.has(m);
                const status = mm.errored ? 'err' : mm.passed ? 'pass' : 'fail';
                return (
                  <tr key={m} style={{ opacity: isSel ? 1 : 0.55 }}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11.5 }}>{m}</td>
                    <td className="num">{fmtNum(mm.score, 3)}</td>
                    <td><span className={'badge ' + status}>{status}</span></td>
                    <td
                      style={{
                        maxWidth: 480,
                        fontSize: 12.5,
                        fontFamily: 'var(--serif)',
                      }}
                    >
                      {mm.reason}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <h3 className="h" style={{ marginTop: 18 }}>
          Cost{' '}
          {q.cost.isReal ? (
            <span className="real-cost-badge">real tokens</span>
          ) : (
            <span className="est-cost-badge">estimated</span>
          )}
        </h3>
        {q.cost.missing ? (
          <div className="muted">No pricing configured for this model.</div>
        ) : (
          <div className="grid g4">
            <Stat label="input tokens" value={q.cost.inT.toLocaleString()} />
            <Stat label="output tokens" value={q.cost.outT.toLocaleString()} />
            <Stat label="input cost" value={fmtUSD(q.cost.inCost)} />
            <Stat label="output cost" value={fmtUSD(q.cost.outCost)} />
          </div>
        )}

        {q.sourceQData?.metadata && (
          <>
            <h3 className="h" style={{ marginTop: 18 }}>Agentic metadata</h3>
            <div className="grid g2" style={{ gap: 10 }}>
              {q.sourceQData.metadata.classification_tier && (
                <Stat
                  label="classification tier"
                  value={q.sourceQData.metadata.classification_tier.replace(/_/g, ' ')}
                />
              )}
              {q.sourceQData.metadata.hallucination_retries != null && (
                <Stat
                  label="hallucination retries"
                  value={q.sourceQData.metadata.hallucination_retries}
                />
              )}
              {q.sourceQData.metadata.hallucination_check?.confidence != null && (
                <Stat
                  label="grounding confidence"
                  value={fmtNum(q.sourceQData.metadata.hallucination_check.confidence, 2)}
                />
              )}
              {q.latency != null && (
                <Stat label="latency (s)" value={q.latency.toFixed(2)} />
              )}
            </div>
            {q.sourceQData.metadata.hallucination_check?.unsupported_claims &&
              q.sourceQData.metadata.hallucination_check.unsupported_claims.length > 0 && (
                <details style={{ marginTop: 12 }}>
                  <summary
                    style={{
                      cursor: 'pointer',
                      fontFamily: 'var(--mono)',
                      fontSize: 10.5,
                      color: 'var(--ink-2)',
                    }}
                  >
                    unsupported claims (
                    {q.sourceQData.metadata.hallucination_check.unsupported_claims.length})
                  </summary>
                  <ul
                    style={{
                      marginTop: 8,
                      fontSize: 12.5,
                      fontFamily: 'var(--serif)',
                      lineHeight: 1.55,
                    }}
                  >
                    {q.sourceQData.metadata.hallucination_check.unsupported_claims.map(
                      (c, i) => (
                        <li key={i} style={{ marginBottom: 6 }}>{c}</li>
                      )
                    )}
                  </ul>
                </details>
              )}
          </>
        )}
      </div>
    </ModalShell>
  );
}
