import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

const root = path.dirname(fileURLToPath(import.meta.url));
const pdfjsDist = path.resolve(root, "node_modules/react-pdf/node_modules/pdfjs-dist");

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  resolve: {
    alias: {
      // Keep pdfjs API aligned with react-pdf's pinned 5.x
      "pdfjs-dist": pdfjsDist,
    },
  },
  optimizeDeps: {
    include: ["react-pdf"],
  },
});
