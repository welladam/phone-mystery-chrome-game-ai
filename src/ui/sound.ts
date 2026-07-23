/**
 * Efeitos sonoros da interface.
 *
 * Tudo é sintetizado pela Web Audio API — nenhum arquivo de som é baixado.
 * Os toques são curtos e discretos, no espírito de um celular sóbrio. O áudio
 * só começa depois do primeiro gesto do usuário (política de autoplay) e pode
 * ser desligado nas opções.
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

/** Desperta o contexto de áudio no primeiro gesto (chamado uma vez). */
export function primeSound() {
  ensureContext();
}

type Note = { freq: number; start: number; dur: number; gain: number; type?: OscillatorType };

const RECIPES: Record<SoundKind, Note[]> = {
  // Toque seco e curto para navegação comum.
  tap: [{ freq: 420, start: 0, dur: 0.045, gain: 0.05, type: "sine" }],
  // Voltar: um tom levemente mais grave.
  back: [{ freq: 300, start: 0, dur: 0.05, gain: 0.05, type: "sine" }],
  // Enviar mensagem: subida curta.
  send: [
    { freq: 520, start: 0, dur: 0.05, gain: 0.05, type: "sine" },
    { freq: 700, start: 0.05, dur: 0.05, gain: 0.045, type: "sine" },
  ],
  // Pista registrada: dois tons ascendentes suaves.
  clue: [
    { freq: 587, start: 0, dur: 0.08, gain: 0.06, type: "triangle" },
    { freq: 784, start: 0.08, dur: 0.1, gain: 0.05, type: "triangle" },
  ],
  // Desbloqueio: acorde curto e claro.
  unlock: [
    { freq: 523, start: 0, dur: 0.09, gain: 0.06, type: "triangle" },
    { freq: 659, start: 0.06, dur: 0.09, gain: 0.055, type: "triangle" },
    { freq: 880, start: 0.12, dur: 0.12, gain: 0.05, type: "triangle" },
  ],
  // Chegada de mensagem do contato anônimo: grave e inquietante.
  notify: [
    { freq: 330, start: 0, dur: 0.16, gain: 0.07, type: "sine" },
    { freq: 247, start: 0.16, dur: 0.22, gain: 0.06, type: "sine" },
  ],
  // Erro: duas notas descendentes.
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
    // Envelope curto para não estalar.
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(note.gain, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t1);

    osc.connect(gain).connect(audio.destination);
    osc.start(t0);
    osc.stop(t1 + 0.02);
  }
}
