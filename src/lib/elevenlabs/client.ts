// ElevenLabs API Client - Voice AI for Chatty AI
// CRITICAL: ElevenLabs is the EXCLUSIVE voice provider. DO NOT use Vapi.

const ELEVEN_BASE = "https://api.elevenlabs.io/v1";

function getHeaders() {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY required");
  }
  return {
    "xi-api-key": process.env.ELEVENLABS_API_KEY,
    "Content-Type": "application/json",
  };
}

export interface TTSOptions {
  text: string;
  voiceId: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

export async function textToSpeech(opts: TTSOptions): Promise<ArrayBuffer> {
  const response = await fetch(`${ELEVEN_BASE}/text-to-speech/${opts.voiceId}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      text: opts.text,
      model_id: opts.modelId || "eleven_multilingual_v2",
      voice_settings: {
        stability: opts.stability ?? 0.5,
        similarity_boost: opts.similarityBoost ?? 0.75,
      },
    }),
  });
  if (!response.ok) {
    throw new Error(`ElevenLabs TTS failed (${response.status})`);
  }
  return response.arrayBuffer();
}

export async function listVoices() {
  const r = await fetch(`${ELEVEN_BASE}/voices`, { headers: getHeaders() });
  if (!r.ok) throw new Error("listVoices failed");
  return (await r.json()).voices;
}

export async function getVoice(id: string) {
  const r = await fetch(`${ELEVEN_BASE}/voices/${id}`, { headers: getHeaders() });
  if (!r.ok) throw new Error("getVoice failed");
  return r.json();
}

export async function cloneVoice(name: string, desc: string, files: Blob[]) {
  const fd = new FormData();
  fd.append("name", name);
  fd.append("description", desc);
  files.forEach((f, i) => fd.append("files", f, `sample_${i}.mp3`));
  const r = await fetch(`${ELEVEN_BASE}/voices/add`, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY! },
    body: fd,
  });
  if (!r.ok) throw new Error("cloneVoice failed");
  return r.json();
}

export async function createConversationalAgent(config: any) {
  const r = await fetch(`${ELEVEN_BASE}/convai/agents/create`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      name: config.name,
      conversation_config: {
        agent: {
          prompt: { prompt: config.systemPrompt },
          first_message: config.firstMessage,
          language: "en",
        },
        tts: { voice_id: config.voiceId },
      },
    }),
  });
  if (!r.ok) throw new Error("createAgent failed");
  return r.json();
}

export async function getUsage() {
  const r = await fetch(`${ELEVEN_BASE}/user/subscription`, { headers: getHeaders() });
  if (!r.ok) throw new Error("getUsage failed");
  return r.json();
}
