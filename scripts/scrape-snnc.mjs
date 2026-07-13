/**
 * One-off scraper: public SNNC (Sapo/Bizweb) collection JSON → PawPath PetListing mocks.
 *
 * Usage: npm run scrape:snnc
 *
 * Source: https://sannhanhieucho.com/collections/{cho|meo}/products.json
 * For local demo only — attribute SNNC; do not present as official SNNC site.
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_TS = join(ROOT, "src/features/pets/mocks/data.ts");
const OUT_JSON = join(ROOT, "scripts/snnc-raw.json");

const BASE = "https://sannhanhieucho.com";
const COLLECTIONS = ["cho", "meo"];
const UA = { "User-Agent": "PawPathMockScraper/1.0 (local demo)" };

/** Embedded so a fresh scrape never drops i18n helpers / petsApi imports. */
const DEFAULT_LOCALE_HELPERS = `import type { PetListing } from "@/features/pets/types";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type Locale } from "@/i18n/types";

function getCurrentLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return stored === "vi" || stored === "en" ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

function translateBreed(breed: string, locale: Locale) {
  if (locale !== "en") return breed;
  const normalized = breed.trim();
  const map: Record<string, string> = {
    "Chó lai": "Mixed-breed dog",
    "Chó ta": "Vietnamese native dog",
    Poodle: "Poodle",
    Khác: "Other",
    Mèo: "Cat",
  };
  return map[normalized] ?? breed;
}

function translateAge(age: string, locale: Locale) {
  if (locale !== "en") return age;
  const normalized = age.trim();
  const map: Record<string, string> = {
    "1 tuổi": "1 year old",
    "2 tuổi": "2 years old",
    "3 tuổi": "3 years old",
    "4 tuổi": "4 years old",
    "3-4 tuổi": "3–4 years old",
    "Dưới 1 tuổi": "Under 1 year old",
    "Đang cập nhật": "Updating",
  };
  return map[normalized] ?? age;
}

function translateHealthStatus(healthStatus: string, locale: Locale) {
  if (locale !== "en") return healthStatus;
  const normalized = healthStatus.trim();
  const map: Record<string, string> = {
    Tốt: "Healthy",
    "Tốt; chưa triệt sản": "Healthy; not spayed/neutered",
    "Tốt;Đã tiêm đủ vắc xin": "Healthy; fully vaccinated",
    "Tốt;Đã tiêm đủ vắc xin; Đã triệt sản": "Healthy; fully vaccinated; spayed/neutered",
    "Ổn định": "Stable",
    "Cụt 1 chân": "Missing one leg",
    "Một bên mắt trái bị hỏng.": "Left eye damaged",
  };
  return map[normalized] ?? healthStatus;
}

function translateDescription(description: string | undefined, locale: Locale, pet: PetListing) {
  if (locale !== "en") return description;
  if (!description || !description.trim()) {
    return \`\${pet.name || "This pet"} is looking for a loving home. Please contact the shelter for more details.\`;
  }
  return \`\${pet.name || "This pet"} is looking for a loving home. Please contact the shelter for more details.\`;
}

function translatePickupAddress(address: string | undefined, locale: Locale) {
  if (locale !== "en") return address;
  if (!address) return address;
  return "Shelter pickup location in Hanoi, Vietnam";
}

function getLocalizedPet(pet: PetListing, locale: Locale = getCurrentLocale()): PetListing {
  if (locale === "vi") return pet;

  return {
    ...pet,
    breed: translateBreed(pet.breed, locale) ?? pet.breed,
    age: translateAge(pet.age, locale) ?? pet.age,
    healthStatus: translateHealthStatus(pet.healthStatus, locale) ?? pet.healthStatus,
    description: translateDescription(pet.description, locale, pet),
    notes: pet.notes,
    postedByName: locale === "en" ? "PawPath shelter" : pet.postedByName,
    pickup: pet.pickup
      ? {
          ...pet.pickup,
          address: translatePickupAddress(pet.pickup.address, locale) ?? pet.pickup.address,
        }
      : pet.pickup,
  };
}

export function getLocalizedPets(pets: PetListing[], locale: Locale = getCurrentLocale()) {
  return pets.map((pet) => getLocalizedPet(pet, locale));
}

`;

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
  // Known SNNC shelter area — Nominatim often misreads the alley string
  if (/cột mốc|co dong|cổ đông|đoài phương|doai phuong|sơn tây|son tay/i.test(address)) {
    return { address, lat: 21.02665, lng: 105.46188 };
  }
  const queries = ["Cổ Đông, Sơn Tây, Hà Nội, Việt Nam", "Sơn Tây, Hà Nội, Việt Nam", address];
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
  if (collection === "cho") return "dog";
  const joined = tags.join(" ").toLowerCase();
  if (joined.includes("mèo") || joined.includes("meo") || joined.includes("cat")) return "cat";
  return "dog";
}

function parseBreed(tags, species) {
  const skip = /^(gioitinh_|cannang_|tuoi_|suckhoe_|nhannuoi_|thoigian_)/i;
  const breedTag = tags.find((t) => !skip.test(t));
  if (breedTag) return breedTag;
  if (species === "cat") return "Mèo nhà";
  return "Chó lai";
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
  console.log("Fetching SNNC collections:", COLLECTIONS.join(", "), "…");
  const [dogs, cats] = await Promise.all([fetchCollection("cho"), fetchCollection("meo")]);
  console.log(`Dogs: ${dogs.length}, Cats: ${cats.length}`);

  const byKey = new Map();
  const remember = (p, collection) => {
    const sku = p.variants?.[0]?.sku ? String(p.variants[0].sku) : "";
    const key = sku || String(p.id);
    if (!byKey.has(key)) byKey.set(key, { ...p, _collection: collection });
  };

  for (const p of dogs) remember(p, "cho");
  for (const p of cats) remember(p, "meo");

  const raw = [...byKey.values()];
  const sample = raw.find((p) => p.alias)?.alias;
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

  mkdirSync(dirname(OUT_JSON), { recursive: true });
  writeFileSync(OUT_JSON, JSON.stringify(raw, null, 2), "utf8");

  const mapped = raw.map((p) => mapProduct(p, p._collection, site));

  mapped.sort((a, b) => {
    const order = { available: 0, pending: 1, adopted: 2 };
    const statusCmp = (order[a.status] ?? 9) - (order[b.status] ?? 9);
    if (statusCmp !== 0) return statusCmp;
    return String(a.name).localeCompare(String(b.name), "vi");
  });

  const counts = mapped.reduce((acc, p) => {
    acc[p.species] = (acc[p.species] || 0) + 1;
    return acc;
  }, /** @type {Record<string, number>} */ ({}));
  console.log("Species counts:", counts);

  // Prefer existing i18n helpers from data.ts; else embed the default template
  let localeHelpers = "";
  if (existsSync(OUT_TS)) {
    const prev = readFileSync(OUT_TS, "utf8");
    const m = prev.match(/^(import[\s\S]*?export function getLocalizedPets[\s\S]*?\n\}\n)/);
    if (m) localeHelpers = m[1].trimEnd() + "\n\n";
  }
  if (!localeHelpers.includes("getLocalizedPets")) {
    localeHelpers = DEFAULT_LOCALE_HELPERS;
  }

  const ts = `${localeHelpers}/**
 * Auto-generated from SNNC public catalog (Sapo products.json).
 * Run: npm run scrape:snnc
 * Source: https://sannhanhieucho.com/collections/{cho|meo}
 * Generated: ${new Date().toISOString()}
 * Count: ${mapped.length} (dog=${counts.dog || 0}, cat=${counts.cat || 0})
 */

export const mockPets: PetListing[] = ${toTsLiteral(mapped)};

export function getPetById(id: string) {
  return getLocalizedPets(mockPets).find((p) => p.id === id);
}

export function getAvailablePets() {
  return getLocalizedPets(mockPets.filter((p) => p.status === "available"));
}

export function getPickupLocations() {
  return getLocalizedPets(
    mockPets.filter(
      (p) =>
        (p.status === "available" || p.status === "pending") &&
        p.pickup?.address &&
        p.pickup.lat != null &&
        p.pickup.lng != null,
    ),
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
