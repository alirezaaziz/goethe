import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Exam } from "./types";

/**
 * Speicher für die Modellsätze.
 *
 * Auf Vercel: ein einzelnes JSON-Objekt im Blob-Store (kostenloser Plan reicht,
 * die Datei bleibt im Bereich weniger hundert Kilobyte).
 * Lokal ohne BLOB_READ_WRITE_TOKEN: .data/exams.json im Projektordner.
 */

const BLOB_KEY = "goethe-c1/exams.json";
const LOCAL_FILE = path.join(process.cwd(), ".data", "exams.json");

function hasBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Fehler, dessen Text direkt in der Oberfläche angezeigt werden darf. */
export class StorageError extends Error {}

/**
 * Auf Vercel ist das Dateisystem schreibgeschützt. Ohne verbundenen Blob-Store
 * würde jeder Schreibvorgang mit EROFS abstürzen – das hier fängt es vorher ab
 * und erklärt, was zu tun ist.
 */
function assertWritable() {
  if (hasBlob()) return;
  if (process.env.VERCEL) {
    throw new StorageError(
      "Es ist kein Blob-Store mit diesem Vercel-Projekt verbunden, deshalb lässt sich nichts " +
        "speichern. Im Vercel-Dashboard unter Storage einen Blob-Store anlegen, mit dem Projekt " +
        "verbinden und anschließend neu deployen.",
    );
  }
}

async function readLocal(): Promise<Exam[]> {
  try {
    return JSON.parse(await fs.readFile(LOCAL_FILE, "utf8")) as Exam[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function writeLocal(exams: Exam[]) {
  try {
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
    await fs.writeFile(LOCAL_FILE, JSON.stringify(exams, null, 2), "utf8");
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
      throw new StorageError(
        "Das Dateisystem ist schreibgeschützt. Für den Betrieb in der Cloud wird ein " +
          "Blob-Store benötigt (Vercel-Dashboard → Storage → Blob).",
      );
    }
    throw err;
  }
}

async function readBlob(): Promise<Exam[]> {
  const { list } = await import("@vercel/blob");
  const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 });
  const blob = blobs.find((b) => b.pathname === BLOB_KEY);
  if (!blob) return [];
  // no-store, sonst liefert das CDN nach einem Schreibvorgang noch die alte Fassung.
  const res = await fetch(blob.url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Blob konnte nicht gelesen werden (${res.status}).`);
  return (await res.json()) as Exam[];
}

async function writeBlob(exams: Exam[]) {
  const { put } = await import("@vercel/blob");
  await put(BLOB_KEY, JSON.stringify(exams, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

export async function listExams(): Promise<Exam[]> {
  const exams = hasBlob() ? await readBlob() : await readLocal();
  return exams.sort((a, b) => a.title.localeCompare(b.title, "de"));
}

export async function getExam(id: string): Promise<Exam | null> {
  const exams = await listExams();
  return exams.find((e) => e.id === id) ?? null;
}

export async function saveExam(exam: Exam): Promise<Exam> {
  assertWritable();
  const exams = hasBlob() ? await readBlob() : await readLocal();
  const now = new Date().toISOString();
  const index = exams.findIndex((e) => e.id === exam.id);
  const next: Exam = {
    ...exam,
    createdAt: index >= 0 ? exams[index].createdAt : (exam.createdAt ?? now),
    updatedAt: now,
  };
  if (index >= 0) exams[index] = next;
  else exams.push(next);
  if (hasBlob()) await writeBlob(exams);
  else await writeLocal(exams);
  return next;
}

/** Legt einen Modellsatz unter neuer ID ab und lässt den alten Eintrag stehen. */
export async function renameExam(oldId: string, exam: Exam): Promise<Exam> {
  if (oldId === exam.id) return saveExam(exam);
  const saved = await saveExam(exam);
  await deleteExam(oldId);
  return saved;
}

export async function deleteExam(id: string): Promise<boolean> {
  assertWritable();
  const exams = hasBlob() ? await readBlob() : await readLocal();
  const next = exams.filter((e) => e.id !== id);
  if (next.length === exams.length) return false;
  if (hasBlob()) await writeBlob(next);
  else await writeLocal(next);
  return true;
}

export function storageBackend(): "blob" | "datei" {
  return hasBlob() ? "blob" : "datei";
}
