import { approachColor, diffColor, domainColor } from '@/lib/colors';
import { diffLabel } from '@/lib/grouping';
import { fmtNum, fmtUSDShort, shortModel, truncate } from '@/lib/format';
import type { PassFilter, PerQRow } from '@/types';

interface Props {
  row: PerQRow;
  metrics: string[];
  hasQuestionsMeta: boolean;
  onOpen: (r: PerQRow) => void;
  onTogglePassFilter: (status: PassFilter) => void;
}

export function PerQuestionRow({
  row: r,
  metrics,
  hasQuestionsMeta,
  onOpen,
  onTogglePassFilter,
}: Props) {
  return (
    <tr onClick={() => onOpen(r)} style={{ cursor: 'pointer' }}>
      <td className="num">{r.question_id}</td>
      <td>
        <span
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: approachColor(r.approach),
            marginRight: 6,
          }}
        />
        {r.approach}
      </td>
      <td className="num" style={{ fontSize: 11 }}>
        {shortModel(r.gen_model)}
      </td>
      <td>
        {r.classTier && (
          <span className="badge tier">{r.classTier.replace(/_/g, ' ')}</span>
        )}
        {r.isGrounded === true && (
          <span className="badge grounded" style={{ marginLeft: 2 }}>✓</span>
        )}
        {r.isGrounded === false && (
          <span className="badge ungrounded" style={{ marginLeft: 2 }}>!</span>
        )}
      </td>

      {hasQuestionsMeta && (
        <td style={{ whiteSpace: 'nowrap' }}>
          {r.qMeta?.domain && (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 2 }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: domainColor(r.qMeta.domain),
                  flexShrink: 0,
                  display: 'inline-block',
                }}
              />
              <span
                style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-2)' }}
              >
                {r.qMeta.domain.replace(/_/g, ' ')}
              </span>
            </div>
          )}
          {r.qMeta?.answer_type && (
            <span className="badge atype">{r.qMeta.answer_type}</span>
          )}
          {!r.qMeta && <span className="muted">—</span>}
        </td>
      )}

      {hasQuestionsMeta && (
        <td className="num">
          {r.qMeta?.difficulty != null ? (
            <span
              style={{
                color: diffColor(r.qMeta.difficulty),
                fontFamily: 'var(--mono)',
                fontSize: 11,
              }}
              title={`${diffLabel(r.qMeta.difficulty)} · ${r.qMeta.difficulty_rationale || ''}`}
            >
              {r.qMeta.difficulty.toFixed(2)}
            </span>
          ) : (
            <span className="muted">—</span>
          )}
        </td>
      )}

      <td style={{ maxWidth: 280 }}>{truncate(r.input, 65)}</td>
      <td className="num">{fmtNum(r.avgScore, 3)}</td>
      {metrics.map(m => {
        const mm = r.metrics[m];
        if (!mm) return <td key={m} className="num muted">—</td>;
        const c = mm.passed
          ? 'var(--pass)'
          : mm.errored
            ? 'var(--warn)'
            : 'var(--fail)';
        return (
          <td key={m} className="num" style={{ color: c }}>
            {fmtNum(mm.score, 2)}
          </td>
        );
      })}
      <td className="num">
        {r.latency != null ? r.latency.toFixed(2) : <span className="muted">—</span>}
      </td>
      <td className="num">
        {r.cost.missing ? <span className="muted">—</span> : fmtUSDShort(r.cost.total)}
        {!r.cost.missing &&
          (r.cost.isReal ? (
            <sup className="real-cost-badge" style={{ marginLeft: 3 }}>R</sup>
          ) : (
            <sup className="est-cost-badge" style={{ marginLeft: 3 }}>E</sup>
          ))}
      </td>
      <td
        onClick={e => {
          e.stopPropagation();
          const s: PassFilter = r.anyErr
            ? 'errored'
            : r.allPass
              ? 'pass'
              : r.partialPass
                ? 'partial'
                : 'fail';
          onTogglePassFilter(s);
        }}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        {r.anyErr && (
          <span className="badge err badge-clickable" title="click to filter">errored</span>
        )}
        {!r.anyErr && r.allPass && (
          <span className="badge pass badge-clickable" title="click to filter">pass</span>
        )}
        {!r.anyErr && r.partialPass && (
          <span className="badge partial badge-clickable" title="click to filter">partial</span>
        )}
        {!r.anyErr && !r.allPass && !r.partialPass && (
          <span className="badge fail badge-clickable" title="click to filter">fail</span>
        )}
      </td>
    </tr>
  );
}
