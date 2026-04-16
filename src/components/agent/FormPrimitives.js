'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, X, Plus, Check, Info, Star } from 'lucide-react';

// ---------------------------------------------------------------------------
// Section — collapsible card
// ---------------------------------------------------------------------------

export function Section({ id, title, description, icon: Icon, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="dark-card"
      id={id}
      style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          padding: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-bright)',
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          {Icon ? (
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'color-mix(in srgb, var(--emerald-bright) 14%, transparent)',
                color: 'var(--emerald-bright)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={15} />
            </span>
          ) : null}
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{title}</span>
            {description ? (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {description}
              </span>
            ) : null}
          </span>
        </span>
        {open ? (
          <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} />
        ) : (
          <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
        )}
      </button>
      {open ? (
        <div
          style={{
            padding: 20,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Field wrapper
// ---------------------------------------------------------------------------

export function Field({ label, hint, children, required }) {
  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        fontSize: 12,
        color: 'var(--text-muted)',
        fontWeight: 500,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        {label}
        {required ? (
          <span style={{ color: 'var(--negative)', marginLeft: 4 }}>*</span>
        ) : null}
      </span>
      {children}
      {hint ? (
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export const inputStyle = {
  width: '100%',
  background: 'var(--input-bg)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '9px 12px',
  fontSize: 13,
  color: 'var(--text-bright)',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 120ms ease',
};

export function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
    />
  );
}

export function NumberInput({ value, onChange, placeholder, min, max, step = 1 }) {
  return (
    <input
      type="number"
      value={value ?? ''}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === '' ? '' : Number(v));
      }}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      style={inputStyle}
    />
  );
}

export function Textarea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        ...inputStyle,
        padding: '10px 12px',
        resize: 'vertical',
        minHeight: 72,
        lineHeight: 1.5,
      }}
    />
  );
}

export function Select({ value, onChange, options }) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, appearance: 'auto' }}
    >
      {options.map((o) => (
        <option key={o.value ?? o} value={o.value ?? o}>
          {o.label ?? o}
        </option>
      ))}
    </select>
  );
}

// ---------------------------------------------------------------------------
// Radio group
// ---------------------------------------------------------------------------

export function RadioGroup({ value, onChange, options, layout = 'horizontal' }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        flexDirection: layout === 'vertical' ? 'column' : 'row',
        flexWrap: 'wrap',
      }}
    >
      {options.map((o) => {
        const v = o.value ?? o;
        const label = o.label ?? o;
        const selected = value === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            style={{
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 500,
              border: `1px solid ${
                selected
                  ? 'color-mix(in srgb, var(--emerald-bright) 50%, var(--border))'
                  : 'var(--border)'
              }`,
              borderRadius: 8,
              background: selected
                ? 'color-mix(in srgb, var(--emerald-bright) 10%, transparent)'
                : 'transparent',
              color: selected ? 'var(--emerald-bright)' : 'var(--text-body)',
              cursor: 'pointer',
              transition: 'all 120ms ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {selected ? <Check size={12} /> : null}
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Multi-select chips
// ---------------------------------------------------------------------------

export function ChipMultiSelect({ value = [], onChange, options }) {
  function toggle(v) {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map((o) => {
        const v = o.value ?? o;
        const label = o.label ?? o;
        const selected = value.includes(v);
        return (
          <button
            key={v}
            type="button"
            onClick={() => toggle(v)}
            style={{
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 500,
              border: `1px solid ${
                selected
                  ? 'color-mix(in srgb, var(--emerald-bright) 50%, var(--border))'
                  : 'var(--border)'
              }`,
              borderRadius: 999,
              background: selected
                ? 'color-mix(in srgb, var(--emerald-bright) 12%, transparent)'
                : 'transparent',
              color: selected ? 'var(--emerald-bright)' : 'var(--text-body)',
              cursor: 'pointer',
              transition: 'all 120ms ease',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toggle switch
// ---------------------------------------------------------------------------

export function Toggle({ value, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        color: 'var(--text-body)',
        fontSize: 13,
      }}
    >
      <span
        style={{
          width: 34,
          height: 20,
          borderRadius: 999,
          background: value ? 'var(--emerald-bright)' : 'var(--border-strong)',
          position: 'relative',
          transition: 'background 120ms ease',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: value ? 16 : 2,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 120ms ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
          }}
        />
      </span>
      {label ? <span>{label}</span> : null}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Checkbox row
// ---------------------------------------------------------------------------

export function Checkbox({ value, onChange, label, hint }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        color: 'var(--text-body)',
        textAlign: 'left',
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          border: `1.5px solid ${
            value ? 'var(--emerald-bright)' : 'var(--border-strong)'
          }`,
          background: value
            ? 'var(--emerald-bright)'
            : 'transparent',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 1,
          transition: 'all 120ms ease',
        }}
      >
        {value ? <Check size={11} color="#fff" strokeWidth={3} /> : null}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-body)' }}>
          {label}
        </span>
        {hint ? (
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{hint}</span>
        ) : null}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Tag input
// ---------------------------------------------------------------------------

export function TagInput({ value = [], onChange, placeholder = 'Add and press Enter' }) {
  const [draft, setDraft] = useState('');
  function add() {
    const v = draft.trim();
    if (!v) return;
    if (value.includes(v)) return setDraft('');
    onChange([...value, v]);
    setDraft('');
  }
  function remove(v) {
    onChange(value.filter((x) => x !== v));
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          style={inputStyle}
        />
        <button
          type="button"
          onClick={add}
          style={{
            padding: '0 14px',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--emerald-bright)',
            background:
              'color-mix(in srgb, var(--emerald-bright) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--emerald-bright) 30%, transparent)',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          <Plus size={14} />
        </button>
      </div>
      {value.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {value.map((tag) => (
            <span
              key={tag}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 4px 4px 10px',
                fontSize: 11,
                fontWeight: 500,
                borderRadius: 999,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-body)',
              }}
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                }}
                aria-label={`Remove ${tag}`}
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slider (1-10)
// ---------------------------------------------------------------------------

export function Slider({ value, onChange, leftLabel, rightLabel, min = 1, max = 10 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'var(--text-muted)',
          fontWeight: 500,
        }}
      >
        <span>{leftLabel}</span>
        <span
          style={{
            color: 'var(--emerald-bright)',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </span>
        <span>{rightLabel}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          accentColor: 'var(--emerald-bright)',
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Star rating picker
// ---------------------------------------------------------------------------

export function StarPicker({ value = 0, onChange }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= value;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i === value ? 0 : i)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 2,
              cursor: 'pointer',
              color: filled ? '#f59e0b' : 'var(--border-strong)',
            }}
          >
            <Star size={22} fill={filled ? '#f59e0b' : 'transparent'} />
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Time input (HH:MM)
// ---------------------------------------------------------------------------

export function TimeInput({ value, onChange }) {
  return (
    <input
      type="time"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, padding: '7px 10px', width: 110 }}
    />
  );
}

// ---------------------------------------------------------------------------
// Progress ring (SVG)
// ---------------------------------------------------------------------------

export function ProgressRing({ value = 0, size = 36, stroke = 4, label }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.max(0, Math.min(100, value)) / 100) * circ;
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
      }}
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--emerald-bright)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {label ? (
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size >= 60 ? 13 : 10,
            fontWeight: 700,
            color: 'var(--text-bright)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tooltip/hint icon
// ---------------------------------------------------------------------------

export function HintIcon({ text }) {
  return (
    <span
      title={text}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        color: 'var(--text-muted)',
        cursor: 'help',
      }}
    >
      <Info size={12} />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

export function StatusBadge({ status }) {
  const MAP = {
    not_configured: { label: 'Not Configured', color: 'var(--text-muted)' },
    draft: { label: 'Draft', color: '#f59e0b' },
    shadow: { label: 'Shadow', color: '#3b82f6' },
    active: { label: 'Active', color: 'var(--emerald-bright)' },
    paused: { label: 'Paused', color: 'var(--text-muted)' },
  };
  const meta = MAP[status] || MAP.not_configured;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        borderRadius: 999,
        color: meta.color,
        background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${meta.color} 30%, transparent)`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: meta.color,
        }}
      />
      {meta.label}
    </span>
  );
}
