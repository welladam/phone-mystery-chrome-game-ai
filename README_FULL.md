# The Clara Mystery

[Quick overview](README.md) · [Full documentation in English](README_FULL.md) · [Documentação completa em português](README_FULL.pt-BR.md) · [Production documents](docs/README.md)

![The Clara Mystery poster](public/assets/art/clara-poster-v2.png)

An open-source investigative narrative that runs entirely in the browser. You receive the phone of a young woman whose death was ruled a probable suicide. Explore its apps, recover what was hidden, talk to the people closest to her, and determine what really happened.

The conversations are powered by Chrome's on-device Prompt API and Gemini Nano. There is no backend, cloud inference, API key, or account system: the model, translation, game state, and saved investigation remain on the player's computer.

> **Project status:** playable prototype, version 0.1.0. Brazilian Portuguese is complete and playable. The English locale is an intentionally incomplete, disabled reference package for contributors.

> **Content notice:** recommended for ages 16 and older. The story deals with death, grief, coercion, guilt, and non-graphic violence. There is no graphic depiction of the death and no supernatural solution.

## 100% AI-created, 100% vibe coded

This project is an experiment in fully AI-assisted creative development. **The source code, game design, mystery, characters, dialogue, production documents, photographs, artwork, and audio were all created with artificial intelligence.**

The project was built through **100% vibe coding with Codex and Claude**: ideas were described in natural language, implemented iteratively by AI, reviewed in the running project, and refined through further prompts. Human direction defined the creative intent, selected results, requested revisions, and guided the final experience; the implementation and content-generation workflow itself was AI-driven.

The prompts and narrative results are kept in [`docs/`](docs/README.md) as a transparent record of that process.

## The game

Clara Mendonça Vasques, 24, a journalism student and freelance video editor in Juiz de Fora, Brazil, was found dead below a scenic overlook on March 9, 2026. After five weeks, the investigation was closed with a strong indication of suicide.

Her mother does not accept that conclusion. Two months later, she hires you as an independent digital investigator and gives you Clara's phone, which the police returned after closing the case.

The first playthrough takes approximately **90–150 minutes**. Everything required to solve the mystery exists inside the phone and in the contradictions between the people who answer you.

### What the player does

- Explore **20 phone apps** plus an external case notebook.
- Examine **72 registered clues** without manually marking items as evidence.
- Solve **9 fair-play passwords** using information found inside the device.
- Progress through **four acts** driven by understanding and discoveries rather than a fixed click order.
- Talk to three people from the beginning and a fourth, anonymous contact after a narrative trigger.
- Write personal notes and, in the final act, identify the person responsible.

All apps are visible from the beginning. Public content can be explored immediately; protected apps, albums, documents, and recordings open their password screen until the correct answer is found. The final revelation remains isolated until the correct narrative state is reached.

### Difficulty modes

| Mode | Experience |
|---|---|
| Normal | Shows deductions, people, progressive hints, narrative progress notices, and visual emphasis around potential evidence. |
| Hard | Tracks the same discoveries and progression silently, but locks deductions, people, and hints and removes clue-oriented highlights. Functional feedback such as incorrect passwords and unread messages remains visible. |

Difficulty is selected before the phone starts and is stored with that locale's save. Restarting the investigation clears the selected mode.

### Case material and notebook

After the local components are ready—and before the phone turns on—the player receives a sealed case folder that came with the device. It contains the spoiler-free briefing, the police's conclusion, the three initial contacts, and the phone's screen PIN. The folder remains available beside **Options** throughout the investigation.

The case notebook opens outside the phone, beside it on wide screens. Free-form notes imitate lined paper and are saved automatically in the browser. Normal mode also exposes deductions, known people, and progressive hints; Hard mode leaves those tabs visibly locked. In Act 4, the accusation page asks the player to understand responsibility, motive, method, and opportunity, but only the responsible person's name is submitted.

The phone contains Notifications, Chat, Photos, Email, Contacts, Calendar, Browser, Phone, Recorder, Notes, Maps, Drive, Trash, Health, Bank, Rides, Social Network, Authenticator, Tasks, and Settings. The notebook is the twenty-first registered surface but is rendered externally.

## How AI is used

The AI performs characters; it does not control the mystery.

Each AI-backed character owns an isolated Prompt API session with:

- a dedicated system prompt;
- a dedicated conversation history;
- a distinct personality and writing rhythm;
- a character-specific set of facts currently allowed by the game engine.

At every turn, the deterministic engine calculates what the selected character may know and disclose. A locked fact is not hidden inside a larger prompt—it is never sent to that model session. Prompt injection, persistence, or a direct request for the solution therefore cannot retrieve information the model never received.

The opposite boundary is equally important: the model cannot unlock an app, accept a password, discover a clue, advance an act, or finish the game. Those decisions belong to the state machine in `src/engine/`.

There is no trust score or temperature-based relationship system. Every character has their full personality from the first message and withholds information for narrative reasons.

### Deterministic narrative safeguards

- **Canonical clue lines:** dialogue that carries an exact clue is authored in each locale and returned directly instead of relying on a variable model response.
- **Fact disclosure:** only facts allowed by the current state are injected into a character session.
- **Name guard:** fictional names have a deterministic allowlist per character and act. Invented names receive an in-character canonical denial and are not promoted to case facts.
- **Intent detection:** localized expressions identify relevant questions while stable IDs keep progression independent from wording.
- **Separate sessions:** one character cannot read another character's history.

The production name matrix and its behavior are documented in [`docs/MATRIZ-NOMES-IA.md`](docs/MATRIZ-NOMES-IA.md).

## How local translation works

The Prompt API session operates in English. For a playable non-English locale, one turn follows this pipeline:

```text
player text in active locale
        ↓  Chrome Translator API
English turn prompt + currently allowed facts
        ↓  Chrome Prompt API / Gemini Nano
English character response
        ↓  Chrome Translator API
localized chat bubbles stored in that locale's save
```

Protected names, nicknames, and fictional brands are temporarily replaced with sentinels before translation and restored afterwards. Translation is performed line by line so that emoji, line breaks, and a character's fragmented writing style are retained.

For a future playable `en-US` package, both translation directions become identity adapters, so no translation language pack is requested.

## Boot and model download

The phone does not turn on until the required local components are available and verified.

1. The player selects a playable language and a difficulty.
2. The boot screen checks Prompt API, Translator API, secure-context, storage, and model availability.
3. If Chrome reports missing components, the player explicitly starts the download. Model creation requires user activation.
4. The interface reports authorization, download, installation, and verification states in real time.
5. A round-trip probe verifies translation to English, a model response, and translation back to the active locale.
6. Only after every step succeeds does the phone start.

Chrome owns the models and language packs. They are normally reused after the first download, but Chrome can update or remove them when storage becomes constrained. A later visit may therefore verify existing components quickly or request a new download.

## Browser and hardware requirements

For the complete web experience:

- **Google Chrome 148 or newer on desktop.** Prompt API support for websites begins in Chrome 148; the Translator API has been available since Chrome 138.
- Windows 10/11, macOS 13+, Linux, or Chromebook Plus on a supported ChromeOS version.
- At least **22 GB of free storage** on the volume containing the Chrome profile.
- Either more than 4 GB of GPU VRAM, or at least 16 GB of system RAM and 4 CPU cores for CPU execution.
- An unmetered connection for the initial model and language-pack downloads.
- A secure context: `localhost`, `127.0.0.1`, or HTTPS.

Chrome for Android and iOS is not supported by the foundation-model APIs used here. The Translator API is also unavailable in Web Workers.

The requirements and API signatures may change. Check the official [Prompt API documentation](https://developer.chrome.com/docs/ai/prompt-api), [Translator API documentation](https://developer.chrome.com/docs/ai/translator-api), and [Built-in AI API status](https://developer.chrome.com/docs/ai/built-in-apis) before publishing a deployment.

## Run locally

### Prerequisites

- Node.js with npm
- A compatible desktop version of Google Chrome
- The hardware and storage described above

### Install and start

```bash
npm install
npm run dev
```

Open the URL printed by Vite, normally [http://127.0.0.1:5173](http://127.0.0.1:5173).

Do not open `index.html` through `file://` and do not use an unsecured LAN IP. Those are not secure contexts, so Chrome will not expose the required APIs.

### Production build

```bash
npm run build
npm run preview
```

`npm run build` executes:

1. `npm run validate:locales`;
2. TypeScript project compilation with `tsc -b`;
3. a minified Vite production build.

Production source maps are disabled. Narrative content is split into act-specific chunks, including a separate Act 4 chunk so the final reveal is not part of the initial download.

### Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite on `127.0.0.1`. |
| `npm run validate:locales` | Validate locale contracts, visible-text coverage, required IDs, and playable-locale audio. |
| `npm run build` | Validate locales, type-check, and build production assets. |
| `npm run preview` | Preview the production build on `127.0.0.1`. |

## Troubleshooting

| Symptom | What to check |
|---|---|
| Prompt API or Translator API is missing | Use desktop Chrome 148+, confirm the page is HTTPS or localhost, and verify that the device meets the model requirements. |
| Components show as downloadable again | Chrome may have updated or evicted a model. Keep enough free storage and start the download from the game's boot button. |
| Download stays at 100% before finishing | `downloadprogress.loaded` reaches 1 before extraction and in-memory initialization are necessarily complete. Wait for the verification step. |
| Translation or conversation is interrupted | Retry from the localized error screen. Accepted progress and previous messages remain saved. |
| The game works in development but not on a hosted URL | Confirm that the host serves HTTPS and does not place the app in a cross-origin iframe without the required Permissions Policy. |
| Saved progress is unavailable | IndexedDB may be blocked by private-browsing rules, enterprise policy, full storage, or another tab holding an upgrade transaction. |

Chrome can remove the foundation model when available storage falls below its maintenance threshold. The current model state can be inspected at `chrome://on-device-internals`.

## Privacy and persistence

No investigation data or model prompt is sent to this project, Google, or a third-party game server. Inference and translation happen on the device through browser-managed models.

| Storage | Contents |
|---|---|
| IndexedDB `clara-caso-0447` | Investigation state and diagnostics. Saves use locale-specific keys such as `slot-principal:pt-BR`. |
| `localStorage` key `clara.prefs.v1` | Locale and accessibility preferences, sound preference, and the last open app. |
| `localStorage` key `clara.case-notes.v2:<locale>` | The player's free-form case notes, isolated by language. |

Saves contain reached IDs and state, not locked solution text. A checksum detects casual modification and malformed or incompatible saves are rejected safely. Legacy saves and notes are migrated to `pt-BR` once.

Changing the language saves the current slot, destroys translators and AI sessions, reloads the page, and opens the selected locale's independent investigation. Restored saves do not replay old incoming-message notifications.

Use **Options → Restart the investigation from scratch** to clear progress, conversations, notes, difficulty, and legacy timeline data for the active locale. Browser-managed AI models and accessibility preferences remain installed.

### Save versions and migration

- **v1 → current:** the first single-chat prototype described a different story, so that incompatible state is intentionally discarded.
- **v2 → v3:** clues, conversations, acts, and discoveries are preserved; restored games default to Normal mode, the old timeline is ignored, and only a free-text responsible-person value is retained from a started accusation.
- **Pre-locale storage → pt-BR:** the legacy save slot and notebook key are migrated once because all earlier content was Brazilian Portuguese.

Future serialized changes must add an explicit migration instead of silently invalidating compatible progress. A failed checksum starts a clean investigation without modifying other browser data.

## Project structure

```text
src/
  ai/           Chrome API adapters, availability, boot, sessions, and errors
  content/      neutral manifest, act bundles, characters, dossier, and assets
  engine/       deterministic state, rules, disclosure, intents, hints, and saves
  i18n/         typed React locale provider and message interpolation
  locales/      locale registry, UI catalogs, narrative acts, and chat packages
  persistence/  IndexedDB, checksummed saves, preferences, and diagnostics
  ui/           boot flow, phone shell, apps, notebook, accusation, and reveal
scripts/
  validate-locales.mjs
docs/           prompts, narrative output, and production references
public/assets/
  art/          poster and presentation artwork
  photos/       replaceable evidence photographs
  audio/
    <locale>/   localized voice recordings
```

The application is built with React 19, TypeScript, Vite, and Lucide icons.

### Interface details

- A custom forensic cursor distinguishes clickable, disabled, and text-input states.
- Text selection is disabled across the simulated device except where the player types or copies relevant case material.
- Phone scrollbars use a muted device-specific treatment.
- New deductions and act changes use narrative overlays in Normal mode; restored investigations do not repeat already-seen feedback.
- Received chat messages can show phone-style banners and localized sound effects without replaying restored history.
- Photo evidence opens in a focus-trapped viewer with keyboard closing, wheel zoom, controls, and drag-to-pan.

### Chrome API compatibility layer

All browser-AI access is isolated under `src/ai/`. The adapters normalize both current and older availability labels, treat download progress as a 0–1 ratio rather than bytes, and keep extraction/initialization distinct from download completion. Model creation is triggered by a user gesture; abort signals are used for prompts rather than component installation. Context-usage and overflow aliases are also contained in this layer so future API changes do not spread through the UI.

## Production assets

### Photographs

Save an image in `public/assets/photos/` using the exact filename declared by the corresponding photo record, such as:

- `IMG_20260308_1944.jpg`
- `tribuna_barao.png`
- `print_live_diego_080326.png`

If a file is absent, the game renders a metadata-aware placeholder. The 20 generation briefs are in [`docs/PRODUCAO-FOTOS.md`](docs/PRODUCAO-FOTOS.md).

### Audio

Localized recordings use:

```text
public/assets/audio/<locale>/<VOICE_ID>.m4a
```

For example, Brazilian Portuguese provides `VOICE_001.m4a` through `VOICE_004.m4a` under `public/assets/audio/pt-BR/`. There is deliberately no fallback to another language. Timed localized transcripts remain the canonical evidence even when audio is present.

Recording scripts and direction are in [`docs/PRODUCAO-AUDIO.md`](docs/PRODUCAO-AUDIO.md).

Only submit assets that you created or have the right to redistribute under this repository's license.

## Add a new language

Locales are explicit, typed content packages rather than runtime machine translations of the interface or story.

1. Extend `LocaleId` and register metadata in `src/locales/registry.ts`: native name, BCP-47 HTML language, Translator API language, model language, audio directory, and availability.
2. Implement the complete UI catalog: boot, accessibility, errors, settings, apps, notebook, and accusation.
3. Implement localized Act 1–4 narrative modules while preserving stable app, clue, character, lock, memory, event, and audio IDs.
4. Provide the locale's character profiles, canonical dialogue, intent expressions, invented-name responses, and turn templates.
5. Keep facts passed to Gemini Nano in English. These are model inputs, not player-visible translations.
6. Route every audio ID to `public/assets/audio/<locale>/` and provide all required recordings before marking the locale playable.
7. Preserve the lazy Act 4 boundary so the reveal is imported only when progression allows it.
8. For an English locale, use the existing identity translation path rather than requesting unnecessary language packs.
9. Run `npm run validate:locales` and `npm run build`.
10. Set `enabled: true` only after the package, narrative, chat safeguards, and audio pass validation.

Current status:

| Locale | Status | Notes |
|---|---|---|
| `pt-BR` | Playable | Complete interface, narrative, chat package, and required audio. |
| `en-US` | Disabled example | Demonstrates the metadata and initial UI contract; it is not a playable translation. |

Never mix already translated chat histories across locale saves.

## Add a chat character

1. Add the stable identifier to `CharacterId`.
2. Define the localized profile, system prompt, writing style, opening lines, and canonical meta/abuse responses.
3. Declare the facts the character may use and their disclosure conditions.
4. Add any late-entry trigger to the deterministic rules and reducer.
5. Include the character in the active-character selector or initial state as appropriate.
6. Extend the allowed-name matrix and locale validation.

The chat list is generated from character definitions, so a correctly registered character does not require a separate hard-coded screen.

## Prompts and narrative results

The original prompts used to design the story and direct the first implementation are included with the complete narrative output. These artifacts remain in Brazilian Portuguese because the mystery is grounded in Brazilian language, institutions, places, dates, and chat behavior.

See the spoiler-aware [production documentation index](docs/README.md) for:

- the story-design prompt;
- the implementation prompt;
- the five-part narrative design result;
- photo-generation prompts;
- audio-production direction;
- the deterministic AI name matrix.

The production documents are intentionally outside `src/` and are not bundled into the browser application.

## Security and spoiler protection

This is a fully client-side application. It cannot offer absolute protection against a determined person inspecting downloaded JavaScript with DevTools.

Reasonable protection against accidental spoilers includes:

- opaque IDs such as `CLUE_0xx` and `EVENT_0xx`;
- no solution-bearing text in save files;
- no global game-state object;
- no prompts embedded in the HTML;
- disabled production source maps and minification;
- act-specific chunks, with the final reveal loaded late;
- state transitions enforced by the reducer;
- checksummed and sanitized saves.

The project intentionally does not block right-click, F12, keyboard shortcuts, or DevTools. Those techniques are hostile to users and do not secure client-side secrets. Strong secrecy would require a backend that withholds narrative content and validates progression server-side, which conflicts with this project's local-first design.

## Known limitations

- The Prompt API and other Chrome Built-in AI APIs are evolving and may change names, statuses, signatures, or hardware requirements.
- There is no cloud or server fallback for unsupported browsers or devices.
- The project currently has no automated browser/UI test suite; validation, TypeScript, production build, and a manual playthrough are the release checks.
- Generative dialogue can still vary. Essential clue delivery remains deterministic to preserve fairness.
- Only Brazilian Portuguese is currently playable.
- The client-side architecture limits protection against deliberate source inspection.

## Contributing

Contributions are welcome. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening an issue or pull request, especially the rules about spoilers, stable narrative IDs, locale completeness, save migrations, and asset rights.

## License

Copyright (c) 2026 Wellington Adam.

The code, prompts, original narrative, documentation, and original media in this repository are released under the [MIT License](LICENSE). Contributors must only add material they can legally distribute under the same terms.
