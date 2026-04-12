// Voice Notes — AI-generated short voice messages (15–45s) delivered via
// MMS-style SMS. Reclaim agents use these to dramatically outperform plain SMS.
// ElevenLabs TTS + an MMS provider (Twilio MMS / Bandwidth) get wired later.

export async function generateVoiceNote({ script, voiceId, leadContext }) {
  // TODO: ElevenLabs TTS call with voiceId + interpolated script.
  // Returns { audioUrl, durationSec, transcript }
  return {
    audioUrl: null,
    durationSec: 0,
    transcript: script,
    voiceId: voiceId || null,
    leadContext: leadContext || null,
    status: 'stub',
  };
}

export async function sendVoiceNoteSMS({ phone, audioUrl, transcript }) {
  // TODO: SMS-with-media provider (Twilio MMS / Bandwidth).
  return {
    sent: true,
    phone,
    audioUrl,
    transcript,
    messageId: 'stub-' + Date.now(),
  };
}

export const VOICE_NOTE_TEMPLATES = {
  dead_lead_60day:
    "Hey {firstName}, it's Mike from {companyName}. Saw you were looking at a {jobType} a couple months back — just wanted to check if you're still thinking about it. Prices have moved a bit, happy to re-quote at the old rate if it helps. Shoot me a text back either way.",
  ghosted_bid:
    "Hey {firstName}, Mike from {companyName}. Wanted to circle back on the {jobType} estimate I sent over. No pressure at all — just want to make sure you got it and didn't have any questions. Let me know where your head's at.",
  old_customer:
    "Hey {firstName}, Mike at {companyName}. It's been a minute since we did the {lastJobType}. Wanted to check in — any other projects on the horizon? We've got a spring slot opening up if you're thinking about anything.",
};

export const VOICE_OPTIONS = [
  { id: 'mike-warm', label: 'Mike — Warm Male' },
  { id: 'sarah-friendly', label: 'Sarah — Friendly Female' },
  { id: 'david-pro', label: 'David — Professional Male' },
];
