/**
 * Mapeamento de assets substituíveis.
 *
 * Basta soltar o arquivo real em `public/assets/...` com o nome esperado.
 * Nenhuma lógica do jogo muda: os componentes tentam carregar o arquivo e,
 * se ele não existir, desenham um placeholder com os metadados corretos.
 */

export const PHOTO_DIR = "/assets/photos";
export const AUDIO_DIR = "/assets/audio";

export function photoSrc(photoId: string) {
  return `${PHOTO_DIR}/${photoId}.jpg`;
}

export function audioSrc(voiceId: string) {
  return `${AUDIO_DIR}/${voiceId}.m4a`;
}

/** Paleta determinística para o placeholder, derivada do próprio ID. */
export function placeholderTone(id: string) {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) % 360;
  }
  return { hue: hash, hue2: (hash + 42) % 360 };
}
