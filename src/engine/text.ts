/**
 * Shared text utilities.
 *
 * The combining-mark range is deliberately built with an ASCII escape: the
 * source file contains no literal combining characters, which editors and diff
 * tools often corrupt.
 */

const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

/** Lowercase, without accents, with collapsed whitespace. */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Same as normalizeText, but also removes internal whitespace. */
export function normalizeCompact(value: string): string {
  return normalizeText(value).replace(/\s/g, "");
}

/** Stable, inexpensive hash for save checksums. */
export function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
