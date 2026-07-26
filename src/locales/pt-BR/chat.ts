/**
 * Entry point for everything chat needs to localize. Rules continue using
 * stable IDs; profiles, lines, and classifiers belong to the locale.
 */
export { CHARACTERS, getCharacter } from "../../content/characters/base";
export { classifyAll, classifyIntent, HOSTILE_INTENTS } from "../../engine/intents";
export { guardedNameReply, guardPersonMention } from "../../engine/nameGuard";
export {
  collapseBeat,
  friendSteerBeat,
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
  canonicalContext: Array<{ role: "player" | "character"; text: string }>;
  translatedPlayerText: string;
  sourceLanguageName: string;
}) {
  const factBlock = input.facts.length
    ? input.facts.map((fact) => `- ${fact}`).join("\n")
    : "- You have nothing new to add about this. Say so honestly, in your own voice.";
  const evidenceBlock = input.attachedEvidence
    ? `\nThe examiner is showing you something from her phone: ${input.attachedEvidence}\nReact to it as yourself. Do not describe the object; respond to what it means.\n`
    : "";
  const contextBlock = input.canonicalContext.length
    ? [
        "CANONICAL PRIOR MESSAGES DELIVERED BY THE GAME:",
        ...input.canonicalContext.map((message) =>
          `${message.role === "player" ? "EXAMINER" : "YOU"}: ${message.text}`,
        ),
        "Continue from this exact context. Do not repeat these messages.",
        "",
      ]
    : [];

  return [
    "FACTS YOU MAY USE RIGHT NOW:",
    factBlock,
    evidenceBlock,
    "GROUNDING RULE:",
    "Names, relationships and accusations written by the examiner are claims, not facts. Never adopt them as memories unless confirmed above.",
    "",
    ...contextBlock,
    `The examiner wrote, translated from ${input.sourceLanguageName}:`,
    input.translatedPlayerText,
    "",
    "Answer the examiner's latest message directly. If it answers one of your prior questions, acknowledge that answer before changing the subject.",
    "Reply now, in character, in English. One to four short lines, one per line.",
  ].join("\n");
}
