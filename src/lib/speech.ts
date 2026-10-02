import type { Lang } from "./types";
import { LANGS } from "./i18n";

/** Browser speechSynthesis only. No external TTS service (e.g. Sarvam) is connected. */
function synth(): SpeechSynthesis | null {
  return typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
}

export function findVoice(lang: Lang): SpeechSynthesisVoice | null {
  const s = synth(); if (!s) return null;
  const voices = s.getVoices();
  const prefixes = LANGS.find((l) => l.code === lang)!.speech;
  for (const p of prefixes) { const v = voices.find((x) => x.lang.toLowerCase().replace("_", "-").startsWith(p.toLowerCase())); if (v) return v; }
  return null;
}

export function voiceStatus(lang: Lang): { supported: boolean; hasVoice: boolean; message: string } {
  const s = synth();
  if (!s) return { supported: false, hasVoice: false, message: "This browser has no speech synthesis. Text is shown instead." };
  const v = findVoice(lang);
  const name = LANGS.find((l) => l.code === lang)!.label;
  return v
    ? { supported: true, hasVoice: true, message: `Using your browser's built-in voice “${v.name}” (${v.lang}). This is browser text-to-speech, not an external Indian-language voice service.` }
    : { supported: true, hasVoice: false, message: `No ${name} voice is installed in this browser/OS, so narration may use a default voice and sound wrong. Install a ${name} voice or read the text on screen.` };
}

export function stopSpeech() { synth()?.cancel(); }

export function speak(text: string, lang: Lang, opts: { rate?: number; onEnd?: () => void } = {}): Promise<{ ok: boolean; reason?: string }> {
  const s = synth();
  if (!s) return Promise.resolve({ ok: false, reason: "Speech synthesis is not supported in this browser." });
  s.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = findVoice(lang);
  if (v) u.voice = v;
  u.lang = LANGS.find((l) => l.code === lang)!.speech[0];
  u.rate = opts.rate ?? 0.95;
  return new Promise((resolve) => {
    u.onend = () => { opts.onEnd?.(); resolve({ ok: true }); };
    u.onerror = (e) => { if (e.error !== "canceled" && e.error !== "interrupted") resolve({ ok: false, reason: `Speech failed (${e.error}).` }); else resolve({ ok: true }); };
    s.speak(u);
    if (!v && lang !== "en") resolve({ ok: true });
  });
}
