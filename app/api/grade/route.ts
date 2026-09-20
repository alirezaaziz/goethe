import { NextResponse } from "next/server";
import { getExam } from "@/lib/store";
import { buildUserPrompt, toFeedback, type GradeRequestTask } from "@/lib/grading/shared";

export const dynamic = "force-dynamic";
// Modelle mit Thinking brauchen für zwei Texte spürbar länger als die Vercel-Standardgrenze.
export const maxDuration = 300;

interface Body {
  examId?: string;
  provider?: string;
  model?: string;
  apiKey?: string;
  tasks?: Array<{ teil?: number; text?: string }>;
}

/**
 * Korrigiert die Schreibaufgaben mit dem API-Schlüssel der Nutzerin bzw. des
 * Nutzers. Der Schlüssel wird nur für diese eine Anfrage verwendet, nirgends
 * gespeichert und nicht protokolliert.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const { examId, provider, model, apiKey } = body;

  if (!apiKey?.trim()) {
    return NextResponse.json({ error: "Es wurde kein API-Schlüssel übermittelt." }, { status: 400 });
  }
  if (provider !== "anthropic" && provider !== "openai") {
    return NextResponse.json({ error: "Unbekannter Anbieter." }, { status: 400 });
  }
  if (!model?.trim()) {
    return NextResponse.json({ error: "Es wurde kein Modell ausgewählt." }, { status: 400 });
  }
  if (!examId) {
    return NextResponse.json({ error: "Kein Modellsatz angegeben." }, { status: 400 });
  }

  const exam = await getExam(examId);
  if (!exam) {
    return NextResponse.json({ error: "Modellsatz nicht gefunden." }, { status: 404 });
  }

  const tasks: GradeRequestTask[] = [];
  for (const entry of body.tasks ?? []) {
    if ((entry.teil !== 1 && entry.teil !== 2) || typeof entry.text !== "string") continue;
    const text = entry.text.trim();
    if (!text) continue;
    if (text.length > 20000) {
      return NextResponse.json({ error: "Der Text ist zu lang." }, { status: 400 });
    }
    tasks.push({ teil: entry.teil, text });
  }

  if (tasks.length === 0) {
    return NextResponse.json({ error: "Es wurde kein Text zum Korrigieren übermittelt." }, { status: 400 });
  }

  try {
    const prompt = buildUserPrompt(exam, tasks);
    const raw =
      provider === "anthropic"
        ? await (await import("@/lib/grading/anthropic")).gradeWithAnthropic(apiKey, model, prompt)
        : await (await import("@/lib/grading/openai")).gradeWithOpenAI(apiKey, model, prompt);

    return NextResponse.json(toFeedback(raw, tasks));
  } catch (error) {
    return NextResponse.json({ error: describe(error) }, { status: 502 });
  }
}

/** Übersetzt die üblichen Anbieterfehler in etwas Verständliches. */
function describe(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const status = (error as { status?: number })?.status;

  if (status === 401 || /authentication|invalid[_ ]api[_ ]key|incorrect api key/i.test(raw)) {
    return "Der API-Schlüssel wurde abgelehnt. Bitte prüfen Sie ihn in den Einstellungen.";
  }
  if (status === 403) {
    return "Der Schlüssel hat keinen Zugriff auf dieses Modell.";
  }
  if (status === 404 || /model.*(not found|does not exist)/i.test(raw)) {
    return "Das ausgewählte Modell ist für diesen Schlüssel nicht verfügbar. Bitte ein anderes Modell wählen.";
  }
  if (status === 429 || /rate[_ ]limit/i.test(raw)) {
    return "Das Kontingent des Anbieters ist erschöpft. Bitte in einigen Minuten erneut versuchen.";
  }
  if (/credit balance|quota|insufficient_quota/i.test(raw)) {
    return "Das Guthaben des API-Kontos reicht nicht aus.";
  }
  return `Die Korrektur ist fehlgeschlagen: ${raw}`;
}
