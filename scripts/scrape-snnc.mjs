/**
 * One-off scraper: public SNNC (Sapo/Bizweb) collection JSON → PawPath PetListing mocks.
 *
 * Usage: node scripts/scrape-snnc.mjs
 *
 * Source: https://sannhanhieucho.com/collections/{cho|meo}/products.json
 * For local demo only — attribute SNNC; do not present as official SNNC site.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_TS = join(ROOT, "src/features/pets/mocks/data.ts");
const OUT_JSON = join(ROOT, "scripts/snnc-raw.json");

const BASE = "https://sannhanhieucho.com";
const UA = { "User-Agent": "PawPathMockScraper/1.0 (local demo)" };

function toZaloDigits(raw) {
  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.startsWith("84")) return digits;
  if (digits.startsWith("0")) return `84${digits.slice(1)}`;
  return digits;
}

async function fetchHtml(pathOrUrl) {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${BASE}${pathOrUrl}`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) return "";
  return res.text();
}

/**
 * Pull contact bits from live HTML (product page / footer) — no hardcoded phone/address.
 * SNNC uses one site-wide Zalo on every product page.
 */
function parseContactFromHtml(html) {
  const zaloMatch = html.match(/zalo\.me\/(\d{9,12})/i);
  const addressMatch =
    html.match(/Địa chỉ[\s\S]{0,120}?((?:Nhà|Số|Ngõ|Đường)[^<]{10,120})/i) ||
    html.match(/(Nhà số\s*1\s*ngõ\s*15[^<]{0,80})/i);

  return {
    zaloPhone: toZaloDigits(zaloMatch?.[1]),
    address: addressMatch?.[1]?.replace(/\s+/g, " ").trim(),
  };
}

/** Resolve lat/lng for scraped address via Nominatim (optional). */
async function geocodeAddress(address) {
  if (!address) return undefined;
  // Prefer shorter, geocodable queries — full alley addresses often fail.
  const queries = [
    address,
    "Cổ Đông, Sơn Tây, Hà Nội, Việt Nam",
    "Đồng Mô, Sơn Tây, Hà Nội, Việt Nam",
    "Sơn Tây, Hà Nội, Việt Nam",
  ];
  for (const qRaw of queries) {
    try {
      const q = encodeURIComponent(qRaw);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=vn&q=${q}`,
        {
          headers: {
            "User-Agent": "PawPathMockScraper/1.0 (local demo; happy-pet-handbook)",
            Accept: "application/json",
          },
        },
      );
      if (!res.ok) continue;
      const data = await res.json();
      if (!data?.[0]) continue;
      return {
        address,
        lat: Number(data[0].lat),
        lng: Number(data[0].lon),
      };
    } catch {
      /* try next */
    }
    await new Promise((r) => setTimeout(r, 1100));
  }
  // Fallback: Cổ Đông / Đồng Mô area (OSM near Làng VH các dân tộc VN)
  return { address, lat: 21.02665, lng: 105.46188 };
}

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function tagValue(tags, prefix) {
  const hit = tags.find((t) => t.toLowerCase().startsWith(prefix.toLowerCase()));
  if (!hit) return "";
  return hit.slice(prefix.length).trim();
}

function parseGender(raw) {
  const s = raw.toLowerCase();
  if (s.includes("đực") || s.includes("duc") || s.includes("male")) return "male";
  if (s.includes("cái") || s.includes("cai") || s.includes("female")) return "female";
  return "unknown";
}

function parseWeight(raw) {
  const m = raw.replace(",", ".").match(/([\d.]+)/);
  return m ? Number(m[1]) : 5;
}

function parseStatus(raw) {
  const s = raw.toLowerCase();
  if (s.includes("đã được nhận") || s.includes("da duoc nhan") || s.includes("đã nhận"))
    return "adopted";
  if (s.includes("đang xác nhận") || s.includes("có thể") || s.includes("pending"))
    return "pending";
  if (s.includes("sẵn sàng") || s.includes("san sang")) return "available";
  return "available";
}

function parseSpecies(tags, collection) {
  if (collection === "meo") return "cat";
  const joined = tags.join(" ").toLowerCase();
  if (joined.includes("mèo") || joined.includes("meo") || joined.includes("cat")) return "cat";
  if (joined.includes("chó") || joined.includes("cho") || joined.includes("dog")) return "dog";
  return collection === "meo" ? "cat" : "dog";
}

function parseBreed(tags, species) {
  const skip = /^(gioitinh_|cannang_|tuoi_|suckhoe_|nhannuoi_|thoigian_)/i;
  const breedTag = tags.find((t) => !skip.test(t));
  if (breedTag) return breedTag;
  return species === "cat" ? "Mèo nhà" : "Chó lai";
}

function parseIntakeYear(raw) {
  const m = raw.match(/(20\d{2})/);
  if (m) return Number(m[1]);
  return undefined;
}

function mapProduct(p, collection, site) {
  const tags = Array.isArray(p.tags) ? p.tags : [];
  const genderRaw = tagValue(tags, "gioitinh_");
  const ageRaw = tagValue(tags, "tuoi_");
  const weightRaw = tagValue(tags, "cannang_");
  const healthRaw = tagValue(tags, "suckhoe_");
  const statusRaw = tagValue(tags, "nhannuoi_");
  const timeRaw = tagValue(tags, "thoigian_");

  const species = parseSpecies(tags, collection);
  const breedTag = parseBreed(tags, species);
  const sku = p.variants?.[0]?.sku ? String(p.variants[0].sku) : undefined;
  const images = (p.images?.length ? p.images : [p.featured_image]).filter(Boolean).slice(0, 5);
  const text = stripHtml(p.content || p.summary || "");

  /** @type {Record<string, unknown>} */
  const pet = {
    // Prefer SKU (matches SNNC URLs like /900255001490284); else Bizweb product id
    id: sku || String(p.id),
    code: sku || String(p.id),
    name: p.name,
    species,
    breed: breedTag,
    gender: genderRaw ? parseGender(genderRaw) : "unknown",
    age: ageRaw || "Đang cập nhật",
    weightKg: weightRaw ? parseWeight(weightRaw) : undefined,
    healthStatus: healthRaw || "Đang cập nhật",
    intakeYear: parseIntakeYear(timeRaw),
    description: text || undefined,
    images,
    status: statusRaw ? parseStatus(statusRaw) : "available",
    vaccinations: [],
    postedById: "snnc",
    postedByName: "Sân Nhà Nhiều Chó",
    _sourceUrl: `${BASE}${p.url || `/${p.alias}`}`,
  };

  if (site.zaloPhone) pet.zaloPhone = site.zaloPhone;
  if (site.pickup) pet.pickup = site.pickup;

  if (pet.weightKg == null) delete pet.weightKg;
  if (pet.intakeYear == null) delete pet.intakeYear;
  if (!pet.description) delete pet.description;

  return pet;
}

async function fetchCollection(handle) {
  const all = [];
  for (let page = 1; page <= 10; page++) {
    const url = `${BASE}/collections/${handle}/products.json?page=${page}&limit=50`;
    const res = await fetch(url, { headers: UA });
    if (!res.ok) break;
    const data = await res.json();
    const products = data.products || [];
    if (!products.length) break;
    all.push(...products.map((p) => ({ ...p, _collection: handle })));
    if (products.length < 50) break;
  }
  return all;
}

function toTsLiteral(value, indent = 0) {
  const pad = "  ".repeat(indent);
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map((v) => `${pad}  ${toTsLiteral(v, indent + 1)}`).join(",\n");
    return `[\n${items}\n${pad}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value)
      .filter(([k, v]) => !k.startsWith("_") && v !== undefined)
      .map(([k, v]) => `${pad}  ${k}: ${toTsLiteral(v, indent + 1)}`)
      .join(",\n");
    return `{\n${entries}\n${pad}}`;
  }
  return "undefined";
}

async function main() {
  console.log("Fetching SNNC collections…");
  const [dogs, cats] = await Promise.all([fetchCollection("cho"), fetchCollection("meo")]);
  console.log(`Dogs: ${dogs.length}, Cats: ${cats.length}`);

  const sample = dogs.find((p) => p.alias)?.alias || cats.find((p) => p.alias)?.alias;
  if (!sample) throw new Error("No product alias to scrape contact from");

  console.log(`Scraping contact from /${sample} …`);
  const html = await fetchHtml(`/${sample}`);
  const contact = parseContactFromHtml(html);
  const geo = contact.address ? await geocodeAddress(contact.address) : undefined;
  const pickup = contact.address ? (geo ?? { address: contact.address }) : undefined;

  console.log("Zalo (from HTML):", contact.zaloPhone ?? "(none)");
  console.log("Address (from HTML):", contact.address ?? "(none)");
  console.log(
    "Pickup:",
    pickup
      ? `${pickup.address}${pickup.lat != null ? ` @ ${pickup.lat},${pickup.lng}` : " (no lat/lng)"}`
      : "(none)",
  );

  const site = { zaloPhone: contact.zaloPhone, pickup };

  const raw = [...dogs, ...cats];
  mkdirSync(dirname(OUT_JSON), { recursive: true });
  writeFileSync(OUT_JSON, JSON.stringify(raw, null, 2), "utf8");

  const mapped = raw.map((p) => mapProduct(p, p._collection, site));

  // Prefer available pets first for the adoption grid
  mapped.sort((a, b) => {
    const order = { available: 0, pending: 1, adopted: 2 };
    return (order[a.status] ?? 9) - (order[b.status] ?? 9);
  });

  const ts = `import type { PetListing } from "@/features/pets/types";

/**
 * Auto-generated from SNNC public catalog (Sapo products.json).
 * Run: node scripts/scrape-snnc.mjs
 * Source: https://sannhanhieucho.com — for local demo mock data only.
 * Generated: ${new Date().toISOString()}
 * Count: ${mapped.length}
 */

export const mockPets: PetListing[] = ${toTsLiteral(mapped)};

export function getPetById(id: string) {
  return mockPets.find((p) => p.id === id);
}

export function getAvailablePets() {
  return mockPets.filter((p) => p.status === "available");
}

export function getPickupLocations() {
  return mockPets.filter(
    (p) =>
      (p.status === "available" || p.status === "pending") &&
      p.pickup?.address &&
      p.pickup.lat != null &&
      p.pickup.lng != null,
  );
}
`;

  writeFileSync(OUT_TS, ts, "utf8");
  console.log(`Wrote ${mapped.length} pets → ${OUT_TS}`);
  console.log(`Raw snapshot → ${OUT_JSON}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
