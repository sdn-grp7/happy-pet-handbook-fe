/**
 * Copies react-pdf's pdfjs worker into public/ so the book reader can load it.
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "pdf.worker.min.mjs");

let src;
try {
  // Prefer the pdfjs-dist nested under react-pdf (exact peer version)
  src = require.resolve("pdfjs-dist/build/pdf.worker.min.mjs", {
    paths: [join(root, "node_modules/react-pdf")],
  });
} catch {
  src = require.resolve("pdfjs-dist/build/pdf.worker.min.mjs");
}

mkdirSync(dirname(out), { recursive: true });
copyFileSync(src, out);
console.log(`pdf worker → ${out}${existsSync(out) ? "" : " (missing!)"}`);
