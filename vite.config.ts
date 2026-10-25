import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "exclude-local-ar-recording",
      apply: "build",
      async writeBundle(options) {
        const directory = resolve(options.dir ?? "dist", "ar/videos");
        const files = await readdir(directory).catch(() => []);
        await Promise.all(
          files
            .filter((name) => name.startsWith("ar-recording-"))
            .map((name) => rm(resolve(directory, name))),
        );
      },
    },
  ],
});
