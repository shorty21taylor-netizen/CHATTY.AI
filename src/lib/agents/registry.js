// Single source of truth for the 11 agents surfaced in the configuration
// wizard. Each entry is UI metadata + sensible default config values. The
// shape of `defaultConfig` is intentionally clean JSON so it maps directly
// into a Postgres `agent_configs` table later (no runtime behind it yet).

import {
  Zap,
  FileText,
  MessageSquare,
  FileCheck,
  Calendar,
  Shield,
  Star,
  RotateCcw,
  Send,
  Users,
  MessageCircle,
} from 'lucide-react';

export const AGENT_TYPES = [
  {
    id: 'instant-lead-response',
    name: 'Instant Lead Response',
    pillar: 'capture',
    icon: Zap,
    color: 'var(--emerald-bright)',
    accent: 'emerald',
    description: 'Responds to new leads in under 60 seconds via SMS',
    missionDefault:
      'Respond to every new lead with a personalized SMS within 60 seconds, confirm the service they need, and book them onto the calendar.',
    successMetrics: [
      { id: 'response_time', label: 'Avg response time (seconds)' },
      { id: 'response_rate', label: 'Reply rate (%)' },
      { id: 'booking_rate', label: 'Booked-from-lead rate (%)' },
    ],
    defaultEventType: 'lead_received',
    simulationScenarios: [
      'Ideal Lead',
      'Hostile Lead',
      'Tire Kicker',
      'Competitor Shopper',
      'Wrong Service Area',
    ],
  },
  {
    id: 'form-bot',
    name: 'Form Bot',
    pillar: 'capture',
    icon: FileText,
    color: '#3b82f6',
    accent: 'emerald',
    description: 'Captures and qualifies web form submissions instantly',
    missionDefault:
      'The moment a website form is submitted, acknowledge it and ask the 2–3 qualifying questions needed to route the lead correctly.',
    successMetrics: [
      { id: 'qualification_rate', label: 'Qualified rate (%)' },
      { id: 'response_time', label: 'Time to first reply' },
      { id: 'completion_rate', label: 'Form-to-conversation rate (%)' },
    ],
    defaultEventType: 'form_submitted',
    simulationScenarios: [
      'Complete Form',
      'Partial Form',
      'Spam Submission',
      'High-Value Lead',
      'Out of Service Area',
    ],
  },
  {
    id: 'social-dm-agent',
    name: 'Social DM Agent',
    pillar: 'capture',
    icon: MessageSquare,
    color: '#8b5cf6',
    accent: 'emerald',
    description: 'Monitors and replies to Facebook / Instagram DMs',
    missionDefault:
      'Reply to every inbound Facebook or Instagram DM in under 2 minutes during business hours and route serious buyers into SMS.',
    successMetrics: [
      { id: 'reply_rate', label: 'Reply rate (%)' },
      { id: 'response_time', label: 'Avg response time' },
      { id: 'conversion_rate', label: 'DM → SMS conversion (%)' },
    ],
    defaultEventType: 'social_dm_received',
    simulationScenarios: [
      'Polite Inquiry',
      'Price Shopper',
      'Spam / Solicitation',
      'Angry Comment',
      'Serious Buyer',
    ],
  },
  {
    id: 'quote-follow-up',
    name: 'Quote Follow-Up',
    pillar: 'convert',
    icon: FileCheck,
    color: 'var(--emerald-bright)',
    accent: 'indigo',
    description: 'Follows up on sent quotes until they close or decline',
    missionDefault:
      'Nudge every sent quote through the decision process with a proven cadence until it closes, declines, or is explicitly paused.',
    successMetrics: [
      { id: 'close_rate', label: 'Quote close rate (%)' },
      { id: 'response_rate', label: 'Reply rate on follow-ups (%)' },
      { id: 'time_to_close', label: 'Avg time to close' },
    ],
    defaultEventType: 'quote_sent',
    simulationScenarios: [
      'Interested but Stalling',
      'Needs Financing',
      'Price Objection',
      'Gone Silent',
      'Comparing Bids',
    ],
  },
  {
    id: 'appointment-setter',
    name: 'Appointment Setter',
    pillar: 'convert',
    icon: Calendar,
    color: '#8b5cf6',
    accent: 'indigo',
    description: 'Books inspections and consultations automatically',
    missionDefault:
      'Turn qualified leads into booked inspections by proposing 2–3 time slots and confirming the appointment on the calendar.',
    successMetrics: [
      { id: 'booking_rate', label: 'Booking rate (%)' },
      { id: 'show_rate', label: 'Show rate (%)' },
      { id: 'time_to_book', label: 'Time from qualified → booked' },
    ],
    defaultEventType: 'lead_qualified',
    simulationScenarios: [
      'Ready to Book',
      'Needs Evening Slot',
      'Keeps Rescheduling',
      'No Preference',
      'Wants Quote First',
    ],
  },
  {
    id: 'objection-handler',
    name: 'Objection Handler',
    pillar: 'convert',
    icon: Shield,
    color: '#f59e0b',
    accent: 'indigo',
    description: 'Handles common objections with proven responses',
    missionDefault:
      'When a lead voices an objection, respond with an empathetic, factual rebuttal that moves the conversation forward without promising anything unauthorized.',
    successMetrics: [
      { id: 'resolution_rate', label: 'Objections resolved (%)' },
      { id: 'win_after_objection', label: 'Win rate after objection (%)' },
      { id: 'avg_touches', label: 'Avg touches to resolve' },
    ],
    defaultEventType: 'objection_detected',
    simulationScenarios: [
      'Price Too High',
      'Using Another Contractor',
      'Bad Timing',
      'Spouse Needs to Approve',
      'Negative Review Concern',
    ],
  },
  {
    id: 'review-request',
    name: 'Review Request',
    pillar: 'convert',
    icon: Star,
    color: 'var(--emerald-bright)',
    accent: 'indigo',
    description: 'Asks happy customers for Google / Yelp reviews',
    missionDefault:
      'Three days after a job is completed and paid, ask the customer for a Google review with a direct link.',
    successMetrics: [
      { id: 'review_rate', label: 'Review completion rate (%)' },
      { id: 'avg_rating', label: 'Avg star rating received' },
      { id: 'response_rate', label: 'SMS reply rate (%)' },
    ],
    defaultEventType: 'job_completed',
    simulationScenarios: [
      'Delighted Customer',
      'Neutral Customer',
      'Unresponsive Customer',
      'Unhappy Customer',
      'Already Reviewed',
    ],
  },
  {
    id: 'dead-lead-reactivation',
    name: 'Dead Lead Reactivation',
    pillar: 'reclaim',
    icon: RotateCcw,
    color: '#3b82f6',
    accent: 'amber',
    description: 'Re-engages cold leads with personalized outreach',
    missionDefault:
      'Wake up leads that have gone cold for 30+ days with a short, relevant message tied to season or new offer — never pushy.',
    successMetrics: [
      { id: 'reactivation_rate', label: 'Reactivation rate (%)' },
      { id: 'reply_rate', label: 'Reply rate (%)' },
      { id: 'revenue_recovered', label: 'Revenue recovered' },
    ],
    defaultEventType: 'no_contact_30d',
    simulationScenarios: [
      'Dormant Hot Lead',
      'Unsubscribe Request',
      'Changed Mind',
      'Still Interested',
      'Already Hired Someone',
    ],
  },
  {
    id: 'ghosted-bid-follow-up',
    name: 'Ghosted Bid Follow-Up',
    pillar: 'reclaim',
    icon: Send,
    color: '#ec4899',
    accent: 'amber',
    description: 'Follows up on proposals that went silent',
    missionDefault:
      'When a sent proposal has had no response in 7+ days, re-open the conversation with a short, respectful check-in.',
    successMetrics: [
      { id: 'recovery_rate', label: 'Ghosted-bid recovery (%)' },
      { id: 'reply_rate', label: 'Reply rate (%)' },
      { id: 'revenue_recovered', label: 'Revenue recovered' },
    ],
    defaultEventType: 'quote_no_reply_7d',
    simulationScenarios: [
      'Forgot to Reply',
      'Chose Competitor',
      'Needs More Time',
      'Price Too High',
      'Project Cancelled',
    ],
  },
  {
    id: 'past-customer-reengagement',
    name: 'Past Customer Re-engagement',
    pillar: 'reclaim',
    icon: Users,
    color: '#14b8a6',
    accent: 'amber',
    description: 'Reaches out to past customers for repeat business',
    missionDefault:
      '12–18 months after a completed job, reach out to past customers with a maintenance check, referral ask, or seasonal offer.',
    successMetrics: [
      { id: 'rebook_rate', label: 'Rebook rate (%)' },
      { id: 'referral_rate', label: 'Referral rate (%)' },
      { id: 'revenue_generated', label: 'Revenue generated' },
    ],
    defaultEventType: 'past_customer_12mo',
    simulationScenarios: [
      'Loyal Repeat',
      'Referral Source',
      'Happy But Silent',
      'Past Issue Unresolved',
      'Moved Away',
    ],
  },
  {
    id: 'telegram-ea',
    name: 'Telegram EA',
    pillar: 'executive',
    icon: MessageCircle,
    color: 'var(--emerald-bright)',
    accent: 'emerald',
    description:
      'Your executive assistant on Telegram — ask anything about the business',
    missionDefault:
      'Be the owner’s always-available executive assistant on Telegram: answer business questions, summarize data, and take instructions.',
    successMetrics: [
      { id: 'questions_answered', label: 'Questions answered' },
      { id: 'response_time', label: 'Avg response time' },
      { id: 'owner_satisfaction', label: 'Owner rating' },
    ],
    defaultEventType: 'telegram_message',
    simulationScenarios: [
      'Owner Asks for Pipeline',
      'Owner Forwards a Lead',
      'Urgent Escalation',
      'Routine Update Request',
      'Personal / Off-Topic',
    ],
  },
];

export function getAgentById(id) {
  return AGENT_TYPES.find((a) => a.id === id);
}

// Tools the wizard exposes on Step 7 — agent-agnostic for now. Each tool has
// three modes per agent: OFF / DRAFT (queued for owner approval) / AUTO.
export const AGENT_TOOLS = [
  { id: 'send_sms', label: 'Send SMS', default: 'draft' },
  { id: 'send_email', label: 'Send email', default: 'off' },
  { id: 'book_appointment', label: 'Book appointment', default: 'draft' },
  {
    id: 'update_contact_status',
    label: 'Update contact status',
    default: 'auto',
  },
  { id: 'create_proposal_draft', label: 'Create proposal draft', default: 'off' },
  {
    id: 'send_existing_proposal',
    label: 'Send existing proposal',
    default: 'off',
  },
  { id: 'outbound_voice_call', label: 'Outbound voice call', default: 'off' },
  { id: 'query_database', label: 'Query database', default: 'auto' },
  { id: 'escalate_to_human', label: 'Escalate to human', default: 'auto' },
  { id: 'tag_contact', label: 'Tag contact', default: 'auto' },
];

export const CONTEXT_FIELDS = [
  {
    id: 'contact_info',
    label: 'Contact info',
    default: true,
    tooltip: 'Name, phone, email, address',
  },
  {
    id: 'previous_interactions',
    label: 'Previous interactions',
    default: true,
    tooltip: 'Every past call, SMS, email, note',
  },
  {
    id: 'source_utm',
    label: 'Source & UTM',
    default: true,
    tooltip: 'How the lead found you (Google Ads, referral, etc.)',
  },
  {
    id: 'property_data',
    label: 'Property data',
    default: false,
    tooltip: 'Property type, age, last service (when available)',
  },
  {
    id: 'weather',
    label: 'Weather',
    default: false,
    tooltip: 'Local weather and recent storms (roofing / exteriors)',
  },
  {
    id: 'time_since_first_contact',
    label: 'Time since first contact',
    default: true,
    tooltip: 'How long this lead has been in your CRM',
  },
  {
    id: 'prior_proposals',
    label: 'Prior proposals',
    default: true,
    tooltip: 'Any quote ever sent to this contact',
  },
  {
    id: 'competitor_activity',
    label: 'Competitor activity',
    default: false,
    tooltip: 'Known competitor touches for this contact',
  },
];

export const WIZARD_STEPS = [
  { id: 1, key: 'mission', label: 'Mission' },
  { id: 2, key: 'triggers', label: 'Triggers' },
  { id: 3, key: 'context', label: 'Context' },
  { id: 4, key: 'voice', label: 'Voice & Tone' },
  { id: 5, key: 'templates', label: 'Message Templates' },
  { id: 6, key: 'knowledge', label: 'Knowledge Base' },
  { id: 7, key: 'tools', label: 'Tools' },
  { id: 8, key: 'guardrails', label: 'Guardrails' },
  { id: 9, key: 'escalation', label: 'Human Escalation' },
  { id: 10, key: 'simulation', label: 'Simulation' },
  { id: 11, key: 'activation', label: 'Activation' },
];

// Initial agent config — clean JSON shape, future Postgres-ready.
export function buildDefaultAgentConfig(agent) {
  return {
    agent_id: agent.id,
    version: 1,
    status: 'not_configured', // not_configured | draft | shadow | active | paused
    completeness: {}, // stepKey -> boolean completed
    mission: {
      statement: agent.missionDefault,
      success_metric: agent.successMetrics?.[0]?.id || null,
      non_negotiable: '',
    },
    triggers: {
      event_type: agent.defaultEventType || 'lead_received',
      source_filters: [], // ['google_ads','facebook']
      service_type_filter: [],
      time_window: 'business_hours', // business_hours | anytime | custom
      custom_window: { start: '07:00', end: '20:00' },
      cooldown: { value: 24, unit: 'hours' },
      max_daily_firings: 50,
    },
    context: Object.fromEntries(CONTEXT_FIELDS.map((c) => [c.id, c.default])),
    voice: {
      mode: 'inherit', // inherit | custom
      formality: 5, // 1 Formal ↔ 10 Casual
      verbosity: 4, // 1 Concise ↔ 10 Detailed
      warmth: 6, // 1 Warm ↔ 10 Direct
    },
    templates: {
      uploaded_files: [],
      pasted_examples: '',
      variants: [
        { id: 'A', scenario: '', body: '' },
        { id: 'B', scenario: '', body: '' },
        { id: 'C', scenario: '', body: '' },
      ],
    },
    knowledge: {
      uploaded_files: [],
      quick_facts: [],
      competitor_notes: '',
    },
    tools: Object.fromEntries(AGENT_TOOLS.map((t) => [t.id, t.default])),
    guardrails: {
      rate_limits: {
        per_hour: 2,
        per_day: 4,
        per_week: 10,
      },
      quiet_hours_mode: 'inherit', // inherit | custom
      quiet_hours: { start: '21:00', end: '07:00' },
      do_not_contact: [],
      banned_topics: [],
      max_touches_before_archive: 5,
      required_sms_disclosure: true,
      prohibited_promises: {
        no_pricing: true,
        no_timeline: true,
        no_warranty_extension: true,
      },
    },
    escalation: {
      triggers: {
        legal_threats: true,
        anger_or_complaint: true,
        out_of_range_pricing: true,
        wrong_service_area: true,
        requests_human: true,
        refund_request: true,
        lead_value_above: 25000,
      },
      channel: 'telegram_ea', // sms | email | telegram_ea | all
      notify_user_id: 'marcus-johnson',
      while_waiting: 'holding_message', // silent | holding_message
      holding_message:
        "Thanks for reaching out — a team member will follow up shortly.",
    },
    simulation: {
      passed: {}, // scenarioName -> boolean
      runs: [],
    },
    activation: {
      mode: 'shadow', // shadow | draft | full_auto
      schedule: 'manual', // now | tomorrow_6am | manual
      notify: {
        text_each_action: false,
        daily_summary: true,
        only_escalations: true,
      },
    },
  };
}
