'use client';

import { useEffect, useState } from 'react';
import {
  FileText,
  Loader2,
  MessageSquare,
  Eye,
  X,
  Pencil,
  Plus,
  Lock,
} from 'lucide-react';

const INDUSTRIES = ['roofing', 'hvac', 'solar'];

const USE_CASE_LABELS = {
  lead_intake: 'Lead Intake',
  weather_damage_followup: 'Weather Damage Follow-Up',
  appointment_confirm: 'Appointment Confirmation',
  review_request: 'Review Request',
  emergency_callout: 'Emergency Callout',
  maintenance_reminder: 'Maintenance Reminder',
  quote_followup: 'Quote Follow-Up',
  site_survey_scheduling: 'Site Survey Scheduling',
};

const SAMPLE_VARIABLES = {
  contact_name: 'Sarah Johnson',
  company_name: 'Taylor Roofing Co.',
  service_type: 'roof replacement',
  weather_event: 'hailstorm',
  city: 'Denver',
  weather_date: 'Thursday',
  appointment_date: 'Tuesday, Apr 22',
  appointment_time: '10:00 AM',
  assigned_to: 'Mike Thompson',
  next_available: 'tomorrow morning',
  issue_type: 'AC failure',
  availability_window: 'within 2 hours',
  service_fee: '$89',
  months_since: '6',
  season: 'summer',
  available_dates: 'Monday or Wednesday',
  property_type: 'residential',
  estimated_savings: '127',
  days_ago: '3',
  offset_pct: '94',
  monthly_payment: '189',
  incentive_name: 'Federal ITC',
  incentive_deadline: 'Dec 31',
  review_url: 'https://g.page/review/...',
  sunny_days: '22',
};

function renderPreview(promptText, variables) {
  const vars = Array.isArray(variables) ? variables : [];
  return promptText.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return SAMPLE_VARIABLES[key] || match;
  });
}

function PreviewPanel({ template, onClose }) {
  if (!template) return null;
  const variables = Array.isArray(template.variables) ? template.variables : [];
  const preview = renderPreview(template.prompt_text, variables);

  return (
    <div
      className="dark-card"
      style={{
        position: 'sticky',
        top: 24,
        padding: 0,
        overflow: 'hidden',
        borderColor: 'color-mix(in srgb, var(--primary) 40%, var(--border))',
      }}
    >
      <div
        style={{
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Eye size={14} style={{ color: 'var(--primary)' }} />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-bright)',
            }}
          >
            Preview
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: 4,
          }}
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ padding: 20 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginBottom: 4,
          }}
        >
          {template.name}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 6,
            marginBottom: 14,
          }}
        >
          <span
            style={{
              padding: '2px 7px',
              fontSize: 10,
              fontWeight: 600,
              borderRadius: 4,
              background: 'color-mix(in srgb, #3b82f6 14%, transparent)',
              color: '#3b82f6',
              textTransform: 'capitalize',
            }}
          >
            {template.industry}
          </span>
          <span
            style={{
              padding: '2px 7px',
              fontSize: 10,
              fontWeight: 600,
              borderRadius: 4,
              background: 'color-mix(in srgb, #8b5cf6 14%, transparent)',
              color: '#8b5cf6',
            }}
          >
            {USE_CASE_LABELS[template.use_case] || template.use_case}
          </span>
          {template.is_system && (
            <span
              style={{
                padding: '2px 7px',
                fontSize: 10,
                fontWeight: 600,
                borderRadius: 4,
                background: 'color-mix(in srgb, var(--primary) 14%, transparent)',
                color: 'var(--primary)',
              }}
            >
              SYSTEM
            </span>
          )}
        </div>

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
          Raw Template
        </div>
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 6,
            background: 'color-mix(in srgb, var(--text-muted) 6%, transparent)',
            fontSize: 12,
            lineHeight: 1.6,
            color: 'var(--text-body)',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            marginBottom: 14,
          }}
        >
          {template.prompt_text}
        </div>

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
          Rendered Preview
        </div>
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 6,
            background: 'color-mix(in srgb, var(--primary) 6%, transparent)',
            border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--text-bright)',
            whiteSpace: 'pre-wrap',
            marginBottom: 14,
          }}
        >
          {preview}
        </div>

        {variables.length > 0 && (
          <>
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
              Variables ({variables.length})
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
                  <span
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: 10,
                      marginLeft: 4,
                    }}
                  >
                    = {SAMPLE_VARIABLES[v] || '?'}
                  </span>
                </span>
              ))}
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            type="button"
            className="filter-pill"
            disabled
            title="Editing templates is coming in PR N"
            style={{ opacity: 0.5, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Pencil size={12} />
            Edit
            <Lock size={10} />
          </button>
        </div>

        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>
          v{template.version}
        </div>
      </div>
    </div>
  );
}

function TemplateRow({ template, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      style={{
        width: '100%',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        background: isSelected
          ? 'color-mix(in srgb, var(--primary) 8%, transparent)'
          : 'none',
        border: 'none',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        color: 'var(--text-bright)',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <MessageSquare
          size={14}
          style={{ color: 'var(--primary)', flexShrink: 0 }}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {template.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {USE_CASE_LABELS[template.use_case] || template.use_case}
          </div>
        </div>
      </div>
      <Eye size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
    </button>
  );
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const url =
      filter === 'all'
        ? '/api/templates'
        : `/api/templates?industry=${filter}`;
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setTemplates(d.templates || []);
        setSelected(null);
      })
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
            agents. Select a template to preview with sample data.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
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
          <button
            type="button"
            className="filter-pill"
            disabled
            title="Creating custom templates is coming in PR N"
            style={{ opacity: 0.5, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={12} />
            New Template
            <Lock size={10} />
          </button>
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
          style={{ padding: 40, textAlign: 'center', marginTop: 28 }}
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: selected ? '1fr 400px' : '1fr',
            gap: 20,
            marginTop: 28,
            alignItems: 'start',
          }}
        >
          <div>
            {Object.entries(grouped).map(([industry, items]) => (
              <div key={industry} style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-bright)',
                    marginBottom: 8,
                    textTransform: 'capitalize',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {industry}
                  <span
                    style={{
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      fontWeight: 400,
                    }}
                  >
                    {items.length} template{items.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div
                  className="dark-card"
                  style={{ padding: 0, overflow: 'hidden' }}
                >
                  {items.map((t) => (
                    <TemplateRow
                      key={t.id}
                      template={t}
                      isSelected={selected?.id === t.id}
                      onSelect={setSelected}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <PreviewPanel
              template={selected}
              onClose={() => setSelected(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}
