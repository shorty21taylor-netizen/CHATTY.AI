'use client';

import { useEffect, useState } from 'react';
import { FileText, Loader2, ChevronDown, MessageSquare } from 'lucide-react';

const INDUSTRIES = ['roofing', 'hvac', 'solar'];

const USE_CASE_LABELS = {
  lead_intake_script: 'Lead Intake Script',
  appointment_confirmation: 'Appointment Confirmation',
  review_request: 'Review Request',
  weather_triggered_outreach: 'Weather-Triggered Outreach',
};

function TemplateCard({ template }) {
  const [expanded, setExpanded] = useState(false);
  const variables = Array.isArray(template.variables) ? template.variables : [];

  return (
    <div
      className="dark-card"
      style={{
        padding: 0,
        overflow: 'hidden',
        borderColor: expanded
          ? 'color-mix(in srgb, var(--primary) 40%, var(--border))'
          : 'var(--border)',
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-bright)',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MessageSquare
            size={14}
            style={{ color: 'var(--primary)', flexShrink: 0 }}
          />
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            {USE_CASE_LABELS[template.use_case] || template.use_case}
          </span>
        </div>
        <ChevronDown
          size={14}
          style={{
            color: 'var(--text-muted)',
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 200ms',
          }}
        />
      </button>

      {expanded && (
        <div
          style={{
            padding: '0 20px 16px',
            borderTop: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              marginTop: 14,
              padding: '12px 14px',
              borderRadius: 8,
              background: 'color-mix(in srgb, var(--text-muted) 6%, transparent)',
              fontSize: 13,
              lineHeight: 1.6,
              color: 'var(--text-body)',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
            }}
          >
            {template.prompt_text}
          </div>

          {variables.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 6,
                }}
              >
                Variables
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {variables.map((v) => (
                  <span
                    key={v}
                    style={{
                      padding: '3px 8px',
                      fontSize: 11,
                      fontWeight: 500,
                      borderRadius: 4,
                      background:
                        'color-mix(in srgb, var(--primary) 12%, transparent)',
                      color: 'var(--primary)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {'{{' + v + '}}'}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: 10,
              fontSize: 11,
              color: 'var(--text-muted)',
            }}
          >
            Version {template.version}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const url =
      filter === 'all'
        ? '/api/templates'
        : `/api/templates?industry=${filter}`;
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates || []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const grouped = {};
  for (const t of templates) {
    if (!grouped[t.industry]) grouped[t.industry] = [];
    grouped[t.industry].push(t);
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div className="t-eyebrow">Templates</div>
          <h1 className="t-h1" style={{ margin: '8px 0 6px' }}>
            Industry Prompt Templates
          </h1>
          <p className="t-body-sm" style={{ margin: 0 }}>
            Pre-built message templates used by the Decision Engine and AI
            agents. Organized by industry and use case.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['all', ...INDUSTRIES].map((ind) => (
            <button
              key={ind}
              type="button"
              className="filter-pill"
              onClick={() => setFilter(ind)}
              style={{
                background:
                  filter === ind
                    ? 'color-mix(in srgb, var(--primary) 16%, transparent)'
                    : undefined,
                color: filter === ind ? 'var(--primary)' : undefined,
                borderColor:
                  filter === ind
                    ? 'color-mix(in srgb, var(--primary) 40%, var(--border))'
                    : undefined,
                textTransform: 'capitalize',
              }}
            >
              {ind === 'all' ? 'All Industries' : ind}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div
          style={{
            padding: 60,
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <Loader2
            size={24}
            style={{ animation: 'spin 1s linear infinite' }}
          />
          <div style={{ marginTop: 12, fontSize: 13 }}>
            Loading templates&hellip;
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : templates.length === 0 ? (
        <div
          className="dark-card"
          style={{
            padding: 40,
            textAlign: 'center',
            marginTop: 28,
          }}
        >
          <FileText
            size={28}
            style={{ color: 'var(--text-muted)', marginBottom: 12 }}
          />
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-bright)',
              marginBottom: 4,
            }}
          >
            No templates found
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Templates will appear once the database migration has been applied.
          </div>
        </div>
      ) : (
        Object.entries(grouped).map(([industry, items]) => (
          <div key={industry} style={{ marginTop: 28 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-bright)',
                marginBottom: 12,
                textTransform: 'capitalize',
              }}
            >
              {industry}
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  fontWeight: 400,
                  marginLeft: 8,
                }}
              >
                {items.length} template{items.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {items.map((t) => (
                <TemplateCard key={t.id} template={t} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
