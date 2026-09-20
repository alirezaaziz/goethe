import Link from "next/link";
import { notFound } from "next/navigation";
import { getExam } from "@/lib/store";

export const dynamic = "force-dynamic";

type Search = { [key: string]: string | string[] | undefined };

export default async function ExamPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Search>;
}) {
  const { id } = await params;
  const search = await searchParams;
  const exam = await getExam(id);
  if (!exam) notFound();

  const untimed = search.zeit === "frei";
  const suffix = untimed ? "?zeit=frei" : "";

  const modules = [
    {
      key: "lesen",
      title: "Lesen",
      minutes: exam.lesen.durationMinutes,
      description: "Vier Teile, 30 Aufgaben. Wird sofort ausgewertet, mit Lösungen zum Vergleich.",
      details: exam.lesen.parts.map(
        (part) => `Teil ${part.teil}: ${part.items.length} Aufgaben, ${part.suggestedMinutes} Min.`,
      ),
    },
    {
      key: "schreiben",
      title: "Schreiben",
      minutes: exam.schreiben.durationMinutes,
      description:
        "Zwei Aufgaben. Auf Wunsch von Claude oder ChatGPT nach den offiziellen Kriterien korrigiert.",
      details: exam.schreiben.parts.map(
        (part) => `Teil ${part.teil}: circa ${part.wordCount} Wörter, ${part.suggestedMinutes} Min.`,
      ),
    },
    {
      key: "sprechen",
      title: "Sprechen",
      minutes: exam.sprechen.parts[0].durationMinutes + exam.sprechen.parts[1].durationMinutes,
      description: `Vortrag und Diskussion mit Phasenuhr und ${exam.sprechen.preparationMinutes} Minuten Vorbereitungszeit.`,
      details: [
        `Teil 1: Vortrag, circa ${exam.sprechen.parts[0].durationMinutes} Min.`,
        `Teil 2: Diskussion, circa ${exam.sprechen.parts[1].durationMinutes} Min.`,
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/" className="text-xs text-[var(--muted)] hover:underline">
        ← Alle Modellsätze
      </Link>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{exam.title}</h1>
      {exam.description && <p className="mt-2 text-[var(--muted)]">{exam.description}</p>}

      <section className="card mt-7 p-4">
        <h2 className="text-sm font-semibold">Zeitvorgabe</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Die Zeit läuft je Modul getrennt und wird auch nach einem Neuladen der Seite korrekt
          weitergezählt.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`/pruefung/${exam.id}`}
            className="rounded-lg border px-3.5 py-2 text-sm font-medium"
            style={
              untimed
                ? { background: "var(--surface)" }
                : { background: "var(--accent)", borderColor: "var(--accent)", color: "var(--accent-text)" }
            }
          >
            ⏳ Mit Prüfungszeit
            <span className="ml-2 text-xs opacity-75">offizielle Vorgaben, Abgabe automatisch</span>
          </Link>
          <Link
            href={`/pruefung/${exam.id}?zeit=frei`}
            className="rounded-lg border px-3.5 py-2 text-sm font-medium"
            style={
              untimed
                ? { background: "var(--accent)", borderColor: "var(--accent)", color: "var(--accent-text)" }
                : { background: "var(--surface)" }
            }
          >
            ⏱ Ohne Zeitbegrenzung
            <span className="ml-2 text-xs opacity-75">Uhr läuft nur mit</span>
          </Link>
        </div>
      </section>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {modules.map((module) => (
          <Link
            key={module.key}
            href={`/pruefung/${exam.id}/${module.key}${suffix}`}
            className="card flex flex-col p-5 transition-colors hover:border-[var(--accent)]"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold tracking-tight">{module.title}</h2>
              <span className="chip tabular-nums">{module.minutes} Min.</span>
            </div>
            <p className="mt-2 flex-1 text-sm text-[var(--muted)]">{module.description}</p>
            <ul className="mt-3 space-y-0.5 border-t pt-3 text-xs text-[var(--muted)]">
              {module.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </Link>
        ))}
      </div>

      <p className="mt-6 text-xs text-[var(--muted)]">
        In der Prüfung können pro Modul maximal 100 Punkte erreicht werden. Die Bestehensgrenze liegt
        bei 60 Punkten.
      </p>
    </div>
  );
}
