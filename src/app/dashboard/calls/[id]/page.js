'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Phone,
  Loader2,
  ArrowLeft,
  User,
  Bot,
  CheckCircle,
  XCircle,
  Clock,
  Save,
} from 'lucide-react';
import Link from 'next/link';

const OUTCOME_OPTIONS = [
  { value: 'booked', label: 'Booked', color: 'bg-green-600' },
  { value: 'interested', label: 'Interested', color: 'bg-blue-600' },
  { value: 'not_interested', label: 'Not Interested', color: 'bg-slate-600' },
  { value: 'callback_requested', label: 'Callback Requested', color: 'bg-amber-600' },
  { value: 'voicemail', label: 'Voicemail', color: 'bg-purple-600' },
  { value: 'no_answer', label: 'No Answer', color: 'bg-slate-500' },
  { value: 'error', label: 'Error', color: 'bg-red-600' },
];

export default function CallDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOutcome, setSelectedOutcome] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCall();
  }, [id]);

  async function fetchCall() {
    setLoading(true);
    try {
      const res = await fetch(`/api/calls/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCall(data.call);
        if (data.call.outcome) setSelectedOutcome(data.call.outcome);
        if (data.call.outcome_notes) setNotes(data.call.outcome_notes);
      }
    } catch (err) {
      console.error('Failed to load call:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!selectedOutcome) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/calls/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome: selectedOutcome, outcome_notes: notes }),
      });
      if (res.ok) {
        const data = await res.json();
        setCall(data.call);
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-400" />
      </div>
    );
  }

  if (!call) {
    return (
      <div className="text-center py-20 text-slate-400">
        Call not found
      </div>
    );
  }

  const transcript = call.transcript?.turns || [];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/calls" className="text-slate-400 hover:text-white transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-400" />
            {call.contact_name || call.contact_phone}
          </h1>
          <p className="text-sm text-slate-400">
            {call.call_goal?.replace(/_/g, ' ')} &middot; {call.contact_phone}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Status', value: call.status?.replace(/_/g, ' ') },
          { label: 'Scheduled', value: call.scheduled_for ? new Date(call.scheduled_for).toLocaleString() : '—' },
          { label: 'Duration', value: call.transcript?.duration_seconds ? `${call.transcript.duration_seconds}s` : '—' },
          { label: 'Outcome', value: call.outcome?.replace(/_/g, ' ') || 'Pending' },
        ].map((item) => (
          <div key={item.label} className="bg-slate-800/50 rounded-lg border border-slate-700 p-3">
            <div className="text-xs text-slate-500">{item.label}</div>
            <div className="text-sm text-white font-medium mt-0.5 capitalize">{item.value}</div>
          </div>
        ))}
      </div>

      {transcript.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Transcript</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transcript.map((turn, i) => (
              <div key={i} className={`flex gap-3 ${turn.role === 'agent' ? '' : 'justify-end'}`}>
                {turn.role === 'agent' && (
                  <div className="w-6 h-6 rounded-full bg-green-900/50 flex items-center justify-center shrink-0">
                    <Bot className="h-3.5 w-3.5 text-green-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                    turn.role === 'agent'
                      ? 'bg-slate-700/50 text-slate-200'
                      : 'bg-green-900/30 text-green-200'
                  }`}
                >
                  {turn.text}
                  {turn.timestamp && (
                    <span className="text-xs text-slate-500 ml-2">{turn.timestamp}</span>
                  )}
                </div>
                {turn.role !== 'agent' && (
                  <div className="w-6 h-6 rounded-full bg-blue-900/50 flex items-center justify-center shrink-0">
                    <User className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Operator Override</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {OUTCOME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedOutcome(opt.value)}
              className={`px-3 py-1.5 text-xs rounded-lg transition ${
                selectedOutcome === opt.value
                  ? `${opt.color} text-white`
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this call..."
          rows={3}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
        <button
          onClick={handleSave}
          disabled={saving || !selectedOutcome}
          className="mt-3 flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 transition disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Outcome
        </button>
      </div>
    </div>
  );
}
