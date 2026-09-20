import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { StorageError, listExams, saveExam } from "@/lib/store";
import { validateExam } from "@/lib/validate-exam";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  try {
    return NextResponse.json({ exams: await listExams() });
  } catch (error) {
    return NextResponse.json({ error: describeStorageError(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 });
  }

  const validation = validateExam(payload);
  if ("error" in validation) {
    return NextResponse.json({ error: validation.error, issues: validation.issues }, { status: 400 });
  }

  // Lesen und Schreiben gemeinsam absichern: Schon die Dublettenprüfung greift
  // auf den Speicher zu und darf nicht als leerer 500er nach außen dringen.
  try {
    const existing = await listExams();
    if (existing.some((exam) => exam.id === validation.exam.id)) {
      return NextResponse.json(
        { error: `Es gibt bereits einen Modellsatz mit der ID „${validation.exam.id}“.` },
        { status: 409 },
      );
    }
    return NextResponse.json({ exam: await saveExam(validation.exam) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: describeStorageError(error) }, { status: 500 });
  }
}

/** Speicherfehler so aufbereiten, dass die Meldung im Adminbereich weiterhilft. */
function describeStorageError(error: unknown): string {
  if (error instanceof StorageError) return error.message;
  const message = error instanceof Error ? error.message : String(error);
  return `Speichern fehlgeschlagen: ${message}`;
}
