import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getExam } from "@/lib/store";
import { buildGeneratorPrompt } from "@/lib/generator-prompt";

export const dynamic = "force-dynamic";

/** Liefert den Prompt, mit dem eine andere KI einen neuen Modellsatz erzeugt. */
export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const url = new URL(request.url);
  const referenceId = url.searchParams.get("referenz");
  const hint = url.searchParams.get("themen") ?? undefined;
  const reference = referenceId ? await getExam(referenceId) : null;

  return NextResponse.json({ prompt: buildGeneratorPrompt(reference, hint) });
}
