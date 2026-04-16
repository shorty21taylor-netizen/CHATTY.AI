'use client';

import { useRef } from 'react';
import { Upload, Trash2, Plus, X } from 'lucide-react';
import {
  Field,
  TextInput,
  Textarea,
} from '@/components/agent/FormPrimitives';

export default function Step6Knowledge({ config, updateConfig }) {
  const fileInput = useRef(null);
  const k = config.knowledge;

  function setK(key, value) {
    updateConfig((c) => ({
      ...c,
      knowledge: { ...c.knowledge, [key]: value },
    }));
  }

  function handleFiles(files) {
    const names = Array.from(files || []).map((f) => ({
      name: f.name,
      size: f.size,
      uploaded_at: new Date().toISOString(),
    }));
    setK('uploaded_files', [...k.uploaded_files, ...names]);
  }

  function removeFile(name) {
    setK(
      'uploaded_files',
      k.uploaded_files.filter((f) => f.name !== name)
    );
  }

  function addFact() {
    setK('quick_facts', [...k.quick_facts, '']);
  }
  function updateFact(i, value) {
    const next = [...k.quick_facts];
    next[i] = value;
    setK('quick_facts', next);
  }
  function removeFact(i) {
    setK('quick_facts', k.quick_facts.filter((_, idx) => idx !== i));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
        Anything written here becomes ground truth the agent can pull from. Upload
        pricing sheets, FAQs, warranties — and pin 10–20 facts that must always be
        accessible.
      </p>

      <Field
        label="Upload knowledge files"
        hint="Pricing sheets, service docs, FAQs, warranty terms"
      >
        <div
          onClick={() => fileInput.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          style={{
            padding: 24,
            borderRadius: 10,
            border: '2px dashed var(--border-strong)',
            background: 'var(--surface-2)',
            textAlign: 'center',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Upload size={20} style={{ color: 'var(--text-muted)' }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-body)' }}>
            Drop files here
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            PDF, DOCX, CSV, TXT — multiple OK
          </div>
        </div>
        <input
          ref={fileInput}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        {k.uploaded_files.length > 0 ? (
          <div
            style={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {k.uploaded_files.map((f) => (
              <div
                key={f.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  fontSize: 12,
                  color: 'var(--text-body)',
                }}
              >
                <span
                  style={{
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {f.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(f.name)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                  }}
                  aria-label="Remove file"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </Field>

      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            marginBottom: 8,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-bright)' }}>
              Quick facts the agent must always know
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              10–20 short factual statements the agent can cite
            </div>
          </div>
          <button
            type="button"
            onClick={addFact}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--primary)',
              background:
                'color-mix(in srgb, var(--primary) 10%, transparent)',
              border:
                '1px solid color-mix(in srgb, var(--primary) 30%, transparent)',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Plus size={12} /> Add fact
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {k.quick_facts.length === 0 ? (
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                fontStyle: 'italic',
                padding: 10,
              }}
            >
              No facts added yet. Click "Add fact" to start.
            </div>
          ) : null}
          {k.quick_facts.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  fontVariantNumeric: 'tabular-nums',
                  minWidth: 22,
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div style={{ flex: 1 }}>
                <TextInput
                  value={f}
                  onChange={(v) => updateFact(i, v)}
                  placeholder="e.g. All roof installs include a 25-year material warranty"
                />
              </div>
              <button
                type="button"
                onClick={() => removeFact(i)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: 6,
                }}
                aria-label="Remove fact"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Field label="Competitor notes" hint="What to say (and never say) about competitors">
        <Textarea
          value={k.competitor_notes}
          onChange={(v) => setK('competitor_notes', v)}
          rows={4}
          placeholder={`Competitor A — cheaper but slow warranty service\nCompetitor B — good but only does insurance work`}
        />
      </Field>
    </div>
  );
}
