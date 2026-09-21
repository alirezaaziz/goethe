import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { StorageError, getExam } from "@/lib/store";
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
  const rawSeed = url.searchParams.get("seed");
  const seed = rawSeed !== null && /^\d+$/.test(rawSeed) ? Number(rawSeed) : undefined;

  try {
    const reference = referenceId ? await getExam(referenceId) : null;
    const result = buildGeneratorPrompt(reference, { topicHint: hint, seed });
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof StorageError
        ? error.message
        : `Der Prompt konnte nicht erzeugt werden: ${error instanceof Error ? error.message : String(error)}`;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
