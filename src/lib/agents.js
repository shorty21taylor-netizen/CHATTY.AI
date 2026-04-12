// Catalog of Chatty agents. Used by /dashboard/agents and /dashboard/agents/[id].
// Icons are referenced by lucide-react name so pages can import them lazily.

export const PILLARS = [
  {
    tag: 'CAPTURE',
    title: 'Capture',
    description: 'Never miss a lead. Never lose a first impression.',
  },
  {
    tag: 'CONVERT',
    title: 'Convert',
    description: 'Turn estimates into signed contracts.',
  },
  {
    tag: 'RECLAIM',
    title: 'Reclaim',
    description: 'Resurrect leads that already slipped away.',
  },
];

export const AGENTS = [
  // CAPTURE
  {
    id: 'inbound-qualifier',
    name: 'Inbound Call Qualifier',
    pillar: 'CAPTURE',
    icon: 'Phone',
    description: 'Answers every call, qualifies leads, books estimates.',
    status: 'active',
    voiceNotes: false,
    featured: false,
  },
  {
    id: 'speed-to-lead',
    name: 'Speed-to-Lead',
    pillar: 'CAPTURE',
    icon: 'Zap',
    description: 'Contacts web leads in under 60 seconds via call + SMS.',
    status: 'active',
    voiceNotes: false,
    featured: false,
  },
  {
    id: 'sms-concierge',
    name: 'SMS Concierge',
    pillar: 'CAPTURE',
    icon: 'MessageSquare',
    description: 'Two-way texting that books appointments automatically.',
    status: 'paused',
    voiceNotes: false,
    featured: false,
  },

  // CONVERT
  {
    id: 'appointment-confirmation',
    name: 'Appointment Confirmation',
    pillar: 'CONVERT',
    icon: 'CheckCircle',
    description: '24hr confirms, reschedules on the fly.',
    status: 'active',
    voiceNotes: false,
    featured: false,
  },
  {
    id: 'no-show-rescue',
    name: 'No-Show Rescue',
    pillar: 'CONVERT',
    icon: 'AlertCircle',
    description: 'Calls within 5 min of missed appointments.',
    status: 'active',
    voiceNotes: false,
    featured: false,
  },
  {
    id: 'estimate-follow-up',
    name: 'Estimate Follow-Up',
    pillar: 'CONVERT',
    icon: 'FileText',
    description: '14-day structured follow-up on every bid.',
    status: 'active',
    voiceNotes: false,
    featured: true,
  },
  {
    id: 'objection-handler',
    name: 'Objection Handler',
    pillar: 'CONVERT',
    icon: 'Shield',
    description: 'SMS responses for price, timing, and spouse objections.',
    status: 'not_configured',
    voiceNotes: false,
    featured: false,
  },

  // RECLAIM
  {
    id: 'dead-lead-reactivation',
    name: 'Dead Lead Reactivation',
    pillar: 'RECLAIM',
    icon: 'Repeat',
    description: '90/180-day sequences with AI voice notes.',
    status: 'active',
    voiceNotes: true,
    featured: false,
  },
  {
    id: 'ghosted-bid-reopener',
    name: 'Ghosted Bid Reopener',
    pillar: 'RECLAIM',
    icon: 'RotateCw',
    description: 'Reawakens stalled estimates with personalized voice notes.',
    status: 'active',
    voiceNotes: true,
    featured: false,
  },
  {
    id: 'old-customer-reengagement',
    name: 'Old Customer Re-engagement',
    pillar: 'RECLAIM',
    icon: 'Users',
    description: 'Nurtures past customers for upgrades and upsells.',
    status: 'not_configured',
    voiceNotes: true,
    featured: false,
  },
];

export function getAgentById(id) {
  return AGENTS.find((a) => a.id === id) || null;
}

export function agentsByPillar(pillarTag) {
  return AGENTS.filter((a) => a.pillar === pillarTag);
}

export const STATUS_META = {
  active: { label: 'Active', color: 'var(--emerald-bright)', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)' },
  paused: { label: 'Paused', color: '#8a9290', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
  not_configured: { label: 'Not Configured', color: '#c9a961', bg: 'rgba(201,169,97,0.12)', border: 'rgba(201,169,97,0.3)' },
};
