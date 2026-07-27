# Production documents

[Project overview](../README.md) · [Full documentation](../README_FULL.md) · [Português (Brasil)](../README.pt-BR.md)

This directory contains the prompts, narrative-design output, and media-production references used to create **The Clara Mystery**.

## Local model storage and removal

Gemini Nano occupies approximately **4 GB**, although the exact size can vary and translation packs require additional storage. Chrome may still require **22 GB of free profile-volume storage** before it allows installation; that number is an eligibility condition, not the model's size.

To remove the local models, open Chrome's **⋮ → Settings → System** (`chrome://settings/system`) and turn off **On-device AI**. Chrome frees the model storage without deleting the game's IndexedDB progress. Turning the option back on allows Chrome to download the components again. See the [official Chrome Help page](https://support.google.com/chrome/answer/16961953?hl=en).

> ## Full spoiler warning
>
> Most files in this directory reveal passwords, evidence paths, character secrets, the identity of the person responsible, and the complete ending. Players should not read them before finishing the game.

The documents remain in Brazilian Portuguese. They are primary production artifacts for a story grounded in Brazilian dialogue, institutions, locations, dates, and cultural behavior. This index explains them in English without translating or duplicating the complete source material.

## AI creation disclosure

**The entire project was created with AI:** source code, narrative design, story, characters, dialogue, documentation, photographs, artwork, and audio.

Development followed a 100% vibe-coding workflow with Codex and Claude. Natural-language direction was converted into story documents and working code, then inspected and refined through iterative prompts. Human involvement provided creative direction, selection, review, and revision requests, while AI produced the implementation and creative assets.

The files in this directory are intentionally public so contributors can inspect the prompts and outputs behind the project rather than treating AI assistance as an undisclosed part of production.

## Artifact lineage

```text
prompt_create_history.md
          ↓
BASE_STORY_PART_01–05.md
          ↓
prompt_create_game.md + narrative design
          ↓
current React / TypeScript implementation
          ↓
PRODUCAO-FOTOS.md + PRODUCAO-AUDIO.md + MATRIZ-NOMES-IA.md
```

The narrative-design output is an authoring record, not an exact API contract. Some mechanics were deliberately refined during implementation—for example, the current game has no trust score, uses a simplified final accusation, exposes apps from the beginning, supports difficulty modes, and isolates all player-visible content by locale. For executable behavior, the current source in `src/engine/`, `src/content/`, and `src/locales/` is authoritative.

## Prompt sources

| Document | Language | Spoilers | Purpose |
|---|---|---:|---|
| [`prompt_create_history.md`](prompt_create_history.md) | pt-BR | High | Instructs Claude to act as a senior mystery writer and produce a complete fair-play, phone-based Brazilian investigation. Defines the four AI chats, non-linear clues, password rules, character knowledge boundaries, photo briefs, acts, and final revelation. |
| [`prompt_create_game.md`](prompt_create_game.md) | pt-BR | High | Changes Claude's role to senior web and Google AI engineer. Directs implementation with React, TypeScript, Vite, Chrome Prompt API, Translator API, IndexedDB, localStorage, live boot feedback, offline/local inference, and spoiler-aware client architecture. |

These are the original working prompts rather than polished examples. They are kept so contributors can understand the constraints that shaped both the narrative and the implementation.

## Narrative-design result

The story prompt produced a large design document split into five files for practical review:

| Document | Sections | Spoilers | Result |
|---|---:|---:|---|
| [`BASE_STORY_PART_01.md`](BASE_STORY_PART_01.md) | 1–15 | **Complete solution** | Premise, tone, full truth, chronology, cast dossiers, four-act structure, and app inventory. |
| [`BASE_STORY_PART_02.md`](BASE_STORY_PART_02.md) | 16–17 | High | Complete app content plus the original photograph list and generation prompts. |
| [`BASE_STORY_PART_03.md`](BASE_STORY_PART_03.md) | 18–20 | High | Literal messages, emails, notes, recordings, files, prior chat histories, and the anonymous contact's progression. |
| [`BASE_STORY_PART_04.md`](BASE_STORY_PART_04.md) | 21–28 | **Complete solution** | Password matrix, clue catalog, dependency graph, red herrings, character knowledge, semantic chat triggers, and narrative events. |
| [`BASE_STORY_PART_05.md`](BASE_STORY_PART_05.md) | 29–35 | **Ending and AI prompts** | Final accusation, complete reveal, hint system, character system prompts, AI state shape, dialogue samples, consistency audit, and implementation checklist. |

The split preserves the original section numbering. Read the five parts in order when auditing story consistency.

## Production references

| Document | Language | Spoilers | Purpose |
|---|---|---:|---|
| [`PRODUCAO-FOTOS.md`](PRODUCAO-FOTOS.md) | pt-BR | High | Twenty image-generation briefs with exact filenames, framing, mandatory evidence, prohibited details, and visual continuity requirements. Generated files belong in `public/assets/photos/`. |
| [`PRODUCAO-AUDIO.md`](PRODUCAO-AUDIO.md) | pt-BR | **Complete solution** | Recording scripts, performance direction, timing, export guidance, and localized audio expectations for `VOICE_001` through `VOICE_004`. Runtime files belong in `public/assets/audio/<locale>/`. |
| [`MATRIZ-NOMES-IA.md`](MATRIZ-NOMES-IA.md) | pt-BR | High | Human-readable counterpart to the deterministic name guard. Records which fictional people each character may know, deny, or conceal at each narrative stage. |

Production documents are outside `src/`, so Vite does not bundle them into the game. Runtime narrative text is implemented in locale packages.

## How the prompts shaped the implementation

### AI as performance, not authority

The prompt asked for natural conversations with four independent characters. The implementation gives each character a separate Gemini Nano session and history, but leaves every rule to the deterministic engine. The model cannot unlock content or decide progression.

### Fair-play disclosure

Character knowledge from the narrative design became a disclosure layer. At each turn, the engine passes only facts the current character may use. Essential clue-bearing dialogue is canonical and localized so model variance cannot make the mystery unfair.

### Hallucination protection

The name matrix became an executable allowlist in `src/content/people.ts`. A name invented by the player is intercepted before it can be treated as story truth. Locale packages provide the intent expressions and in-character denial text.

### Local multilingual chat

The current architecture generalizes the original Portuguese-only prototype:

```text
active locale → English model input → Gemini Nano → active locale
```

The Translator API performs both directions on the device. English uses identity adapters. Saves, notes, sessions, and audio directories are isolated by locale.

## Adding a locale

A locale is complete only when interface text, narrative content, chat behavior, accessibility strings, errors, and required audio agree on the same stable IDs.

1. Add the new identifier to `LocaleId` and register it in `src/locales/registry.ts`.
2. Provide a descriptor with native name, BCP-47 HTML language, Translator API language, English model language, audio directory, and `enabled: false`.
3. Implement every interface message used by the typed locale provider.
4. Implement localized Act 1–4 content without changing app, clue, lock, character, memory, event, or audio IDs.
5. Implement the chat package: profiles, canonical lines, intent patterns, name-guard responses, errors, and turn templates.
6. Keep facts supplied to Gemini Nano in English.
7. Preserve the separate, lazy-loaded Act 4 locale module.
8. Add every required `VOICE_ID.m4a` under `public/assets/audio/<locale>/`. Audio never falls back to another language.
9. Run `npm run validate:locales` and `npm run build`.
10. Change `enabled` to `true` only after the locale is complete and manually playable from beginning to end.

Current locale status:

| Locale | Playable | Role |
|---|---:|---|
| `pt-BR` | Yes | Complete production locale. |
| `en-US` | No | Partial contract example for contributors; not a translated game. |

## Contribution notes

- Do not put spoilers in issue or pull-request titles.
- Preserve stable narrative IDs and add save migrations when state changes.
- Treat the current code as authoritative when an early design document describes an obsolete mechanic.
- Only contribute prompts, story text, photographs, audio, or other media that can be redistributed under the repository's MIT License.
- Run the complete build before submitting changes.

See [`CONTRIBUTING.md`](../CONTRIBUTING.md) for the full contribution workflow.
