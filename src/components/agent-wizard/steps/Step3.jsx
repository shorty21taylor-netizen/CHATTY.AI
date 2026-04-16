'use client';

import { Checkbox, HintIcon } from '@/components/agent/FormPrimitives';
import { CONTEXT_FIELDS } from '@/lib/agents/registry';

export default function Step3Context({ config, updateConfig }) {
  const ctx = config.context || {};

  function set(key, value) {
    updateConfig((c) => ({
      ...c,
      context: { ...c.context, [key]: value },
    }));
  }

  const selectedLabels = CONTEXT_FIELDS.filter((f) => ctx[f.id]).map(
    (f) => f.label
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
        Decide what information the agent sees about each lead before it writes a message.
      </p>

      <div
        className="cw-grid-2"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}
      >
        {CONTEXT_FIELDS.map((f) => (
          <div
            key={f.id}
            style={{
              padding: 12,
              borderRadius: 10,
              border: `1px solid ${
                ctx[f.id]
                  ? 'color-mix(in srgb, var(--emerald-bright) 30%, var(--border))'
                  : 'var(--border)'
              }`,
              background: ctx[f.id]
                ? 'color-mix(in srgb, var(--emerald-bright) 6%, transparent)'
                : 'transparent',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <Checkbox
              value={!!ctx[f.id]}
              onChange={(v) => set(f.id, v)}
              label={f.label}
              hint={f.tooltip}
            />
            <HintIcon text={f.tooltip} />
          </div>
        ))}
      </div>

      <div
        style={{
          padding: 14,
          borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--surface-2)',
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          This is what the AI will see about each lead
        </div>
        {selectedLabels.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            No context selected — the agent will work blind. Enable at least
            Contact info.
          </div>
        ) : (
          <ul
            style={{
              margin: 0,
              padding: '0 0 0 18px',
              fontSize: 13,
              color: 'var(--text-body)',
              lineHeight: 1.7,
            }}
          >
            {selectedLabels.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 760px) {
          :global(.cw-grid-2) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
