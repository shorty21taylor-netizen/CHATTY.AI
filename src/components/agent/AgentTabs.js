'use client';

import Link from 'next/link';

const TABS = [
  { key: 'overview', label: 'Overview', href: '' },
  { key: 'configure', label: 'Configure', href: '/configure' },
  { key: 'simulate', label: 'Simulate', href: '/simulate' },
  { key: 'knowledge', label: 'Knowledge', href: '/knowledge' },
  { key: 'activity', label: 'Activity', href: '/activity' },
];

export function AgentTabs({ agentId, active }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        borderBottom: '1px solid var(--border)',
        marginBottom: 20,
        overflowX: 'auto',
      }}
    >
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <Link
            key={t.key}
            href={`/dashboard/agents/${agentId}${t.href}`}
            style={{
              padding: '10px 14px',
              fontSize: 13,
              fontWeight: 600,
              color: isActive ? 'var(--emerald-bright)' : 'var(--text-muted)',
              textDecoration: 'none',
              borderBottom: isActive
                ? '2px solid var(--emerald-bright)'
                : '2px solid transparent',
              marginBottom: -1,
              whiteSpace: 'nowrap',
              transition: 'color 120ms ease',
            }}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
