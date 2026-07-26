/**
 * Entry point for everything chat needs to localize. Rules continue using
 * stable IDs; profiles, lines, and classifiers belong to the locale.
 */
export { CHARACTERS, getCharacter } from "../../content/characters/base";
export { classifyAll, classifyIntent, HOSTILE_INTENTS } from "../../engine/intents";
export { guardedNameFact, guardedNameReply, guardPersonMention } from "../../engine/nameGuard";
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
export { knownPeopleFor } from "../../content/people";
export { getClue } from "../../content/manifest";

export function buildTurnPrompt(input: {
  facts: string[];
  /** People the character can already put a name to. Identity, not disclosure. */
  cast: string[];
  attachedEvidence?: string;
  canonicalContext: Array<{ role: "player" | "character"; text: string }>;
  translatedPlayerText: string;
  sourceLanguageName: string;
}) {
  const factBlock = input.facts.length
    ? input.facts.map((fact) => `- ${fact}`).join("\n")
    : "- You have nothing new to add about this. Say so honestly, in your own voice.";
  const castBlock = input.cast.length
    ? [
        "PEOPLE YOU KNOW BY NAME:",
        ...input.cast.map((person) => `- ${person}`),
        "You recognise these names the moment you read them. Knowing who someone is costs you nothing and is not a new fact — but what you may say ABOUT them is still limited to the facts above. Anyone not on this list you genuinely do not know.",
        "",
      ]
    : [];
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
    ...castBlock,
    "FACTS YOU MAY USE RIGHT NOW:",
    factBlock,
    evidenceBlock,
    "GROUNDING RULE:",
    "Relationships, events and accusations written by the examiner are claims, not facts. Never adopt them as memories unless confirmed above.",
    "This does not apply to the names listed above. Refusing to recognise someone you know is a lie, not caution.",
    "",
    ...contextBlock,
    `The examiner wrote, translated from ${input.sourceLanguageName}:`,
    input.translatedPlayerText,
    "",
    "Answer the examiner's latest message directly. If it answers one of your prior questions, acknowledge that answer before changing the subject.",
    "Reply now, in character, in English. One to four short lines, one per line.",
  ].join("\n");
}
