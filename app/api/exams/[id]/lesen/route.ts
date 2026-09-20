import { NextResponse } from "next/server";
import { getExam } from "@/lib/store";
import { scoreLesen } from "@/lib/scoring";

export const dynamic = "force-dynamic";

/** Wertet die Leseaufgaben aus. Die Lösungen bleiben dabei auf dem Server. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = await getExam(id);
  if (!exam) {
    return NextResponse.json({ error: "Modellsatz nicht gefunden." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const answers = (body as { answers?: unknown }).answers;
  if (typeof answers !== "object" || answers === null || Array.isArray(answers)) {
    return NextResponse.json({ error: "Es wurden keine Antworten übermittelt." }, { status: 400 });
  }

  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(answers as Record<string, unknown>)) {
    if (typeof value === "string") normalized[key] = value;
  }

  return NextResponse.json(scoreLesen(exam, normalized));
}
