'use client';

import { useRef } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import {
  Field,
  Textarea,
  TextInput,
} from '@/components/agent/FormPrimitives';

export default function Step5Templates({ config, updateConfig }) {
  const fileInput = useRef(null);
  const t = config.templates;

  function setT(key, value) {
    updateConfig((c) => ({
      ...c,
      templates: { ...c.templates, [key]: value },
    }));
  }

  function setVariant(id, key, value) {
    updateConfig((c) => ({
      ...c,
      templates: {
        ...c.templates,
        variants: c.templates.variants.map((v) =>
          v.id === id ? { ...v, [key]: value } : v
        ),
      },
    }));
  }

  function handleFiles(files) {
    const names = Array.from(files || []).map((f) => ({
      name: f.name,
      size: f.size,
      uploaded_at: new Date().toISOString(),
    }));
    setT('uploaded_files', [...t.uploaded_files, ...names]);
  }

  function removeFile(name) {
    setT(
      'uploaded_files',
      t.uploaded_files.filter((f) => f.name !== name)
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
        Seed the agent with real messages you'd actually send. The AI will pick
        the best variant per context and show you which is winning.
      </p>

      {/* Upload zone */}
      <Field label="Upload sample messages" hint="CSV, TXT, or DOCX of past texts">
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
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Upload size={20} />
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-body)' }}>
            Drop sample messages here
          </div>
          <div style={{ fontSize: 11 }}>or click to browse</div>
        </div>
        <input
          ref={fileInput}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        {t.uploaded_files.length > 0 ? (
          <div
            style={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {t.uploaded_files.map((f) => (
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
                <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
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

      <Field label="Or paste sample messages">
        <Textarea
          value={t.pasted_examples}
          onChange={(v) => setT('pasted_examples', v)}
          rows={6}
          placeholder={`Separate each example with a blank line.\n\nExample:\n"Hey Patricia — Marcus with Acme Roofing. Saw your inspection request, I have 2pm Thursday open. Want me to grab that for you?"`}
        />
      </Field>

      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginBottom: 4,
          }}
        >
          First message baseline — A / B / C variants
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          Give the agent 3 variations to choose from. Tag each with a scenario.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {t.variants.map((v) => (
            <div
              key={v.id}
              style={{
                padding: 14,
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background:
                      'color-mix(in srgb, var(--emerald-bright) 14%, transparent)',
                    color: 'var(--emerald-bright)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {v.id}
                </span>
                <div style={{ flex: 1 }}>
                  <TextInput
                    value={v.scenario}
                    onChange={(val) => setVariant(v.id, 'scenario', val)}
                    placeholder="Scenario label (e.g. 'Ideal lead', 'Price shopper')"
                  />
                </div>
              </div>
              <Textarea
                value={v.body}
                onChange={(val) => setVariant(v.id, 'body', val)}
                rows={3}
                placeholder={`Variant ${v.id} message body`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
