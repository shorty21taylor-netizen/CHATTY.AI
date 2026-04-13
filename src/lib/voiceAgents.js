// Mock data for the Voice Agents dashboard.
// Used by /dashboard/agents and /dashboard/agents/[id] until a real
// ElevenLabs-backed agents table lands.

export const VOICE_AGENTS = [
  {
    id: 'inbound-sales-agent',
    name: 'Inbound Sales Agent',
    type: 'voice',
    status: 'active',
    description:
      'Picks up every inbound call, qualifies intent, books inspections into the calendar.',
    lastActive: 'active now',
    stats: {
      callsHandled: 142,
      avgDuration: '3m 18s',
      satisfaction: 94,
    },
    voice: {
      preset: 'rachel',
      personality: 'friendly',
    },
  },
  {
    id: 'appointment-setter',
    name: 'Appointment Setter',
    type: 'voice',
    status: 'active',
    description:
      'Outbound dialer that confirms appointments 24h ahead and reschedules on the fly.',
    lastActive: '12 min ago',
    stats: {
      callsHandled: 87,
      avgDuration: '1m 42s',
      satisfaction: 91,
    },
    voice: {
      preset: 'drew',
      personality: 'direct',
    },
  },
  {
    id: 'after-hours-responder',
    name: 'After-Hours Responder',
    type: 'voice',
    status: 'paused',
    description:
      'Answers inbound calls between 6pm and 7am, captures the lead, texts the operator.',
    lastActive: '2h ago',
    stats: {
      callsHandled: 38,
      avgDuration: '2m 04s',
      satisfaction: 88,
    },
    voice: {
      preset: 'clyde',
      personality: 'professional',
    },
  },
];

export const VOICE_AGENT_STATUS = {
  active: {
    label: 'Active',
    color: 'var(--emerald-bright)',
    bg: 'var(--emerald-tint)',
    border: 'rgba(16,185,129,0.3)',
    dot: true,
  },
  paused: {
    label: 'Paused',
    color: '#fbbf24',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.3)',
    dot: false,
  },
  draft: {
    label: 'Draft',
    color: 'var(--text-muted)',
    bg: 'var(--surface-2)',
    border: 'var(--border)',
    dot: false,
  },
};

export function getVoiceAgentById(id) {
  return VOICE_AGENTS.find((a) => a.id === id) || null;
}

// Mock 7-day performance series for any voice agent detail page.
export function getAgentPerformanceSeries() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => ({
    day,
    calls: [18, 22, 27, 31, 29, 14, 11][i],
    satisfaction: [88, 91, 93, 94, 92, 90, 94][i],
    avgDuration: [2.4, 2.6, 3.1, 3.4, 3.2, 2.8, 3.0][i],
  }));
}

export function getRecentCallLog() {
  return [
    {
      id: 'c1',
      caller: 'Marcus Miller',
      phone: '(512) 555-0144',
      duration: '4m 22s',
      outcome: 'Booked inspection',
      outcomeColor: 'emerald',
      date: 'Today, 10:42a',
    },
    {
      id: 'c2',
      caller: 'Priya Patel',
      phone: '(512) 555-0198',
      duration: '2m 08s',
      outcome: 'Transferred to human',
      outcomeColor: 'indigo',
      date: 'Today, 9:11a',
    },
    {
      id: 'c3',
      caller: 'Sam Thompson',
      phone: '(830) 555-0130',
      duration: '1m 34s',
      outcome: 'Qualified lead',
      outcomeColor: 'emerald',
      date: 'Yesterday, 4:55p',
    },
    {
      id: 'c4',
      caller: 'Unknown caller',
      phone: '(737) 555-0011',
      duration: '38s',
      outcome: 'Spam / hung up',
      outcomeColor: 'muted',
      date: 'Yesterday, 2:02p',
    },
    {
      id: 'c5',
      caller: 'Dana Ruiz',
      phone: '(512) 555-0167',
      duration: '5m 11s',
      outcome: 'Rescheduled appointment',
      outcomeColor: 'amber',
      date: 'Apr 11, 11:14a',
    },
  ];
}
