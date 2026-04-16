'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Briefcase,
  Shield,
  Star,
  Volume2,
  Clock,
  Save,
  Check,
  AlertTriangle,
} from 'lucide-react';
import {
  Section,
  Field,
  TextInput,
  NumberInput,
  Textarea,
  Select,
  RadioGroup,
  ChipMultiSelect,
  Toggle,
  TagInput,
  Slider,
  StarPicker,
  TimeInput,
} from '@/components/agent/FormPrimitives';
import {
  loadBusinessProfile,
  saveBusinessProfile,
  businessProfileStatus,
  DEFAULT_BUSINESS_PROFILE,
} from '@/lib/agents/storage';

const PRIMARY_SERVICES = ['Roofing', 'HVAC', 'Solar', 'Exteriors', 'Remodeling', 'Multi'];

const SUBTYPES_BY_SERVICE = {
  Roofing: [
    'New roof install',
    'Roof repair',
    'Gutters',
    'Skylights',
    'Storm damage',
    'Insurance claims',
    'Commercial roofing',
    'Maintenance',
  ],
  HVAC: [
    'Install',
    'Repair',
    'Maintenance',
    'Ductwork',
    'Heat pump',
    'Mini-split',
    'Commercial HVAC',
    'Indoor air quality',
  ],
  Solar: [
    'Residential solar',
    'Battery storage',
    'EV charger',
    'Commercial solar',
    'Solar + roof combo',
    'Monitoring',
  ],
  Exteriors: [
    'Siding',
    'Windows',
    'Doors',
    'Painting',
    'Decks',
    'Fencing',
    'Soffit & fascia',
  ],
  Remodeling: [
    'Kitchen',
    'Bathroom',
    'Basement',
    'Additions',
    'Whole-home',
    'Outdoor living',
  ],
  Multi: [
    'Roofing',
    'HVAC',
    'Solar',
    'Siding',
    'Windows',
    'Gutters',
    'Painting',
    'Remodeling',
  ],
};

const PRICING_OPTIONS = ['Premium', 'Mid-market', 'Value', 'Insurance-first'];
const INSURANCE_OPTIONS = ['Yes', 'No', 'Primary focus'];
const BBB_OPTIONS = ['A+', 'A', 'B', 'C', 'Not accredited', 'Not listed'];
const TIMEZONES = [
  'America/Phoenix',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Anchorage',
  'Pacific/Honolulu',
];

const DAYS = [
  ['mon', 'Monday'],
  ['tue', 'Tuesday'],
  ['wed', 'Wednesday'],
  ['thu', 'Thursday'],
  ['fri', 'Friday'],
  ['sat', 'Saturday'],
  ['sun', 'Sunday'],
];

export default function BusinessProfilePage() {
  const [profile, setProfile] = useState(DEFAULT_BUSINESS_PROFILE);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    setProfile(loadBusinessProfile());
    setHydrated(true);
  }, []);

  const status = useMemo(() => businessProfileStatus(profile), [profile]);

  function set(key, value) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  function setNested(key, subkey, value) {
    setProfile((p) => ({ ...p, [key]: { ...p[key], [subkey]: value } }));
  }

  function setDay(day, subkey, value) {
    setProfile((p) => ({
      ...p,
      business_hours: {
        ...p.business_hours,
        [day]: { ...p.business_hours[day], [subkey]: value },
      },
    }));
  }

  function handleSave() {
    saveBusinessProfile(profile);
    setSavedAt(new Date());
    setTimeout(() => setSavedAt(null), 3500);
  }

  const subtypes =
    SUBTYPES_BY_SERVICE[profile.primary_service_type] || SUBTYPES_BY_SERVICE.Multi;

  if (!hydrated) return null;

  return (
    <div style={{ paddingBottom: 96 }}>
      {/* Header */}
      <div>
        <div
          className="t-eyebrow"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Briefcase size={12} style={{ color: 'var(--emerald-bright)' }} />
          Command Center
        </div>
        <h1
          className="t-h1"
          style={{
            margin: '6px 0 6px',
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: '-0.01em',
          }}
        >
          Business Profile
        </h1>
        <p
          className="t-body-sm"
          style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-body)' }}
        >
          One source of truth — every agent you activate inherits this.
        </p>
      </div>

      {/* Status banner */}
      <div
        style={{
          marginTop: 20,
          padding: 14,
          borderRadius: 10,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          border: `1px solid ${
            status.complete
              ? 'color-mix(in srgb, var(--emerald-bright) 40%, var(--border))'
              : 'color-mix(in srgb, #f59e0b 40%, var(--border))'
          }`,
          background: status.complete
            ? 'color-mix(in srgb, var(--emerald-bright) 8%, transparent)'
            : 'color-mix(in srgb, #f59e0b 8%, transparent)',
          color: status.complete ? 'var(--emerald-bright)' : '#f59e0b',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {status.complete ? <Check size={14} /> : <AlertTriangle size={14} />}
        {status.complete
          ? 'Complete — All agents will inherit this'
          : `Incomplete — Finish this before activating agents (${status.sectionsComplete}/${status.totalSections})`}
      </div>

      {/* Sections */}
      <div style={{ marginTop: 24 }}>
        <Section
          id="company-basics"
          title="Company Basics"
          description="Legal identity, services, service area"
          icon={Briefcase}
        >
          <div
            className="bp-grid-2"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}
          >
            <Field label="Legal name" required>
              <TextInput
                value={profile.legal_name}
                onChange={(v) => set('legal_name', v)}
                placeholder="Acme Roofing LLC"
              />
            </Field>
            <Field label="DBA (if different)">
              <TextInput
                value={profile.dba}
                onChange={(v) => set('dba', v)}
                placeholder="Acme Roofing"
              />
            </Field>
            <Field label="Primary service type" required>
              <Select
                value={profile.primary_service_type}
                onChange={(v) => {
                  set('primary_service_type', v);
                  set('service_subtypes', []);
                }}
                options={PRIMARY_SERVICES}
              />
            </Field>
            <Field label="Year founded">
              <NumberInput
                value={profile.year_founded}
                onChange={(v) => set('year_founded', v)}
                min={1900}
                max={2026}
                placeholder="2010"
              />
            </Field>
          </div>

          <Field label="Service sub-types">
            <ChipMultiSelect
              value={profile.service_subtypes}
              onChange={(v) => set('service_subtypes', v)}
              options={subtypes}
            />
          </Field>

          <div
            className="bp-grid-2"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}
          >
            <Field label="Team size">
              <NumberInput
                value={profile.team_size}
                onChange={(v) => set('team_size', v)}
                min={1}
                placeholder="12"
              />
            </Field>
            <Field label="Main phone" required>
              <TextInput
                value={profile.main_phone}
                onChange={(v) => set('main_phone', v)}
                placeholder="(555) 123-4567"
              />
            </Field>
          </div>

          <Field label="Service area" hint="How do you define where you work?">
            <RadioGroup
              value={profile.service_area_mode}
              onChange={(v) => set('service_area_mode', v)}
              options={[
                { value: 'radius', label: 'Radius from address' },
                { value: 'zips', label: 'Specific ZIP codes' },
              ]}
            />
          </Field>

          {profile.service_area_mode === 'radius' ? (
            <div
              className="bp-grid-2"
              style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}
            >
              <Field label="Address">
                <TextInput
                  value={profile.service_area_address}
                  onChange={(v) => set('service_area_address', v)}
                  placeholder="123 Main St, Phoenix AZ 85004"
                />
              </Field>
              <Field label="Radius (miles)">
                <NumberInput
                  value={profile.service_area_radius}
                  onChange={(v) => set('service_area_radius', v)}
                  min={1}
                  max={500}
                />
              </Field>
            </div>
          ) : (
            <Field label="ZIP codes">
              <TagInput
                value={profile.service_area_zips}
                onChange={(v) => set('service_area_zips', v)}
                placeholder="Add ZIP and press Enter"
              />
            </Field>
          )}

          <div
            className="bp-grid-2"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}
          >
            <Field label="Website URL">
              <TextInput
                value={profile.website_url}
                onChange={(v) => set('website_url', v)}
                placeholder="https://acmeroofing.com"
              />
            </Field>
            <Field label="Google Business Profile URL">
              <TextInput
                value={profile.google_business_url}
                onChange={(v) => set('google_business_url', v)}
                placeholder="https://g.co/..."
              />
            </Field>
          </div>
        </Section>

        <Section
          id="positioning"
          title="Positioning"
          description="How you win — and how you price"
          icon={Shield}
        >
          <Field label="Pricing philosophy">
            <RadioGroup
              value={profile.pricing_philosophy}
              onChange={(v) => set('pricing_philosophy', v)}
              options={PRICING_OPTIONS}
            />
          </Field>

          <Field label="Top 3 unique selling points" hint="One line each">
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ marginTop: i === 0 ? 0 : 8 }}>
                <TextInput
                  value={profile.usps[i]}
                  onChange={(v) => {
                    const next = [...profile.usps];
                    next[i] = v;
                    set('usps', next);
                  }}
                  placeholder={`USP ${i + 1}`}
                />
              </div>
            ))}
          </Field>

          <div
            className="bp-grid-2"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}
          >
            <Field label="Warranty years offered">
              <NumberInput
                value={profile.warranty_years}
                onChange={(v) => set('warranty_years', v)}
                min={0}
                max={100}
                placeholder="25"
              />
            </Field>
            <Field label="Insurance claims experience">
              <RadioGroup
                value={profile.insurance_claims}
                onChange={(v) => set('insurance_claims', v)}
                options={INSURANCE_OPTIONS}
              />
            </Field>
          </div>

          <Field label="Certifications" hint="GAF Master Elite, NATE, NABCEP...">
            <TagInput
              value={profile.certifications}
              onChange={(v) => set('certifications', v)}
              placeholder="Add certification and press Enter"
            />
          </Field>
        </Section>

        <Section
          id="reviews"
          title="Reviews & Social Proof"
          description="Reputation, competitors, what customers say"
          icon={Star}
        >
          <div
            className="bp-grid-3"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 14,
            }}
          >
            <Field label="Google review count">
              <NumberInput
                value={profile.google_review_count}
                onChange={(v) => set('google_review_count', v)}
                min={0}
                placeholder="284"
              />
            </Field>
            <Field label="Google rating">
              <StarPicker
                value={profile.google_rating}
                onChange={(v) => set('google_rating', v)}
              />
            </Field>
            <Field label="BBB rating">
              <Select
                value={profile.bbb_rating}
                onChange={(v) => set('bbb_rating', v)}
                options={BBB_OPTIONS}
              />
            </Field>
          </div>

          <Field label="Top 3 competitors">
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ marginTop: i === 0 ? 0 : 8 }}>
                <TextInput
                  value={profile.competitors[i]}
                  onChange={(v) => {
                    const next = [...profile.competitors];
                    next[i] = v;
                    set('competitors', next);
                  }}
                  placeholder={`Competitor ${i + 1}`}
                />
              </div>
            ))}
          </Field>

          <Field label="What customers love most" hint="Top 3 themes from reviews">
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ marginTop: i === 0 ? 0 : 8 }}>
                <TextInput
                  value={profile.customers_love[i]}
                  onChange={(v) => {
                    const next = [...profile.customers_love];
                    next[i] = v;
                    set('customers_love', next);
                  }}
                  placeholder={`Theme ${i + 1} (e.g. 'Clean jobsite')`}
                />
              </div>
            ))}
          </Field>
        </Section>

        <Section
          id="voice"
          title="Voice of the Business"
          description="How the AI should sound — like you"
          icon={Volume2}
        >
          <Field label="Owner's first name" required>
            <TextInput
              value={profile.owner_first_name}
              onChange={(v) => set('owner_first_name', v)}
              placeholder="Marcus"
            />
          </Field>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              padding: 16,
              borderRadius: 10,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
            }}
          >
            <Slider
              value={profile.voice_formality}
              onChange={(v) => set('voice_formality', v)}
              leftLabel="Formal"
              rightLabel="Casual"
            />
            <Slider
              value={profile.voice_verbosity}
              onChange={(v) => set('voice_verbosity', v)}
              leftLabel="Concise"
              rightLabel="Detailed"
            />
            <Slider
              value={profile.voice_warmth}
              onChange={(v) => set('voice_warmth', v)}
              leftLabel="Warm"
              rightLabel="Direct"
            />
          </div>

          <Field label="Sample sentences we actually use" hint="3-5 lines expected">
            <Textarea
              value={profile.sample_sentences}
              onChange={(v) => set('sample_sentences', v)}
              rows={5}
              placeholder={`Hey — thanks for reaching out. We'd love to take a look.\nCan I grab your address so we can pull some satellite imagery?`}
            />
          </Field>

          <Field label="Words / phrases we NEVER use">
            <TagInput
              value={profile.never_use_phrases}
              onChange={(v) => set('never_use_phrases', v)}
              placeholder='"Cheap", "discount"...'
            />
          </Field>

          <Field label="Local phrases to include">
            <TagInput
              value={profile.local_phrases}
              onChange={(v) => set('local_phrases', v)}
              placeholder='"Valley", "back east"...'
            />
          </Field>
        </Section>

        <Section
          id="operational"
          title="Operational Defaults"
          description="Hours, timezone, quiet windows"
          icon={Clock}
        >
          <Field label="Business hours">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: 14,
                borderRadius: 10,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
              }}
            >
              {DAYS.map(([key, label]) => {
                const d = profile.business_hours[key];
                return (
                  <div
                    key={key}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1fr 1fr 90px',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-body)',
                      }}
                    >
                      {label}
                    </span>
                    <TimeInput
                      value={d.open}
                      onChange={(v) => setDay(key, 'open', v)}
                    />
                    <TimeInput
                      value={d.close}
                      onChange={(v) => setDay(key, 'close', v)}
                    />
                    <Toggle
                      value={d.closed}
                      onChange={(v) => setDay(key, 'closed', v)}
                      label="Closed"
                    />
                  </div>
                );
              })}
            </div>
          </Field>

          <div
            className="bp-grid-2"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}
          >
            <Field label="Timezone">
              <Select
                value={profile.timezone}
                onChange={(v) => set('timezone', v)}
                options={TIMEZONES}
              />
            </Field>
            <Field label="After-hours emergency line">
              <Toggle
                value={profile.after_hours_emergency}
                onChange={(v) => set('after_hours_emergency', v)}
                label={profile.after_hours_emergency ? 'On' : 'Off'}
              />
            </Field>
          </div>

          <Field label="Lunch / break window">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                flexWrap: 'wrap',
              }}
            >
              <Toggle
                value={profile.lunch_window_enabled}
                onChange={(v) => set('lunch_window_enabled', v)}
                label={profile.lunch_window_enabled ? 'Enabled' : 'Disabled'}
              />
              {profile.lunch_window_enabled ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <TimeInput
                    value={profile.lunch_window.start}
                    onChange={(v) => setNested('lunch_window', 'start', v)}
                  />
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <TimeInput
                    value={profile.lunch_window.end}
                    onChange={(v) => setNested('lunch_window', 'end', v)}
                  />
                </div>
              ) : null}
            </div>
          </Field>

          <Field label="Default quiet hours" hint="No outbound messages in this window">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <TimeInput
                value={profile.quiet_hours.start}
                onChange={(v) => setNested('quiet_hours', 'start', v)}
              />
              <span style={{ color: 'var(--text-muted)' }}>→</span>
              <TimeInput
                value={profile.quiet_hours.end}
                onChange={(v) => setNested('quiet_hours', 'end', v)}
              />
            </div>
          </Field>
        </Section>
      </div>

      {/* Sticky save footer */}
      <div
        style={{
          position: 'sticky',
          bottom: 16,
          marginTop: 24,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          padding: '14px 18px',
          borderRadius: 12,
          border: '1px solid var(--border)',
          background: 'var(--surface-1)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 12,
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
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
              color: status.complete ? 'var(--emerald-bright)' : '#f59e0b',
              background: `color-mix(in srgb, ${
                status.complete ? 'var(--emerald-bright)' : '#f59e0b'
              } 14%, transparent)`,
              border: `1px solid color-mix(in srgb, ${
                status.complete ? 'var(--emerald-bright)' : '#f59e0b'
              } 30%, transparent)`,
            }}
          >
            {status.sectionsComplete} of {status.totalSections} sections complete
          </span>
          {savedAt ? (
            <span
              style={{
                fontSize: 12,
                color: 'var(--emerald-bright)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Check size={12} /> Saved
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Save size={14} />
          Save Business Profile
        </button>
      </div>

      <style jsx>{`
        @media (max-width: 760px) {
          :global(.bp-grid-2),
          :global(.bp-grid-3) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
