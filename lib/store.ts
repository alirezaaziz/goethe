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

/** Fehler, dessen Text direkt in der Oberfläche angezeigt werden darf. */
export class StorageError extends Error {}

type BlobAccess =
  | { kind: "token"; token: string; via: string }
  | { kind: "oidc"; storeId: string; via: string };

/**
 * Sucht den Zugang zum Blob-Store. Vercel kennt zwei Verfahren:
 *
 * 1. Ein statisches Read-Write-Token. Es heißt normalerweise BLOB_READ_WRITE_TOKEN;
 *    wird beim Verbinden ein eigenes Präfix vergeben, zum Beispiel
 *    GOETHE_BLOB_READ_WRITE_TOKEN – deshalb wird auch auf die Endung geprüft.
 * 2. OIDC. Dabei steht nur BLOB_STORE_ID in der Umgebung; das eigentliche Token
 *    holt sich das SDK pro Anfrage selbst. Es darf deshalb nicht erwartet werden,
 *    dass VERCEL_OIDC_TOKEN als Umgebungsvariable gesetzt ist.
 */
function resolveBlob(): BlobAccess | null {
  const direct = process.env.BLOB_READ_WRITE_TOKEN;
  if (direct) return { kind: "token", token: direct, via: "BLOB_READ_WRITE_TOKEN" };

  for (const [name, value] of Object.entries(process.env)) {
    if (value && name.endsWith("BLOB_READ_WRITE_TOKEN")) {
      return { kind: "token", token: value, via: name };
    }
  }

  const storeId = process.env.BLOB_STORE_ID;
  if (storeId) return { kind: "oidc", storeId, via: "BLOB_STORE_ID (OIDC)" };

  return null;
}

function hasBlob() {
  return resolveBlob() !== null;
}

/**
 * Optionen für das SDK. Bei OIDC wird nur die Store-ID mitgegeben; das Token
 * besorgt sich das SDK pro Anfrage selbst.
 */
function blobOptions(): { token?: string; storeId?: string } {
  const access = resolveBlob();
  if (!access) return {};
  return access.kind === "token" ? { token: access.token } : { storeId: access.storeId };
}

/**
 * Auf Vercel ist das Dateisystem schreibgeschützt. Ohne verbundenen Blob-Store
 * würde jeder Schreibvorgang mit EROFS abstürzen – das hier fängt es vorher ab
 * und erklärt, was zu tun ist.
 */
function assertWritable() {
  if (hasBlob()) return;
  if (process.env.VERCEL) {
    throw new StorageError(
      "In dieser Bereitstellung ist kein Zugang zum Blob-Store vorhanden, deshalb lässt sich " +
        "nichts speichern. Erwartet wird entweder BLOB_READ_WRITE_TOKEN oder BLOB_STORE_ID. " +
        "Ein im Dashboard verbundener Store wirkt außerdem erst nach einem neuen Deployment " +
        `(Redeploy). Gefundene Variablen: ${listBlobEnvNames().join(", ") || "keine"}.`,
    );
  }
}

/** Namen aller blobbezogenen Umgebungsvariablen – ausdrücklich ohne Werte. */
export function listBlobEnvNames(): string[] {
  return Object.keys(process.env)
    .filter((name) => name.includes("BLOB"))
    .sort();
}

/** Zustand des Speichers für die Anzeige im Adminbereich. */
export function storageDiagnostics() {
  const access = resolveBlob();
  return {
    backend: access ? ("blob" as const) : ("datei" as const),
    onVercel: Boolean(process.env.VERCEL),
    via: access?.via ?? null,
    blobEnvNames: listBlobEnvNames(),
  };
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

type BlobAccessMode = "public" | "private";

/**
 * Ein Blob-Store ist entweder öffentlich oder privat konfiguriert, und jeder
 * Aufruf muss dazu passen. Welche Variante gilt, steht nirgends in der Umgebung –
 * deshalb wird es beim ersten Zugriff ermittelt und danach gemerkt.
 *
 * Bevorzugt wird "private": Die Datei enthält die Lösungen aller Leseaufgaben
 * und hat unter einer öffentlich abrufbaren URL nichts zu suchen.
 */
let storeAccess: BlobAccessMode | null = null;

function isAccessMismatch(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /access on a (private|public) store/i.test(message);
}

async function withAccess<T>(run: (access: BlobAccessMode) => Promise<T>): Promise<T> {
  const first: BlobAccessMode = storeAccess ?? "private";
  try {
    const result = await run(first);
    storeAccess = first;
    return result;
  } catch (error) {
    if (!isAccessMismatch(error)) throw error;
    const second: BlobAccessMode = first === "private" ? "public" : "private";
    const result = await run(second);
    storeAccess = second;
    return result;
  }
}

/**
 * Wichtig: Schlägt das Lesen fehl, wird ein Fehler geworfen und niemals eine
 * leere Liste zurückgegeben. Sonst würde ein anschließendes Speichern den
 * gesamten Bestand mit einem einzigen Eintrag überschreiben.
 */
async function readBlob(): Promise<Exam[]> {
  const { get } = await import("@vercel/blob");

  let result;
  try {
    // useCache: false, sonst liefert das CDN nach einem Schreibvorgang noch die alte Fassung.
    result = await withAccess((access) =>
      get(BLOB_KEY, { access, useCache: false, ...blobOptions() }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new StorageError(
      `Der Blob-Store ist nicht erreichbar: ${message}. Meist stimmt der Zugang nicht oder ` +
        "gehört zu einem anderen Store. Im Vercel-Dashboard den Store erneut mit dem Projekt " +
        "verbinden und neu deployen.",
    );
  }

  // Noch nichts gespeichert – ein gültiger Anfangszustand.
  if (!result || result.statusCode !== 200) return [];

  const text = await new Response(result.stream).text();
  try {
    return JSON.parse(text) as Exam[];
  } catch {
    throw new StorageError("Die gespeicherte Datei im Blob-Store ist beschädigt.");
  }
}

async function writeBlob(exams: Exam[]) {
  const { put } = await import("@vercel/blob");
  await withAccess((access) =>
    put(BLOB_KEY, JSON.stringify(exams, null, 2), {
      ...blobOptions(),
      access,
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    }),
  );
}

export async function listExams(): Promise<Exam[]> {
  const exams = hasBlob() ? await readBlob() : await readLocal();
  return exams.sort((a, b) => a.title.localeCompare(b.title, "de"));
}

/**
 * Wie listExams, wirft aber nicht – für Seiten, die bei einem Speicherproblem
 * eine Erklärung anzeigen sollen statt mit einem 500er abzustürzen.
 */
export async function listExamsSafe(): Promise<{ exams: Exam[]; error: string | null }> {
  try {
    return { exams: await listExams(), error: null };
  } catch (err) {
    const message =
      err instanceof StorageError
        ? err.message
        : `Der Speicher konnte nicht gelesen werden: ${err instanceof Error ? err.message : String(err)}`;
    return { exams: [], error: message };
  }
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
