import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(path) {
  const absolute = join(root, path);
  if (!existsSync(absolute)) {
    fail(`arquivo obrigatório ausente: ${path}`);
    return "";
  }
  return readFileSync(absolute, "utf8");
}

function walk(path) {
  const absolute = join(root, path);
  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const child = join(absolute, entry.name);
    return entry.isDirectory() ? walk(relative(root, child)) : [relative(root, child)];
  });
}

const requiredLocaleModules = [
  "src/locales/types.ts",
  "src/locales/registry.ts",
  "src/locales/pt-BR.ts",
  "src/locales/en-US.example.ts",
  "src/locales/pt-BR/core.ts",
  "src/locales/pt-BR/chat.ts",
  "src/locales/pt-BR/act1.ts",
  "src/locales/pt-BR/act2.ts",
  "src/locales/pt-BR/act3.ts",
  "src/locales/pt-BR/act4.ts",
];
requiredLocaleModules.forEach(read);

const ptSource = read("src/locales/pt-BR.ts");
const enSource = read("src/locales/en-US.example.ts");
if (!/id:\s*["']pt-BR["'][\s\S]*?enabled:\s*true/.test(ptSource)) {
  fail("pt-BR precisa estar completo e habilitado");
}
if (!/id:\s*["']en-US["'][\s\S]*?enabled:\s*false/.test(enSource)) {
  fail("en-US deve permanecer marcado como exemplo indisponível nesta etapa");
}

const messageKeys = new Set(
  [...ptSource.matchAll(/^\s*["']([^"']+)["']:\s*["']/gm)].map((match) => match[1]),
);
const sourceFiles = walk("src").filter((path) => [".ts", ".tsx"].includes(extname(path)));
for (const path of sourceFiles) {
  const source = read(path);
  for (const match of source.matchAll(/\bt\(\s*["']([^"']+)["']/g)) {
    if (!messageKeys.has(match[1])) fail(`chave usada e ausente em pt-BR: ${match[1]} (${path})`);
  }
}

// Componentes não devem voltar a receber texto humano diretamente. Conteúdo
// proveniente dos pacotes narrativos aparece como expressão JSX e não é pego
// por esta regra.
const uiFiles = sourceFiles.filter(
  (path) =>
    path.endsWith(".tsx") &&
    (path.startsWith("src\\ui\\") || path.startsWith("src/ui/") || path === "src\\App.tsx" || path === "src/App.tsx" || path === "src\\main.tsx" || path === "src/main.tsx"),
);
for (const path of uiFiles) {
  const source = read(path);
  for (const [index, line] of source.split(/\r?\n/).entries()) {
    const match = line.match(/<[A-Za-z][^>]*>\s*([^<>{}]*[A-Za-zÀ-ÿ][^<>{}]*)\s*<\//);
    if (match) {
      const text = match[1].replace(/\s+/g, " ").trim();
      if (text) fail(`texto JSX direto fora do locale: "${text}" (${path}:${index + 1})`);
    }
  }
  for (const match of source.matchAll(/\b(?:aria-label|placeholder|title)=["']([^"']*[A-Za-zÀ-ÿ][^"']*)["']/g)) {
    fail(`atributo visível direto fora do locale: "${match[1]}" (${path})`);
  }
}

const forbiddenRuntimeNames = ["ptToEn", "enToPt", "TranslatorDirection"];
for (const path of sourceFiles) {
  const source = read(path);
  for (const name of forbiddenRuntimeNames) {
    if (source.includes(name)) fail(`nome de tradução fixo ainda presente: ${name} (${path})`);
  }
}

const requiredVoices = ["VOICE_001", "VOICE_002", "VOICE_003", "VOICE_004"];
for (const voiceId of requiredVoices) {
  const path = `public/assets/audio/pt-BR/${voiceId}.m4a`;
  if (!existsSync(join(root, path))) fail(`áudio obrigatório de pt-BR ausente: ${path}`);
}

if (failures.length) {
  console.error("Falha na validação de locales:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Locales válidos: pt-BR jogável (${messageKeys.size} textos), en-US indisponível como modelo.`);
console.log(`Áudios obrigatórios encontrados: ${requiredVoices.length}.`);
