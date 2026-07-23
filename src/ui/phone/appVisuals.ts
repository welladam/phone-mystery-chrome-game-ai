/**
 * Visual de cada app: ícone de home (glyph + gradiente) e tema de abertura
 * (cor de acento) — inspirados no espírito de apps reais, mas originais,
 * nenhum reproduz logo de marca existente. Chaveado por AppId.
 *
 * Se um app não estiver aqui, os consumidores caem no gradiente/acento
 * derivado do `tone` do manifesto (ver `TONE_FALLBACK`).
 */

export type AppVisual = {
  /** Nome do ícone lucide-react (deve existir no MAP de `icons.tsx`). */
  glyph: string;
  /** Gradiente CSS de fundo do tile de home, estilo ícone de app real. */
  gradient: string;
  /** Cor sólida de acento — cabeçalho, ícones e realces ao abrir o app. */
  accent: string;
};

export const APP_VISUALS: Record<string, AppVisual> = {
  // Notificações — sino sobre laranja-âmbar de alerta.
  APP_001: { glyph: "Bell", gradient: "linear-gradient(160deg, #ffc25c 0%, #f2994a 55%, #d9711f 100%)", accent: "#f2994a" },
  // Chat ("Vínculo") — verde-mensageiro clássico, tom próprio.
  APP_002: { glyph: "MessageCircle", gradient: "linear-gradient(160deg, #6be08a 0%, #33b56a 55%, #1c8f52 100%)", accent: "#3fc074" },
  // Fotos ("Galeria") — diagonal quente, tipo carretel de cores.
  APP_003: { glyph: "Image", gradient: "linear-gradient(150deg, #ffd166 0%, #ff8a65 35%, #ef476f 70%, #a855c9 100%)", accent: "#ff8a65" },
  // E-mail ("Correio") — azul-envelope.
  APP_004: { glyph: "Mail", gradient: "linear-gradient(160deg, #7ec8f2 0%, #3d8fd1 55%, #2563a8 100%)", accent: "#5aa3e0" },
  // Contatos — índigo suave.
  APP_005: { glyph: "Users", gradient: "linear-gradient(160deg, #b3a6f5 0%, #8570e0 55%, #5c4bc4 100%)", accent: "#9689eb" },
  // Calendário ("Agenda") — vermelho de folhinha.
  APP_006: { glyph: "CalendarDays", gradient: "linear-gradient(160deg, #ff8a8a 0%, #ef5757 55%, #c93636 100%)", accent: "#f16a6a" },
  // Navegador ("Órbita") — ciano de bússola/globo.
  APP_007: { glyph: "Compass", gradient: "linear-gradient(160deg, #7fe3e0 0%, #34b4c9 55%, #1c85a3 100%)", accent: "#4bc2d6" },
  // Telefone — verde-chamada.
  APP_008: { glyph: "Phone", gradient: "linear-gradient(160deg, #8ee6a8 0%, #46c26e 55%, #269653 100%)", accent: "#4fce7e" },
  // Gravador ("Voz Segura") — vermelho de gravação, brilho de lente.
  APP_009: { glyph: "Mic", gradient: "linear-gradient(160deg, #ff8a8a 0%, #e0453f 55%, #a3211f 100%)", accent: "#e6564f" },
  // Notas ("Bloco") — amarelo de post-it.
  APP_010: { glyph: "StickyNote", gradient: "linear-gradient(160deg, #ffe680 0%, #f6c445 55%, #d99a1f 100%)", accent: "#f6c445" },
  // Mapas ("Rumo") — verde-teal de trilha.
  APP_011: { glyph: "MapPin", gradient: "linear-gradient(160deg, #7fe0c2 0%, #2fb894 55%, #1c8a72 100%)", accent: "#3fc7a0" },
  // Drive ("Nimbo Drive") — azul-céu de nuvem.
  APP_012: { glyph: "CloudUpload", gradient: "linear-gradient(160deg, #9cd6ff 0%, #4fa3e8 55%, #2d74c2 100%)", accent: "#63b0ea" },
  // Lixeira ("Recuperados") — grafite frio.
  APP_013: { glyph: "Trash2", gradient: "linear-gradient(160deg, #c7d0cb 0%, #8b978f 55%, #5c6660 100%)", accent: "#a3ada7" },
  // Saúde ("Pulso") — rosa-batimento.
  APP_014: { glyph: "Heart", gradient: "linear-gradient(160deg, #ff9bb8 0%, #f2557f 55%, #c22a58 100%)", accent: "#f2688e" },
  // Banco ("Banco Aurora") — verde-cofre com toque dourado.
  APP_015: { glyph: "Landmark", gradient: "linear-gradient(160deg, #b7e8b0 0%, #4f9e63 55%, #2f6e42 100%)", accent: "#63b479" },
  // Corridas ("Vello") — grafite noturno com aro âmbar de farol.
  APP_016: { glyph: "Car", gradient: "linear-gradient(160deg, #454f4b 0%, #2a3330 55%, #141a18 100%)", accent: "#f1bf6a" },
  // Rede Social ("Fluxo") — degradê roxo-rosa-laranja de feed.
  APP_017: { glyph: "Hash", gradient: "linear-gradient(150deg, #a86bf2 0%, #e0559a 45%, #f2874a 100%)", accent: "#e0559a" },
  // Autenticador ("Chave") — azul-marinho de cofre digital.
  APP_018: { glyph: "KeyRound", gradient: "linear-gradient(160deg, #6f8fd6 0%, #3c5aa6 55%, #22366e 100%)", accent: "#7f9cdd" },
  // Tarefas ("Feito") — verde-check.
  APP_019: { glyph: "ListChecks", gradient: "linear-gradient(160deg, #7fe0a3 0%, #35b06e 55%, #1f8552 100%)", accent: "#45c17e" },
  // Ajustes — grafite metálico com engrenagem.
  APP_020: { glyph: "Settings", gradient: "linear-gradient(160deg, #c2cbc6 0%, #838f88 55%, #4d5652 100%)", accent: "#b3bdb6" },
  // Caderno do Caso — âmbar de pasta de investigação (fora da grade, usado em outros lugares).
  APP_021: { glyph: "NotebookPen", gradient: "linear-gradient(160deg, #ffcf8a 0%, #e39a3e 55%, #a86a1d 100%)", accent: "#e6a94f" },
};

/** Fallback por tom quando um app não tem entrada dedicada em APP_VISUALS. */
export const TONE_FALLBACK: Record<string, { gradient: string; accent: string }> = {
  verde: { gradient: "linear-gradient(160deg, #8ad1a0 0%, #4f9e63 100%)", accent: "#8ad1a0" },
  azul: { gradient: "linear-gradient(160deg, #83b5df 0%, #3d6fa8 100%)", accent: "#83b5df" },
  ambar: { gradient: "linear-gradient(160deg, #f1bf6a 0%, #c98d2e 100%)", accent: "#f1bf6a" },
  rosa: { gradient: "linear-gradient(160deg, #dd9bb5 0%, #b5567e 100%)", accent: "#dd9bb5" },
  roxo: { gradient: "linear-gradient(160deg, #a99ade 0%, #6f5cb8 100%)", accent: "#a99ade" },
  cinza: { gradient: "linear-gradient(160deg, #c2cbc6 0%, #5c6660 100%)", accent: "#c2cbc6" },
};

function fallback(tone: string): AppVisual {
  const found = TONE_FALLBACK[tone] ?? TONE_FALLBACK.cinza;
  return { glyph: "Bell", gradient: found.gradient, accent: found.accent };
}

/** Fonte única de verdade para o ícone de home e para o tema ao abrir o app (AppShell). */
export function getAppVisual(appId: string, tone: string): AppVisual {
  return APP_VISUALS[appId] ?? fallback(tone);
}
