import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    // GitHub Pages publica este projeto sob /phone-mystery-chrome-game-ai/.
    // Localmente, Vite continua usando "/" quando a variável não é definida.
    base: env.VITE_BASE_PATH || "/",
    plugins: [react()],
    server: {
      // Contexto seguro é obrigatório para as APIs do Chrome usadas aqui.
      host: "127.0.0.1",
    },
    build: {
      // Sem source maps em produção: eles reconstruiriam o código original,
      // incluindo o material narrativo, para qualquer pessoa que abrisse as
      // ferramentas do navegador.
      sourcemap: false,
      // Vite 8 usa Rolldown/Oxc; `true` seleciona o minificador nativo.
      minify: true,
      target: "es2022",
      rollupOptions: {
        output: {
          // Cada ato vira um arquivo próprio. O conteúdo do desfecho não é
          // baixado enquanto o jogador não chegar lá.
          manualChunks(id) {
            if (id.includes("/content/act1")) return "cap-a";
            if (id.includes("/content/act2")) return "cap-b";
            if (id.includes("/content/act3")) return "cap-c";
            if (id.includes("/content/act4")) return "cap-d";
            if (id.includes("node_modules/react")) return "vendor";
            return undefined;
          },
          chunkFileNames: "assets/[name]-[hash].js",
        },
      },
    },
  };
});
