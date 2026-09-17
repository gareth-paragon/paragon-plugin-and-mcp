import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: rootDir,
  plugins: [viteSingleFile()],
  build: {
    outDir: path.join(rootDir, "..", "dist", "ui"),
    emptyOutDir: true,
    cssMinify: true,
    minify: true,
    rollupOptions: {
      input: path.join(rootDir, "mcp-app.html"),
    },
  },
});
