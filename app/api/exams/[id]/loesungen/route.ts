import { NextResponse } from "next/server";
import { getExam } from "@/lib/store";
import { lesenSolutions } from "@/lib/scoring";

export const dynamic = "force-dynamic";

/** Lösungen und Leistungsbeispiele – wird erst auf ausdrücklichen Klick geladen. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = await getExam(id);
  if (!exam) {
    return NextResponse.json({ error: "Modellsatz nicht gefunden." }, { status: 404 });
  }

  const schreiben: Record<string, string> = {};
  for (const part of exam.schreiben.parts) {
    schreiben[String(part.teil)] = part.sampleAnswer;
  }

  return NextResponse.json({ lesen: lesenSolutions(exam), schreiben });
}
