/**
 * Legt die Modellsätze aus data/seed/ im Speicher ab.
 *
 *   npm run seed                      → lokal nach .data/exams.json
 *   BLOB_READ_WRITE_TOKEN=… npm run seed → in den Vercel-Blob-Store
 *
 * Vorhandene Modellsätze mit derselben ID werden übersprungen,
 * außer man ruft das Skript mit --force auf.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const SEED_DIR = path.join(process.cwd(), "data", "seed");
const LOCAL_FILE = path.join(process.cwd(), ".data", "exams.json");
const BLOB_KEY = "goethe-c1/exams.json";
const force = process.argv.includes("--force");
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

async function readAll() {
  if (!useBlob) {
    try {
      return JSON.parse(await fs.readFile(LOCAL_FILE, "utf8"));
    } catch (err) {
      if (err.code === "ENOENT") return [];
      throw err;
    }
  }
  const { list } = await import("@vercel/blob");
  const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 });
  const blob = blobs.find((b) => b.pathname === BLOB_KEY);
  if (!blob) return [];
  const res = await fetch(blob.url, { cache: "no-store" });
  return res.ok ? res.json() : [];
}

async function writeAll(exams) {
  if (!useBlob) {
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
    await fs.writeFile(LOCAL_FILE, JSON.stringify(exams, null, 2), "utf8");
    return;
  }
  const { put } = await import("@vercel/blob");
  await put(BLOB_KEY, JSON.stringify(exams, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

const files = (await fs.readdir(SEED_DIR)).filter((name) => name.endsWith(".json"));
const exams = await readAll();
const now = new Date().toISOString();
let added = 0;
let skipped = 0;

for (const file of files) {
  const exam = JSON.parse(await fs.readFile(path.join(SEED_DIR, file), "utf8"));
  const index = exams.findIndex((entry) => entry.id === exam.id);
  if (index >= 0 && !force) {
    console.log(`übersprungen (bereits vorhanden): ${exam.id}`);
    skipped += 1;
    continue;
  }
  const record = { ...exam, createdAt: index >= 0 ? exams[index].createdAt : now, updatedAt: now };
  if (index >= 0) exams[index] = record;
  else exams.push(record);
  added += 1;
  console.log(`${index >= 0 ? "ersetzt" : "angelegt"}: ${exam.id}`);
}

if (added > 0) await writeAll(exams);

console.log(
  `\nFertig – ${added} geschrieben, ${skipped} übersprungen. Ziel: ${useBlob ? "Vercel Blob" : LOCAL_FILE}`,
);
