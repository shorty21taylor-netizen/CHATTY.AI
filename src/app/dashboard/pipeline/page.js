'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GitBranch, ArrowUpRight, TrendingUp } from 'lucide-react';

const STAGES = [
  { id: 'new', label: 'New', count: 18, color: '#818cf8' },
  { id: 'contacted', label: 'Contacted', count: 24, color: '#10b981' },
  { id: 'qualified', label: 'Qualified', count: 14, color: '#fbbf24' },
  { id: 'proposal', label: 'Proposal', count: 9, color: '#fb7185' },
  { id: 'won', label: 'Won', count: 6, color: '#10b981' },
];

export default function PipelinePage() {
  const total = STAGES.reduce((s, st) => s + st.count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 28,
          gap: 16,
        }}
      >
        <div>
          <div
            className="t-eyebrow"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <GitBranch size={11} style={{ color: 'var(--emerald-bright)' }} />
            Sales pipeline
          </div>
          <h1
            className="t-h1"
            style={{ margin: '8px 0 6px', letterSpacing: '-0.01em' }}
          >
            Pipeline
          </h1>
          <p
            className="t-body"
            style={{ color: 'var(--text-muted)', margin: 0, maxWidth: 620 }}
          >
            Track every lead from first touch to closed-won. Drag deals between
            stages, surface stalled opportunities, and forecast revenue with
            confidence.
          </p>
        </div>
        <div
          className="dark-card"
          style={{
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            minWidth: 160,
          }}
        >
          <span className="t-eyebrow">Open deals</span>
          <span
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: 'var(--text-bright)',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1.1,
            }}
          >
            {total}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--emerald-bright)',
              marginTop: 2,
            }}
          >
            <TrendingUp size={11} /> +12% WoW
          </span>
        </div>
      </div>

      {/* Stage strip preview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${STAGES.length}, 1fr)`,
          gap: 12,
          marginBottom: 24,
        }}
      >
        {STAGES.map((stage) => (
          <div
            key={stage.id}
            className="dark-card"
            style={{
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              borderTop: `2px solid ${stage.color}`,
            }}
          >
            <span
              className="t-eyebrow"
              style={{ color: 'var(--text-subtle)' }}
            >
              {stage.label}
            </span>
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: 'var(--text-bright)',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1.1,
              }}
            >
              {stage.count}
            </span>
          </div>
        ))}
      </div>

      {/* Empty / coming-soon card */}
      <div
        className="dark-card"
        style={{
          padding: '48px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 14,
          background:
            'linear-gradient(180deg, var(--surface-1) 0%, rgba(99,102,241,0.04) 100%)',
          border: '1px dashed var(--border)',
        }}
      >
        <span
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background:
              'linear-gradient(135deg, #6366f1, var(--emerald-bright))',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 22px rgba(99,102,241,0.35)',
          }}
        >
          <GitBranch size={22} style={{ color: '#ffffff' }} />
        </span>
        <div className="t-h2" style={{ margin: 0 }}>
          Drag-and-drop pipeline view is coming soon
        </div>
        <p
          className="t-body"
          style={{
            color: 'var(--text-muted)',
            margin: 0,
            maxWidth: 460,
          }}
        >
          For now you can manage individual deals from the CRM. The full Kanban
          board, weighted forecasting, and stage automation land in the next
          release.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 8,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Link
            href="/dashboard/crm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 18px',
              borderRadius: 10,
              background: 'var(--emerald-bright)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
            }}
          >
            Open CRM
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
