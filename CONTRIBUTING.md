# Contributing to The Clara Mystery

Thank you for helping improve this local-first, AI-driven mystery game. Contributions may include code, locale packages, accessibility improvements, narrative fixes, documentation, photographs, or localized audio.

Read this guide before opening an issue or pull request. The repository contains the complete solution, so ordinary collaboration habits can accidentally spoil the game for players.

## Ground rules

- Be respectful and keep technical discussions focused on the work.
- Do not put the culprit, passwords, ending, or solution-bearing evidence in public issue or pull-request titles.
- Preserve the fair-play property: every required conclusion and password must remain discoverable inside the game.
- Do not let generative output become authoritative for progression or essential clue delivery.
- Only submit text, code, images, audio, fonts, or other assets that you created or can redistribute under the MIT License.
- Do not add real personal data, credentials, API keys, analytics, or remote tracking.

## Before you start

For a small fix, open an issue or pull request directly. For a large narrative change, new act, new AI provider, or state-format redesign, open a spoiler-safe discussion first so contributors can agree on compatibility and scope.

Use neutral titles such as:

- `Fix Act 3 disclosure condition`
- `Correct protected album metadata`
- `Add complete es-ES locale`

Put solution details in the issue or pull-request body behind a prominent **Spoilers** heading.

## Development setup

You need:

- Node.js and npm;
- a compatible desktop version of Google Chrome;
- a secure local origin;
- hardware and storage supported by Chrome's Prompt API.

Install and start:

```bash
npm install
npm run dev
```

Open the Vite URL, normally `http://127.0.0.1:5173`.

The phone will not bypass the built-in AI checks in development. Prompt API and Translator API initialization must succeed before a game session starts.

## Branches and pull requests

1. Create a focused branch from the current default branch.
2. Make one coherent change per pull request.
3. Preserve unrelated work already present in your checkout.
4. Update English and Brazilian Portuguese documentation when behavior changes.
5. Run the required verification commands.
6. Describe player-visible behavior, save compatibility, locale impact, and manual checks in the pull-request body.

Keep commits readable and avoid committing generated build output, local work folders, or TypeScript build information. The existing `.gitignore` excludes those files.

## Required verification

Run:

```bash
npm run build
```

This command validates locale contracts, checks TypeScript, and creates the production build. There is currently no automated browser/UI test suite, so also manually verify the behavior affected by your change in compatible desktop Chrome.

For UI work, check:

- normal and hard difficulty when relevant;
- keyboard access and visible focus;
- reduced motion and large text;
- narrow and wide layouts without horizontal overflow;
- sound enabled and disabled;
- restored saves, so old notifications or effects are not replayed.

For chat work, check every affected character independently and verify that invented names, prompt injection, unavailable facts, and canonical clue responses remain controlled.

## Architecture boundaries

The project deliberately separates generative performance from deterministic game rules:

- `src/ai/` adapts browser APIs, sessions, translation, availability, and errors.
- `src/engine/` owns state, progress, rules, disclosure, intentions, hints, and accusation.
- `src/content/` owns stable manifests, assets, character definitions, and act content.
- `src/locales/` owns every player-visible string, localized narrative, and chat behavior.
- `src/persistence/` owns saves, migration, checksums, preferences, and diagnostics.
- `src/ui/` renders state and dispatches explicit actions.

Do not move narrative authority into a model prompt. A model response must not directly:

- unlock an app or lock;
- mark a clue or memory;
- advance an act;
- validate an accusation;
- create a new canonical person or event.

Translate user messages and model responses through the active locale runtime. Do not mix locale histories or reuse one character's AI session for another.

## Narrative IDs and save compatibility

Identifiers such as `APP_0xx`, `CLUE_0xx`, `LOCK_0xx`, `MEMORY_0xx`, `EVENT_0xx`, `CHAR_0xx`, and `VOICE_0xx` are persistent contracts.

- Do not rename or reuse an existing ID for different content.
- Add new IDs instead of changing the meaning of saved IDs.
- Keep rules and conditions outside translated display text.
- Sanitize newly persisted fields when loading a save.
- Increase the save version when the serialized shape or meaning changes.
- Add a migration that preserves valid progress whenever possible.
- Update the checksum input when a new progression field must be tamper-evident.
- Verify a save created before the change and a clean restart.

The legacy unlocalized slot belongs to `pt-BR`. Do not migrate it into another language.

## Adding or changing a locale

Brazilian Portuguese is the only playable locale today. The disabled `en-US` package is a structural example, not a fallback.

A new locale contribution must:

1. register a stable `LocaleId`, native name, BCP-47 HTML language, Translator API language, English model language, and audio directory;
2. start with `enabled: false`;
3. provide every interface, accessibility, error, boot, settings, app, notebook, and accusation string;
4. preserve the exact narrative ID sets and progression conditions;
5. provide all four act modules, with Act 4 still loaded lazily;
6. provide character profiles, canonical lines, intent expressions, name-guard vocabulary, and turn templates;
7. keep facts sent to Gemini Nano in English;
8. provide every required localized audio file under `public/assets/audio/<locale>/`;
9. keep saves, notes, AI sessions, and translated histories isolated by locale;
10. pass `npm run validate:locales` and a complete manual playthrough before changing `enabled` to `true`.

Do not fall back to another locale for missing story text, canonical dialogue, or audio. An incomplete locale must stay unavailable.

## Chat and narrative contributions

Essential clues must remain deterministic. If a character needs to provide an exact name, time, password fragment, contradiction, or fact required to finish the game, add or update a canonical localized response.

When adding character knowledge:

- declare the fact and its disclosure conditions in the engine;
- send only currently allowed facts to the AI session;
- update the deterministic name matrix when a new fictional person is introduced;
- add localized intent patterns when disclosure depends on how the player asks;
- ensure the model treats unsupported player statements as allegations, not truth;
- test the same question before and after the intended trigger.

The original design documents contain obsolete mechanics as well as the canonical story. Current executable behavior takes precedence unless the contribution deliberately updates both.

## Media contributions

Photographs must use the exact filename referenced by the story and belong in:

```text
public/assets/photos/
```

Audio must be localized and belong in:

```text
public/assets/audio/<locale>/<VOICE_ID>.m4a
```

Include source and licensing information in the pull-request description. Do not submit media containing a real person's likeness, voice, private information, trademarks, or copyrighted material unless you have the necessary rights and consent.

Generated media must still satisfy the evidence constraints in the production brief. Visual polish must not make a clue unreadable, introduce a false clue, expose the solution early, or change established character continuity.

## Chrome Built-in AI changes

The Prompt API and Translator API are evolving browser APIs. When reporting or fixing a compatibility change:

- include Chrome version, operating system, secure-context URL, and the returned availability state;
- distinguish Prompt API behavior from Translator API behavior;
- link to an official Chrome document, explainer, Chromium issue, or specification;
- keep compatibility aliases inside `src/ai/` instead of spreading version checks through the UI;
- preserve localized, actionable boot feedback;
- never bypass user activation or silently trigger a model download.

Do not include diagnostic output that contains private player messages.

## Documentation

`README.md` is the canonical English project overview. `README.pt-BR.md` is its Brazilian Portuguese counterpart. Update both when requirements, setup, architecture, persistence, or public behavior changes.

`docs/README.md` indexes spoiler-bearing production artifacts. New production documents must be added to that index with language, spoiler level, and purpose.

## License

By contributing, you agree that your contribution is distributed under the repository's [MIT License](LICENSE). You confirm that you have the right to submit every included file under those terms.
