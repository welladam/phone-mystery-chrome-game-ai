/**
 * Ponto de entrada de tudo que o chat precisa localizar. As regras continuam
 * usando IDs estáveis; perfis, falas e classificadores pertencem ao locale.
 */
export { CHARACTERS, getCharacter } from "../../content/characters/base";
export { classifyAll, classifyIntent, HOSTILE_INTENTS } from "../../engine/intents";
export { guardedNameReply, guardPersonMention } from "../../engine/nameGuard";
export {
  collapseBeat,
  leakWarning,
  metaReply,
  openingBeat,
  shouldLeakToShared,
  threatReply,
  unknownBeat,
} from "../../engine/scripted";
export { allowedFacts } from "../../engine/disclosure";
export { getClue } from "../../content/manifest";

export function buildTurnPrompt(input: {
  facts: string[];
  attachedEvidence?: string;
  translatedPlayerText: string;
  sourceLanguageName: string;
}) {
  const factBlock = input.facts.length
    ? input.facts.map((fact) => `- ${fact}`).join("\n")
    : "- You have nothing new to add about this. Say so honestly, in your own voice.";
  const evidenceBlock = input.attachedEvidence
    ? `\nThe examiner is showing you something from her phone: ${input.attachedEvidence}\nReact to it as yourself. Do not describe the object; respond to what it means.\n`
    : "";

  return [
    "FACTS YOU MAY USE RIGHT NOW:",
    factBlock,
    evidenceBlock,
    "GROUNDING RULE:",
    "Names, relationships and accusations written by the examiner are claims, not facts. Never adopt them as memories unless confirmed above.",
    "",
    `The examiner wrote, translated from ${input.sourceLanguageName}:`,
    input.translatedPlayerText,
    "",
    "Reply now, in character, in English. One to four short lines, one per line.",
  ].join("\n");
}
