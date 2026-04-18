'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen,
  Loader2,
  Play,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState(null);
  const [deriving, setDeriving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchPlaybooks();
  }, []);

  async function fetchPlaybooks() {
    setLoading(true);
    try {
      const res = await fetch('/api/playbooks');
      if (res.ok) {
        const data = await res.json();
        setPlaybooks(data.playbooks || []);
      }
    } catch (err) {
      console.error('Failed to load playbooks:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRun(id) {
    setRunningId(id);
    try {
      const res = await fetch(`/api/playbooks/${id}/run`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(`Dispatched ${data.dispatched} agent steps`, 'success');
        fetchPlaybooks();
      } else {
        const err = await res.json();
        showToast(err.error || 'Run failed', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setRunningId(null);
    }
  }

  function showToast(message, type = 'info') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  function formatSteps(steps) {
    if (!Array.isArray(steps)) return [];
    return steps;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-amber-400" />
            Operator Playbooks
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Proven sequences your agents can replay. Derived from your best outcomes.
          </p>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm ${
            toast.type === 'success'
              ? 'bg-green-900/90 text-green-200 border border-green-700'
              : 'bg-red-900/90 text-red-200 border border-red-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          {toast.message}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        </div>
      ) : playbooks.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-12 text-center">
          <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Playbooks Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Playbooks are derived automatically from your successful signal sequences.
            Once you have 30+ days of CRM activity, the system will identify patterns
            and propose replayable playbooks.
          </p>
          <p className="text-xs text-slate-500">
            The nightly memory graph build runs playbook inference every Sunday at 2am UTC.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playbooks.map((pb) => {
            const steps = formatSteps(pb.steps);
            const isRunning = runningId === pb.id;

            return (
              <div
                key={pb.id}
                className="bg-slate-800/50 rounded-xl border border-slate-700 p-5 hover:border-slate-600 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">{pb.name}</h3>
                    {pb.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{pb.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRun(pb.id)}
                    disabled={isRunning}
                    className="ml-3 flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-500 transition disabled:opacity-50"
                  >
                    {isRunning ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                    Run Now
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {steps.length} steps
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {pb.success_count} runs
                  </span>
                  {pb.last_run_at && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last: {new Date(pb.last_run_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {steps.length > 0 && (
                  <div className="space-y-1.5">
                    {steps.slice(0, 4).map((step, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs bg-slate-700/40 rounded px-2 py-1"
                      >
                        <span className="text-slate-500 font-mono w-4">{i + 1}.</span>
                        <span className="text-amber-300 font-medium">{step.agentType}</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-slate-400">{step.action}</span>
                        {step.delaySeconds > 0 && (
                          <span className="text-slate-600 ml-auto">
                            +{Math.round(step.delaySeconds / 60)}m
                          </span>
                        )}
                      </div>
                    ))}
                    {steps.length > 4 && (
                      <p className="text-xs text-slate-600 pl-6">
                        +{steps.length - 4} more steps
                      </p>
                    )}
                  </div>
                )}

                {!pb.is_active && (
                  <div className="mt-2 text-xs text-slate-500 bg-slate-700/30 rounded px-2 py-1 inline-block">
                    Inactive
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
