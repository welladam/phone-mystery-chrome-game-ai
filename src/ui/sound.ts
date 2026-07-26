/**
 * Interface sound effects.
 *
 * Everything is synthesized by the Web Audio API; no sound files are downloaded.
 * Tones are short and subtle, fitting a restrained phone UI. Audio starts only
 * after the first user gesture under autoplay policy and can be disabled in settings.
 */

export type SoundKind = "tap" | "back" | "notify" | "unlock" | "clue" | "error" | "send";

let ctx: AudioContext | undefined;
let enabled = true;

function ensureContext(): AudioContext | undefined {
  if (typeof window === "undefined") return undefined;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return undefined;
  if (!ctx) {
    try {
      ctx = new Ctor();
    } catch {
      return undefined;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setSoundEnabled(value: boolean) {
  enabled = value;
}

export function isSoundEnabled() {
  return enabled;
}

/** Wakes the audio context on the first gesture; called once. */
export function primeSound() {
  ensureContext();
}

type Note = { freq: number; start: number; dur: number; gain: number; type?: OscillatorType };

const RECIPES: Record<SoundKind, Note[]> = {
  // Short, dry tone for ordinary navigation.
  tap: [{ freq: 420, start: 0, dur: 0.045, gain: 0.05, type: "sine" }],
  // Back: a slightly lower tone.
  back: [{ freq: 300, start: 0, dur: 0.05, gain: 0.05, type: "sine" }],
  // Send message: short rise.
  send: [
    { freq: 520, start: 0, dur: 0.05, gain: 0.05, type: "sine" },
    { freq: 700, start: 0.05, dur: 0.05, gain: 0.045, type: "sine" },
  ],
  // Clue recorded: two soft ascending tones.
  clue: [
    { freq: 587, start: 0, dur: 0.08, gain: 0.06, type: "triangle" },
    { freq: 784, start: 0.08, dur: 0.1, gain: 0.05, type: "triangle" },
  ],
  // Unlock: short, clear chord.
  unlock: [
    { freq: 523, start: 0, dur: 0.09, gain: 0.06, type: "triangle" },
    { freq: 659, start: 0.06, dur: 0.09, gain: 0.055, type: "triangle" },
    { freq: 880, start: 0.12, dur: 0.12, gain: 0.05, type: "triangle" },
  ],
  // Anonymous contact message arrival: low and unsettling.
  notify: [
    { freq: 330, start: 0, dur: 0.16, gain: 0.07, type: "sine" },
    { freq: 247, start: 0.16, dur: 0.22, gain: 0.06, type: "sine" },
  ],
  // Error: two descending notes.
  error: [
    { freq: 300, start: 0, dur: 0.09, gain: 0.06, type: "sawtooth" },
    { freq: 200, start: 0.1, dur: 0.14, gain: 0.05, type: "sawtooth" },
  ],
};

export function playSound(kind: SoundKind) {
  if (!enabled) return;
  const audio = ensureContext();
  if (!audio) return;

  const now = audio.currentTime;
  for (const note of RECIPES[kind]) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = note.type ?? "sine";
    osc.frequency.value = note.freq;

    const t0 = now + note.start;
    const t1 = t0 + note.dur;
    // Short envelope to prevent clicks.
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(note.gain, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t1);

    osc.connect(gain).connect(audio.destination);
    osc.start(t0);
    osc.stop(t1 + 0.02);
  }
}
