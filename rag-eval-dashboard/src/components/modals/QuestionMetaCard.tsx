import { diffColor, domainColor } from '@/lib/colors';
import { diffLabel } from '@/lib/grouping';
import type { QuestionMeta } from '@/types';

interface Props {
  qm: QuestionMeta;
}

/**
 * The boxed metadata grid shown at the top of the question modal: question text,
 * ground truth, domain/answer-type/difficulty, GDPR articles, AI Act flag.
 */
export function QuestionMetaCard({ qm }: Props) {
  return (
    <div
      className="card"
      style={{
        padding: '14px 18px',
        marginBottom: 18,
        background: 'var(--bg-2)',
        border: '1px solid var(--line)',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
        {qm.question && (
          <div style={{ gridColumn: '1/-1' }}>
            <div className="h" style={{ marginBottom: 4 }}>Question text</div>
            <div
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 13,
                lineHeight: 1.55,
                color: 'var(--ink)',
              }}
            >
              {qm.question}
            </div>
          </div>
        )}
        {qm.ground_truth && (
          <div style={{ gridColumn: '1/-1' }}>
            <div className="h" style={{ marginBottom: 4 }}>Ground truth</div>
            <div
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 13,
                lineHeight: 1.55,
                color: 'var(--ink)',
              }}
            >
              {qm.ground_truth}
            </div>
          </div>
        )}
        {qm.domain && (
          <div>
            <div className="h" style={{ marginBottom: 3 }}>Domain</div>
            <span
              className="badge domain"
              style={{ borderColor: domainColor(qm.domain), color: domainColor(qm.domain) }}
            >
              {qm.domain.replace(/_/g, ' ')}
            </span>
            {qm.domain_rationale && (
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--ink-3)',
                  fontFamily: 'var(--mono)',
                  marginTop: 4,
                  lineHeight: 1.4,
                }}
              >
                {qm.domain_rationale}
              </div>
            )}
          </div>
        )}
        {qm.answer_type && (
          <div>
            <div className="h" style={{ marginBottom: 3 }}>Answer type</div>
            <span className="badge atype" style={{ fontSize: 10 }}>
              {qm.answer_type}
            </span>
            {qm.answer_type_rationale && (
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--ink-3)',
                  fontFamily: 'var(--mono)',
                  marginTop: 4,
                  lineHeight: 1.4,
                }}
              >
                {qm.answer_type_rationale}
              </div>
            )}
          </div>
        )}
        {qm.difficulty != null && (
          <div>
            <div className="h" style={{ marginBottom: 3 }}>Difficulty</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 16,
                  fontWeight: 700,
                  color: diffColor(qm.difficulty),
                }}
              >
                {qm.difficulty.toFixed(2)}
              </span>
              <span
                className="badge"
                style={{
                  background: 'var(--bg-2)',
                  color: diffColor(qm.difficulty),
                  border: '1px solid var(--line)',
                }}
              >
                {diffLabel(qm.difficulty)}
              </span>
            </div>
            {qm.difficulty_rationale && (
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--ink-3)',
                  fontFamily: 'var(--mono)',
                  marginTop: 4,
                  lineHeight: 1.4,
                }}
              >
                {qm.difficulty_rationale}
              </div>
            )}
          </div>
        )}
        {qm.gdpr_articles && qm.gdpr_articles.length > 0 && (
          <div>
            <div className="h" style={{ marginBottom: 3 }}>GDPR articles</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {qm.gdpr_articles.map(a => (
                <span key={a} className="badge tier">{a}</span>
              ))}
            </div>
          </div>
        )}
        {qm.ai_act_relevant != null && (
          <div>
            <div className="h" style={{ marginBottom: 3 }}>AI Act relevant</div>
            <span className={'badge ' + (qm.ai_act_relevant ? 'pass' : 'tier')}>
              {qm.ai_act_relevant ? 'yes' : 'no'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
