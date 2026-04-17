// localStorage-backed persistence for the configuration wizard and business
// profile form. Everything written here is clean JSON that'll map into
// `business_profiles` and `agent_configs` Postgres tables later.

'use client';

import { buildDefaultAgentConfig, getAgentById } from './registry';

const BUSINESS_PROFILE_KEY = 'chatty:business_profile';
const AGENT_CONFIG_KEY_PREFIX = 'chatty:agent_config:';

function safeGet(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export const DEFAULT_BUSINESS_PROFILE = {
  // Company Basics
  legal_name: '',
  dba: '',
  primary_service_type: 'Roofing', // Roofing | HVAC | Solar | Exteriors | Remodeling | Multi
  service_subtypes: [],
  year_founded: '',
  team_size: '',
  service_area_mode: 'radius', // radius | zips
  service_area_address: '',
  service_area_radius: 25,
  service_area_zips: [],
  website_url: '',
  google_business_url: '',
  main_phone: '',

  // Positioning
  pricing_philosophy: 'Mid-market', // Premium | Mid-market | Value | Insurance-first
  usps: ['', '', ''],
  warranty_years: '',
  certifications: [],
  insurance_claims: 'Yes', // Yes | No | Primary focus

  // Reviews & Social Proof
  google_review_count: '',
  google_rating: 0,
  bbb_rating: 'A+',
  competitors: ['', '', ''],
  customers_love: ['', '', ''],

  // Voice of the Business
  owner_first_name: '',
  voice_formality: 5,
  voice_verbosity: 5,
  voice_warmth: 5,
  sample_sentences: '',
  never_use_phrases: [],
  local_phrases: [],

  // Operational Defaults
  business_hours: {
    mon: { open: '07:00', close: '18:00', closed: false },
    tue: { open: '07:00', close: '18:00', closed: false },
    wed: { open: '07:00', close: '18:00', closed: false },
    thu: { open: '07:00', close: '18:00', closed: false },
    fri: { open: '07:00', close: '18:00', closed: false },
    sat: { open: '08:00', close: '14:00', closed: false },
    sun: { open: '09:00', close: '12:00', closed: true },
  },
  timezone: 'America/Phoenix',
  lunch_window_enabled: false,
  lunch_window: { start: '12:00', end: '13:00' },
  after_hours_emergency: true,
  quiet_hours: { start: '21:00', end: '07:00' },
};

export function loadBusinessProfile() {
  return { ...DEFAULT_BUSINESS_PROFILE, ...(safeGet(BUSINESS_PROFILE_KEY) || {}) };
}

export function saveBusinessProfile(profile) {
  safeSet(BUSINESS_PROFILE_KEY, profile);
  saveBusinessProfileRemote(profile);
}

// Returns { complete: boolean, sectionsComplete: number, totalSections: 5 }.
export function businessProfileStatus(profile) {
  const sections = [
    // Basics
    !!profile.legal_name &&
      !!profile.primary_service_type &&
      !!profile.main_phone,
    // Positioning
    !!profile.pricing_philosophy &&
      profile.usps.filter((u) => u && u.trim().length > 0).length >= 1,
    // Reviews
    !!profile.google_review_count && Number(profile.google_rating) > 0,
    // Voice
    !!profile.owner_first_name && !!profile.sample_sentences,
    // Ops
    !!profile.timezone,
  ];
  const sectionsComplete = sections.filter(Boolean).length;
  return {
    sectionsComplete,
    totalSections: sections.length,
    complete: sectionsComplete === sections.length,
  };
}

// ---------------------------------------------------------------------------
// Agent config
// ---------------------------------------------------------------------------

export function loadAgentConfig(agentId) {
  const agent = getAgentById(agentId);
  if (!agent) return null;
  const stored = safeGet(`${AGENT_CONFIG_KEY_PREFIX}${agentId}`);
  const base = buildDefaultAgentConfig(agent);
  return stored ? mergeDeep(base, stored) : base;
}

export function saveAgentConfig(agentId, config) {
  safeSet(`${AGENT_CONFIG_KEY_PREFIX}${agentId}`, config);
  saveAgentConfigRemote(agentId, config);
}

export function agentConfigStatus(config) {
  if (!config) return { completeness: 0, steps: 0, total: 11, status: 'not_configured' };
  const stepKeys = [
    'mission',
    'triggers',
    'context',
    'voice',
    'templates',
    'knowledge',
    'tools',
    'guardrails',
    'escalation',
    'simulation',
    'activation',
  ];
  const completed = stepKeys.filter((k) => config.completeness?.[k]);
  return {
    completeness: Math.round((completed.length / stepKeys.length) * 100),
    steps: completed.length,
    total: stepKeys.length,
    status: config.status || 'not_configured',
  };
}

function mergeDeep(base, override) {
  if (Array.isArray(base) || Array.isArray(override)) {
    return override ?? base;
  }
  if (typeof base === 'object' && base && typeof override === 'object' && override) {
    const out = { ...base };
    for (const k of Object.keys(override)) {
      out[k] = mergeDeep(base[k], override[k]);
    }
    return out;
  }
  return override ?? base;
}

// ---------------------------------------------------------------------------
// Remote sync — fire-and-forget with 600ms debounce per key
// ---------------------------------------------------------------------------

const _debounceTimers = {};

function debounced(key, fn, ms = 600) {
  clearTimeout(_debounceTimers[key]);
  _debounceTimers[key] = setTimeout(fn, ms);
}

function saveBusinessProfileRemote(profile) {
  debounced('bp', () => {
    fetch('/api/business-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile }),
    }).catch((err) => console.warn('[chatty] remote business-profile save failed', err));
  });
}

function saveAgentConfigRemote(agentId, config) {
  debounced(`agent:${agentId}`, () => {
    fetch(`/api/agents/${agentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config, status: config.status }),
    }).catch((err) => console.warn('[chatty] remote agent config save failed', err));
  });
}

// ---------------------------------------------------------------------------
// hydrateFromServer — one-shot on boot, local wins if present
// ---------------------------------------------------------------------------

let _hydrated = false;

export async function hydrateFromServer() {
  if (typeof window === 'undefined' || _hydrated) return;
  _hydrated = true;

  try {
    const localBP = safeGet(BUSINESS_PROFILE_KEY);
    if (!localBP) {
      const res = await fetch('/api/business-profile');
      if (res.ok) {
        const { profile } = await res.json();
        if (profile) {
          const mapped = serverProfileToLocal(profile);
          safeSet(BUSINESS_PROFILE_KEY, mapped);
        }
      }
    }
  } catch (err) {
    console.warn('[chatty] hydrate business-profile failed', err);
  }

  try {
    const res = await fetch('/api/agents');
    if (res.ok) {
      const { agents } = await res.json();
      if (Array.isArray(agents)) {
        for (const row of agents) {
          const key = `${AGENT_CONFIG_KEY_PREFIX}${row.agentType}`;
          const local = safeGet(key);
          if (!local && row.config) {
            safeSet(key, row.config);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[chatty] hydrate agent configs failed', err);
  }
}

function serverProfileToLocal(p) {
  if (!p) return null;
  return {
    legal_name: p.companyName || '',
    dba: p.dba || '',
    primary_service_type: p.primaryServiceType || 'Roofing',
    service_subtypes: p.serviceSubtypes || [],
    year_founded: p.yearFounded != null ? String(p.yearFounded) : '',
    team_size: p.teamSize != null ? String(p.teamSize) : '',
    service_area_mode: p.serviceArea?.mode || 'radius',
    service_area_address: p.serviceArea?.address || '',
    service_area_radius: p.serviceArea?.radius || 25,
    service_area_zips: p.serviceArea?.zips || [],
    website_url: p.website || '',
    google_business_url: p.googleProfileUrl || '',
    main_phone: p.mainPhone || '',
    pricing_philosophy: { premium: 'Premium', mid: 'Mid-market', value: 'Value', insurance_first: 'Insurance-first' }[p.pricingPhilosophy] || 'Mid-market',
    usps: [p.usp1 || '', p.usp2 || '', p.usp3 || ''],
    warranty_years: p.warrantyYears != null ? String(p.warrantyYears) : '',
    certifications: p.certifications || [],
    insurance_claims: { some: 'Yes', none: 'No', primary_focus: 'Primary focus' }[p.insuranceExperience] || 'Yes',
    google_review_count: p.googleReviewsCount != null ? String(p.googleReviewsCount) : '',
    google_rating: p.googleRating || 0,
    bbb_rating: p.bbbRating || 'A+',
    competitors: p.competitors || ['', '', ''],
    customers_love: p.customerThemes || ['', '', ''],
    owner_first_name: p.ownerFirstName || '',
    voice_formality: p.voiceFormalCasual ?? 5,
    voice_verbosity: p.voiceConciseDetailed ?? 5,
    voice_warmth: p.voiceWarmDirect ?? 5,
    sample_sentences: Array.isArray(p.sampleSentences) ? p.sampleSentences.join('\n') : '',
    never_use_phrases: p.neverUsePhrases || [],
    local_phrases: p.localPhrases || [],
    business_hours: p.businessHours || DEFAULT_BUSINESS_PROFILE.business_hours,
    timezone: p.timezone || 'America/Phoenix',
    lunch_window_enabled: !!p.lunchBreak,
    lunch_window: p.lunchBreak || { start: '12:00', end: '13:00' },
    after_hours_emergency: p.afterHoursEmergency ?? true,
    quiet_hours: p.quietHours || { start: '21:00', end: '07:00' },
  };
}
