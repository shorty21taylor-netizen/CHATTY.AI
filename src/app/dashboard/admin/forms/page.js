'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Copy, Check, ToggleLeft, ToggleRight, Trash2, ExternalLink } from 'lucide-react';

function Pill({ color, children }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.08em',
        borderRadius: 999,
        color,
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

export default function AdminFormsPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRedirect, setNewRedirect] = useState('');
  const [copiedSlug, setCopiedSlug] = useState(null);

  const fetchForms = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/forms');
      if (res.ok) {
        const { forms: data } = await res.json();
        setForms(data || []);
      }
    } catch (err) {
      console.error('Failed to load forms:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          redirect_url: newRedirect.trim() || undefined,
        }),
      });
      if (res.ok) {
        setNewName('');
        setNewRedirect('');
        fetchForms();
      }
    } catch (err) {
      console.error('Failed to create form:', err);
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (form) => {
    try {
      await fetch(`/api/admin/forms/${form.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !form.isActive }),
      });
      fetchForms();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const deactivateForm = async (form) => {
    try {
      await fetch(`/api/admin/forms/${form.id}`, { method: 'DELETE' });
      fetchForms();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const copyEmbed = (slug) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/api/forms/${slug}/submit`;
    const snippet = `<form action="${url}" method="POST">
  <input type="text" name="name" placeholder="Your Name" required />
  <input type="email" name="email" placeholder="Email" required />
  <input type="tel" name="phone" placeholder="Phone" />
  <textarea name="message" placeholder="How can we help?"></textarea>
  <div style="position:absolute;left:-9999px" aria-hidden="true">
    <input type="text" name="website_url" tabIndex="-1" autoComplete="off" />
  </div>
  <button type="submit">Submit</button>
</form>`;
    navigator.clipboard.writeText(snippet);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const copyUrl = (slug) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    navigator.clipboard.writeText(`${origin}/api/forms/${slug}/submit`);
    setCopiedSlug(slug + '-url');
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 4 }}>
          Form Configs
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Public form endpoints for your website. Each form creates a contact + lead and triggers the Form Bot agent.
        </p>
      </div>

      {/* Create form */}
      <div className="dark-card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 12 }}>
          New Form
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'end' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
              Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Main Website Contact"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text-bright)',
                fontSize: 13,
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
              Redirect URL (optional)
            </label>
            <input
              type="text"
              value={newRedirect}
              onChange={(e) => setNewRedirect(e.target.value)}
              placeholder="https://yoursite.com/thank-you"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text-bright)',
                fontSize: 13,
              }}
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--primary)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: creating ? 'wait' : 'pointer',
              opacity: !newName.trim() ? 0.5 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            <Plus size={14} /> Create
          </button>
        </div>
      </div>

      {/* Forms list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
          Loading...
        </div>
      ) : forms.length === 0 ? (
        <div className="dark-card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            No forms yet. Create one above to get started.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {forms.map((form) => (
            <div key={form.id} className="dark-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)' }}>
                      {form.name || 'Unnamed Form'}
                    </span>
                    <Pill color={form.isActive ? '#22c55e' : '#6b7280'}>
                      {form.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Pill>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    slug: {form.slug}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => toggleActive(form)}
                    title={form.isActive ? 'Deactivate' : 'Activate'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                  >
                    {form.isActive ? <ToggleRight size={18} color="#22c55e" /> : <ToggleLeft size={18} />}
                  </button>
                  <button
                    onClick={() => deactivateForm(form)}
                    title="Delete (soft)"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {form.redirectUrl && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ExternalLink size={12} /> Redirects to: {form.redirectUrl}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  onClick={() => copyUrl(form.slug)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {copiedSlug === form.slug + '-url' ? <Check size={12} color="#22c55e" /> : <Copy size={12} />}
                  {copiedSlug === form.slug + '-url' ? 'Copied!' : 'Copy URL'}
                </button>
                <button
                  onClick={() => copyEmbed(form.slug)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {copiedSlug === form.slug ? <Check size={12} color="#22c55e" /> : <Copy size={12} />}
                  {copiedSlug === form.slug ? 'Copied!' : 'Copy Embed HTML'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
