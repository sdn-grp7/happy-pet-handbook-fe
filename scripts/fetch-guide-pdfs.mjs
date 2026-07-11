/**
 * Downloads freely shareable / educational pet-care PDFs into public/guides/.
 * Sources allow non-commercial educational redistribution with attribution.
 *
 * Run: npm run fetch:guides
 */
import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "../public/guides");

const BOOKS = [
  {
    file: "pet-parent-guide.pdf",
    url: "https://www.americanhumane.org/wp-content/uploads/2025/03/AmericanHumaneSociety-PetParentGuide.pdf",
    note: "American Humane Society — Pet Parent Guide (non-commercial share OK with credit)",
  },
  {
    file: "pet-food-labels.pdf",
    url: "https://www.pubs.ext.vt.edu/content/dam/pubs_ext_vt_edu/FST/fst-434/fst-434.pdf",
    note: "Virginia Cooperative Extension — Pet food labels consumer guide",
  },
  {
    file: "positive-reinforcement-dog.pdf",
    url: "https://www.sa.gov/files/assets/main/v/1/acs/documents/positive-reinforcement-dog.pdf",
    note: "Government of South Australia — Positive reinforcement dog training",
  },
  {
    file: "pet-preparedness.pdf",
    url: "https://www.americanhumane.org/wp-content/uploads/2025/08/Ultimate-Pet-Preparedness-Toolkit.pdf",
    note: "American Humane Society — Ultimate Pet Preparedness Toolkit",
  },
];

async function download(url, dest) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; PawPathHandbook/1.0; educational local cache)",
      Accept: "application/pdf,*/*",
    },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const type = res.headers.get("content-type") ?? "";
  if (!type.includes("pdf") && !type.includes("octet-stream") && !type.includes("binary")) {
    console.warn(`  warn: unexpected content-type "${type}" — saving anyway`);
  }
  await pipeline(res.body, createWriteStream(dest));
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const book of BOOKS) {
    const dest = join(OUT_DIR, book.file);
    if (existsSync(dest)) {
      console.log(`skip (exists): ${book.file}`);
      continue;
    }
    console.log(`fetch: ${book.file}`);
    console.log(`  ${book.note}`);
    try {
      await download(book.url, dest);
      console.log(`  ok → ${dest}`);
    } catch (err) {
      console.error(`  FAIL: ${err.message}`);
    }
  }
}

main();
