import Link from "next/link";
import { listExamsSafe, storageBackend } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { exams, error } = await listExamsSafe();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <section className="mb-9">
        <h1 className="text-3xl font-bold tracking-tight">Modellsätze</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Üben Sie die Module <strong>Lesen</strong>, <strong>Schreiben</strong> und{" "}
          <strong>Sprechen</strong> des Goethe-Zertifikats C1 (modular) – unter Prüfungsbedingungen
          mit den offiziellen Zeitvorgaben oder in Ruhe ohne Uhr. Das Modul Hören ist nicht Teil
          dieses Trainers.
        </p>
      </section>

      {error ? (
        <div className="card p-6" style={{ borderColor: "var(--bad)", background: "var(--bad-soft)" }}>
          <p className="font-semibold text-[var(--bad)]">
            Die Modellsätze konnten nicht geladen werden.
          </p>
          <p className="mt-2 text-sm text-[var(--bad)]">{error}</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="font-medium">Es ist noch kein Modellsatz hinterlegt.</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Speicherort:{" "}
            {storageBackend() === "blob" ? "Vercel Blob" : "lokale Datei .data/exams.json"}.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {exams.map((exam) => (
            <li key={exam.id}>
              <Link
                href={`/pruefung/${exam.id}`}
                className="card block p-5 transition-colors hover:border-[var(--accent)]"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-lg font-semibold tracking-tight">{exam.title}</h2>
                  <span className="text-xs text-[var(--muted)]">
                    zuletzt geändert am{" "}
                    {new Date(exam.updatedAt).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {exam.description && (
                  <p className="mt-1.5 text-sm text-[var(--muted)]">{exam.description}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="chip">Lesen · {exam.lesen.durationMinutes} Min.</span>
                  <span className="chip">Schreiben · {exam.schreiben.durationMinutes} Min.</span>
                  <span className="chip">
                    Sprechen · circa {exam.sprechen.parts[0].durationMinutes +
                      exam.sprechen.parts[1].durationMinutes}{" "}
                    Min.
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
