'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Link2, CheckCircle, Clock, Copy, ExternalLink, RefreshCw } from 'lucide-react';

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

function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function TelegramEAPage() {
  const [linkData, setLinkData] = useState(null);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [sessions, setSessions] = useState([]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/telegram/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  async function generateLink() {
    setLinkLoading(true);
    setLinkError('');
    try {
      const res = await fetch('/api/telegram/link', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to generate link');
      }
      const data = await res.json();
      setLinkData(data);
    } catch (err) {
      setLinkError(err.message);
    } finally {
      setLinkLoading(false);
    }
  }

  function copyCode() {
    if (!linkData?.code) return;
    navigator.clipboard.writeText(linkData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const connected = sessions.length > 0;
  const recentMessages = messages.slice(0, 20);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 4 }}>
            Telegram EA
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Your executive assistant on Telegram — briefs, metrics, pipeline, and natural language Q&A.
          </p>
        </div>
        <Pill color={connected ? '#22c55e' : '#6b7280'}>
          {connected ? 'CONNECTED' : 'NOT CONNECTED'}
        </Pill>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Sessions', value: sessions.length, icon: Link2 },
          { label: 'Messages', value: messages.length, icon: MessageSquare },
          { label: 'Inbound', value: messages.filter((m) => m.direction === 'inbound').length, icon: CheckCircle },
          { label: 'Last Active', value: sessions[0]?.lastActiveAt ? formatTime(sessions[0].lastActiveAt) : '—', icon: Clock },
        ].map((stat) => (
          <div key={stat.label} className="dark-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <stat.icon size={14} style={{ color: 'var(--emerald-bright)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {stat.label}
              </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-bright)' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Connect Card */}
        <div className="dark-card" style={{ padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 12 }}>
            {connected ? 'Add Another Device' : 'Connect Telegram'}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
            Generate a one-time code, then open the link in Telegram. The code expires in 10 minutes.
          </p>

          {linkData ? (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 18px',
                borderRadius: 10,
                background: 'var(--dark-surface-2)',
                border: '1px solid var(--dark-border)',
                marginBottom: 12,
              }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--emerald-bright)', letterSpacing: '0.15em', fontFamily: 'monospace' }}>
                  {linkData.code}
                </span>
                <button
                  onClick={copyCode}
                  style={{
                    marginLeft: 'auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--dark-border)',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  <Copy size={12} />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <a
                href={linkData.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 8,
                  background: '#2AABEE',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <ExternalLink size={14} />
                Open in Telegram
              </a>
            </div>
          ) : (
            <button
              onClick={generateLink}
              disabled={linkLoading}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--emerald-bright)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: linkLoading ? 'wait' : 'pointer',
                opacity: linkLoading ? 0.7 : 1,
              }}
            >
              {linkLoading ? 'Generating...' : 'Generate Link Code'}
            </button>
          )}
          {linkError && (
            <p style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>{linkError}</p>
          )}
        </div>

        {/* Commands Reference */}
        <div className="dark-card" style={{ padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 12 }}>
            Available Commands
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { cmd: '/brief', desc: "Today's Daily Brief with action items" },
              { cmd: '/metrics', desc: "Today's inbound/outbound interaction counts" },
              { cmd: '/pipeline', desc: 'Pipeline value + top 5 open leads' },
              { cmd: '/help', desc: 'Show all commands' },
            ].map((item) => (
              <div key={item.cmd} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <code style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--emerald-bright)',
                  background: 'rgba(16,185,129,0.08)',
                  padding: '2px 8px',
                  borderRadius: 4,
                  whiteSpace: 'nowrap',
                }}>
                  {item.cmd}
                </code>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.desc}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--dark-border)', paddingTop: 10, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Or just type a question in plain English — powered by Claude Haiku.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Sessions */}
      {sessions.length > 0 && (
        <div className="dark-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)' }}>
              Connected Sessions
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {sessions.length} active
            </span>
          </div>
          {sessions.map((s) => (
            <div key={s.id || s.chatId} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 20px',
              borderBottom: '1px solid var(--dark-border)',
              gap: 12,
            }}>
              <CheckCircle size={14} style={{ color: '#22c55e', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--text-bright)', flex: 1 }}>
                @{s.username || 'unknown'}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Last active: {formatTime(s.lastActiveAt)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Recent Messages */}
      <div className="dark-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)' }}>
              Recent Messages
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
              Last 20
            </span>
          </div>
          <button
            onClick={() => { setMessagesLoading(true); fetchMessages(); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid var(--dark-border)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>

        {messagesLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            Loading...
          </div>
        ) : recentMessages.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No messages yet. Connect Telegram and send a command to get started.
          </div>
        ) : (
          <div>
            {recentMessages.map((msg) => (
              <div key={msg.id} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 20px',
                borderBottom: '1px solid var(--dark-border)',
                gap: 12,
              }}>
                <Pill color={msg.direction === 'inbound' ? '#3b82f6' : '#22c55e'}>
                  {msg.direction === 'inbound' ? 'IN' : 'OUT'}
                </Pill>
                <span style={{
                  fontSize: 13,
                  color: 'var(--text-bright)',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {msg.text || '—'}
                </span>
                <Pill color="#6b7280">
                  {(msg.messageType || 'text').toUpperCase()}
                </Pill>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 120, textAlign: 'right', flexShrink: 0 }}>
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
