'use client';

import { AGENT_TOOLS } from '@/lib/agents/registry';

const MODE_OPTIONS = [
  { value: 'off', label: 'OFF', color: 'var(--text-muted)' },
  { value: 'draft', label: 'DRAFT', color: '#f59e0b' },
  { value: 'auto', label: 'AUTO', color: 'var(--emerald-bright)' },
];

const MODE_HINT = {
  off: 'Agent cannot use this tool',
  draft: 'Agent prepares the action; you approve before it fires',
  auto: 'Agent can use this tool on its own, within guardrails',
};

export default function Step7Tools({ config, updateConfig }) {
  const tools = config.tools || {};
  function set(toolId, value) {
    updateConfig((c) => ({
      ...c,
      tools: { ...c.tools, [toolId]: value },
    }));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
        For each tool, choose whether the agent can use it — and whether it
        needs your sign-off first.
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: 14,
          borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--surface-2)',
        }}
      >
        {AGENT_TOOLS.map((tool) => {
          const current = tools[tool.id] || 'off';
          return (
            <div
              key={tool.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                gap: 12,
                padding: '8px 10px',
                borderRadius: 8,
                background: 'var(--surface-1)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-bright)',
                  }}
                >
                  {tool.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {MODE_HINT[current]}
                </div>
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  gap: 4,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: 2,
                }}
              >
                {MODE_OPTIONS.map((opt) => {
                  const selected = current === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set(tool.id, opt.value)}
                      style={{
                        padding: '5px 11px',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        background: selected
                          ? `color-mix(in srgb, ${opt.color} 18%, transparent)`
                          : 'transparent',
                        color: selected ? opt.color : 'var(--text-muted)',
                        transition: 'all 120ms ease',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
