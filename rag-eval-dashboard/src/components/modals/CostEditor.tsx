import { useState } from 'react';
import { DEFAULT_COSTS } from '@/lib/cost';
import { ModalShell } from '@/components/common/ModalShell';
import type { CostConfig } from '@/types';

interface Props {
  costs: CostConfig;
  setCosts: (c: CostConfig) => void;
  onClose: () => void;
}

function isValidCostConfig(p: unknown): p is CostConfig {
  if (!p || typeof p !== 'object') return false;
  for (const k of Object.keys(p)) {
    const v = (p as Record<string, unknown>)[k] as
      | { input_per_1m?: unknown; output_per_1m?: unknown }
      | undefined;
    if (
      typeof v?.input_per_1m !== 'number' ||
      typeof v?.output_per_1m !== 'number'
    ) {
      throw new Error(`"${k}" needs input_per_1m and output_per_1m`);
    }
  }
  return true;
}

export function CostEditor({ costs, setCosts, onClose }: Props) {
  const [text, setText] = useState<string>(JSON.stringify(costs, null, 2));
  const [err, setErr] = useState<string | null>(null);

  const apply = (): void => {
    try {
      const parsed: unknown = JSON.parse(text);
      if (isValidCostConfig(parsed)) {
        setCosts(parsed);
        onClose();
      }
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  return (
    <ModalShell onClose={onClose} maxWidth={640}>
      <header>
        <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 20 }}>
          Pricing config
        </div>
        <button className="close" onClick={onClose}>✕</button>
      </header>
      <div className="body">
        <div
          className="muted"
          style={{ marginBottom: 10, fontSize: 12, fontFamily: 'var(--mono)' }}
        >
          Edit as JSON. Prices in USD per million tokens.
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          style={{
            width: '100%',
            height: 280,
            fontFamily: 'var(--mono)',
            fontSize: 12,
            padding: 10,
            border: '1px solid var(--line)',
            borderRadius: 2,
            background: 'var(--bg-2)',
            color: 'var(--ink)',
            resize: 'vertical',
          }}
        />
        {err && <div className="err-banner">{err}</div>}
        <div
          className="row"
          style={{ justifyContent: 'flex-end', marginTop: 14, gap: 8 }}
        >
          <button
            className="pill-btn"
            onClick={() => setText(JSON.stringify(DEFAULT_COSTS, null, 2))}
          >
            reset to defaults
          </button>
          <button className="pill-btn on" onClick={apply}>
            apply
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
