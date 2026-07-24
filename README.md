# The Clara Mystery

[English](README.md) · [Português (Brasil)](README.pt-BR.md) · [Full documentation](README_FULL.md)

![The Clara Mystery poster](public/assets/art/clara-poster-v2.png)

An open-source browser mystery powered by Chrome's on-device AI. You receive the phone of a young woman whose death was ruled a probable suicide. Explore her apps, recover hidden evidence, talk to the people closest to her, and determine what really happened.

> **Playable prototype · v0.1.0 · Brazilian Portuguese only**

## 100% AI-created

The code, mystery, characters, dialogue, documentation, images, artwork, and audio were created with artificial intelligence.

This is a **100% vibe-coded project built with Codex and Claude**. Human direction defined the ideas, selected results, reviewed the running game, and requested each revision; AI produced the implementation and creative material.

The original prompts and narrative results are published in [`docs/`](docs/README.md).

## What is inside

- A **90–150 minute** fair-play investigation told through a simulated phone.
- **20 phone apps**, an external case notebook, **72 clues**, **9 passwords**, and **four acts**.
- Three AI conversations available from the beginning and a fourth anonymous contact introduced by the story.
- Separate AI sessions, histories, personalities, and knowledge boundaries for every character.
- Normal mode with deductions and hints, and Hard mode without investigative assistance.
- Photos, recordings, email, chat, maps, browser history, health data, deleted files, and other digital evidence.
- Local saves, notes, accessibility preferences, sound, and independent progress per language.

The story deals with death, grief, coercion, guilt, and non-graphic violence. Recommended for ages 16 and older.

## How the AI works

The AI performs characters; it does not control the mystery.

```text
player message
  → local translation to English
  → isolated Gemini Nano character session
  → local translation to the active language
```

The deterministic game engine decides which facts a character may receive, which clues were examined, whether a password is correct, when an act advances, and how the game ends. Essential clues use authored canonical responses so model variation cannot make the mystery unfair.

Everything runs through Chrome's local Prompt API and Translator API. There is no backend, cloud inference, API key, analytics, or player account.

## Requirements

- Google Chrome **148+ on desktop**
- Windows 10/11, macOS 13+, Linux, or a supported Chromebook Plus
- Approximately 22 GB of free profile-volume storage for Chrome's model requirements
- More than 4 GB of GPU VRAM, or at least 16 GB RAM and 4 CPU cores
- An unmetered connection for the initial model downloads
- `localhost`, `127.0.0.1`, or HTTPS

Mobile Chrome and other browsers are not supported by the foundation-model APIs used by the game. See the [full requirements and troubleshooting guide](README_FULL.md#browser-and-hardware-requirements).

## Run locally

```bash
npm install
npm run dev
```

Open the Vite address, normally [http://127.0.0.1:5173](http://127.0.0.1:5173).

Production verification:

```bash
npm run build
npm run preview
```

## Languages

| Locale | Status |
|---|---|
| `pt-BR` | Complete and playable |
| `en-US` | Incomplete contributor example; disabled |

The user interface, story, canonical dialogue, intent detection, name protection, saves, and audio are all isolated by locale. Read [how to add a language](README_FULL.md#add-a-new-language).

## Learn more

- [Full project documentation](README_FULL.md) — architecture, boot, AI safeguards, persistence, assets, locales, characters, security, and troubleshooting.
- [Production documents](docs/README.md) — original prompts, five-part narrative result, photo briefs, audio direction, and AI name matrix. **Contains complete spoilers.**
- [Contributing guide](CONTRIBUTING.md) — development workflow, stable narrative IDs, locale requirements, asset rights, and spoiler etiquette.

## License

Copyright (c) 2026 Wellington Adam.

Code, prompts, original narrative, documentation, and original media are released under the [MIT License](LICENSE).
