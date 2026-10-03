import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { StorageError, listExams } from "@/lib/store";
import { buildGeneratorPrompt } from "@/lib/generator-prompt";

export const dynamic = "force-dynamic";

/** Liefert den Prompt, mit dem eine andere KI einen neuen Modellsatz erzeugt. */
export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const url = new URL(request.url);
  const rawSeed = url.searchParams.get("seed");
  const seed = rawSeed !== null && /^\d+$/.test(rawSeed) ? Number(rawSeed) : undefined;

  try {
    // Die Themen aller vorhandenen Sätze landen auf der Sperrliste.
    const result = buildGeneratorPrompt({ seed, existingExams: await listExams() });
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof StorageError
        ? error.message
        : `Der Prompt konnte nicht erzeugt werden: ${error instanceof Error ? error.message : String(error)}`;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
