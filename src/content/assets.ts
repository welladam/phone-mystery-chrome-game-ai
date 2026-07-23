/**
 * Mapeamento de assets substituíveis.
 *
 * Basta soltar o arquivo real em `public/assets/...` com o nome esperado.
 * Nenhuma lógica do jogo muda: os componentes tentam carregar o arquivo e,
 * se ele não existir, desenham um placeholder com os metadados corretos.
 */

export const PHOTO_DIR = "/assets/photos";
export const AUDIO_DIR = "/assets/audio";

/**
 * Carrega a imagem pelo nome de arquivo real da história (o campo `file` de
 * cada foto — ex.: `IMG_20260308_1944.jpg`, `tribuna_barao.png`). Assim os
 * arquivos gerados entram na pasta com o próprio nome, preservando a extensão
 * original (jpg ou png), sem precisar renomear nem converter.
 */
export function photoSrc(fileName: string) {
  return `${PHOTO_DIR}/${fileName}`;
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
