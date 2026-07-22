/**
 * Utilidades de texto compartilhadas.
 *
 * A faixa de marcas combinantes é montada por escape ASCII de propósito: o
 * arquivo fonte não contém caracteres combinantes literais, que costumam ser
 * corrompidos por editores e ferramentas de diff.
 */

const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

/** Minúsculas, sem acento, espaços colapsados. */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Igual a normalizeText, mas também remove espaços internos. */
export function normalizeCompact(value: string): string {
  return normalizeText(value).replace(/\s/g, "");
}

/** Hash estável e barato para checksum de save. */
export function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
