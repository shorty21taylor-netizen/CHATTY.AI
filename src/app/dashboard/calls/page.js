'use client';

import { useEffect, useState } from 'react';
import {
  Phone,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  PhoneForwarded,
  Voicemail,
  CalendarCheck,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

const STATUS_CONFIG = {
  queued: { label: 'Queued', color: 'bg-slate-500', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-500', icon: PhoneForwarded },
  completed: { label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
  failed: { label: 'Failed', color: 'bg-red-500', icon: XCircle },
  no_answer: { label: 'No Answer', color: 'bg-amber-500', icon: AlertTriangle },
  voicemail: { label: 'Voicemail', color: 'bg-purple-500', icon: Voicemail },
};

const OUTCOME_CONFIG = {
  booked: { label: 'Booked', color: 'text-green-400' },
  interested: { label: 'Interested', color: 'text-blue-400' },
  not_interested: { label: 'Not Interested', color: 'text-slate-400' },
  callback_requested: { label: 'Callback', color: 'text-amber-400' },
  voicemail: { label: 'Voicemail', color: 'text-purple-400' },
  no_answer: { label: 'No Answer', color: 'text-slate-500' },
  error: { label: 'Error', color: 'text-red-400' },
};

const GOAL_LABELS = {
  reengage_lead: 'Re-engage Lead',
  confirm_appointment: 'Confirm Appointment',
  followup_quote: 'Follow Up Quote',
  custom: 'Custom Call',
};

const TABS = ['all', 'queued', 'in_progress', 'completed'];

export default function CallsPage() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    fetchCalls();
  }, []);

  async function fetchCalls() {
    setLoading(true);
    try {
      const res = await fetch('/api/calls');
      if (res.ok) {
        const data = await res.json();
        setCalls(data.calls || []);
      }
    } catch (err) {
      console.error('Failed to load calls:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = tab === 'all'
    ? calls
    : calls.filter((c) => {
        if (tab === 'completed') return ['completed', 'failed', 'no_answer', 'voicemail'].includes(c.status);
        return c.status === tab;
      });

  const counts = {
    all: calls.length,
    queued: calls.filter((c) => c.status === 'queued').length,
    in_progress: calls.filter((c) => c.status === 'in_progress').length,
    completed: calls.filter((c) => ['completed', 'failed', 'no_answer', 'voicemail'].includes(c.status)).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Phone className="h-6 w-6 text-green-400" />
            Outbound Calls
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Proactive calls via ElevenLabs Conversational AI
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              tab === t
                ? 'bg-green-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {t === 'all' ? 'All' : t === 'in_progress' ? 'Active' : t.charAt(0).toUpperCase() + t.slice(1)}
            <span className="ml-1.5 text-xs opacity-70">({counts[t]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-green-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-12 text-center">
          <Phone className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Calls Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Outbound calls are triggered from Daily Brief recommendations or manually via the API.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((call) => {
            const statusCfg = STATUS_CONFIG[call.status] || STATUS_CONFIG.queued;
            const StatusIcon = statusCfg.icon;
            const outcomeCfg = call.outcome ? OUTCOME_CONFIG[call.outcome] : null;

            return (
              <Link
                key={call.id}
                href={`/dashboard/calls/${call.id}`}
                className="block bg-slate-800/50 rounded-lg border border-slate-700 p-4 hover:border-slate-600 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full ${statusCfg.color}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm truncate">
                          {call.contact_name || call.contact_phone}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-slate-700 rounded text-slate-300">
                          {GOAL_LABELS[call.call_goal] || call.call_goal}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {call.contact_phone}
                        {call.scheduled_for && (
                          <span className="ml-2">
                            Scheduled: {new Date(call.scheduled_for).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs shrink-0">
                    {outcomeCfg && (
                      <span className={`font-medium ${outcomeCfg.color}`}>
                        {outcomeCfg.label}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-slate-400">
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusCfg.label}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
