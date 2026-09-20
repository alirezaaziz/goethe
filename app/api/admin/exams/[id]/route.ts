import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { deleteExam, getExam, listExams, renameExam } from "@/lib/store";
import { validateExam } from "@/lib/validate-exam";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  const exam = await getExam((await params).id);
  if (!exam) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  return NextResponse.json({ exam });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { id } = await params;
  if (!(await getExam(id))) {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
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

  // Beim Umbenennen darf die neue ID nicht schon belegt sein.
  if (validation.exam.id !== id) {
    const existing = await listExams();
    if (existing.some((exam) => exam.id === validation.exam.id)) {
      return NextResponse.json(
        { error: `Es gibt bereits einen Modellsatz mit der ID „${validation.exam.id}“.` },
        { status: 409 },
      );
    }
  }

  return NextResponse.json({ exam: await renameExam(id, validation.exam) });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  const removed = await deleteExam((await params).id);
  if (!removed) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
