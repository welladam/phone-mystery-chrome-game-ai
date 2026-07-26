import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    // GitHub Pages publishes this project under /phone-mystery-chrome-game-ai/.
    // Locally, Vite continues using "/" when the variable is undefined.
    base: env.VITE_BASE_PATH || "/",
    plugins: [react()],
    server: {
      // A secure context is required by the Chrome APIs used here.
      host: "127.0.0.1",
    },
    build: {
      // Disable production source maps: they would reconstruct the original code,
      // including narrative material, for anyone opening browser developer tools.
      sourcemap: false,
      // Vite 8 uses Rolldown/Oxc; `true` selects the native minifier.
      minify: true,
      target: "es2022",
      rollupOptions: {
        output: {
          // Each act becomes its own file. Ending content is not downloaded
          // until the player reaches it.
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
