/**
 * Replaceable asset mapping.
 *
 * Drop the real file into `public/assets/...` with the expected name. No game
 * logic changes: components try to load the file and draw a placeholder with
 * the correct metadata when it does not exist.
 */

import type { LocaleId } from "../locales/types";

const PUBLIC_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export const PHOTO_DIR = `${PUBLIC_BASE}/assets/photos`;
export const AUDIO_DIR = `${PUBLIC_BASE}/assets/audio`;
export const VIDEO_DIR = `${PUBLIC_BASE}/assets/videos`;

/** Poster used as evidence on the entry screen. */
export const POSTER_SRC = `${PUBLIC_BASE}/assets/art/clara-poster-v2.png`;

/**
 * Loads the image using its real story filename (the `file` field on each photo,
 * e.g. `IMG_20260308_1944.jpg` or `tribuna_barao.png`). Generated files can then
 * be placed in the folder under their own names while preserving the original
 * extension (jpg or png), with no renaming or conversion.
 */
export function photoSrc(fileName: string) {
  return `${PHOTO_DIR}/${fileName}`;
}

export function audioSrc(locale: LocaleId, voiceId: string) {
  return `${AUDIO_DIR}/${locale}/${voiceId}.m4a`;
}

/**
 * Loads video using its real story filename (the `file` field on each video,
 * e.g. `IMG_20260308_1152.mp4`), just like photos. The poster does not come
 * from here; it is a gallery photo resolved by `photoSrc`.
 */
export function videoSrc(fileName: string) {
  return `${VIDEO_DIR}/${fileName}`;
}

/** Deterministic placeholder palette derived from the ID itself. */
export function placeholderTone(id: string) {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) % 360;
  }
  return { hue: hash, hue2: (hash + 42) % 360 };
}
