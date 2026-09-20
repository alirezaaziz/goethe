"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Timer, { type TimerMode } from "./Timer";
import { clearStored, useStoredState } from "@/lib/client/storage";
import { useApiSettings } from "@/lib/client/apiKey";
import { countWords } from "@/lib/scoring";
import type { Exam, SchreibenFeedback, SchreibenTaskFeedback } from "@/lib/types";

interface Props {
  exam: Exam;
  mode: TimerMode;
}

type Texts = { "1": string; "2": string };

const MAX_POINTS: Record<1 | 2, number> = { 1: 60, 2: 40 };

export default function SchreibenRunner({ exam, mode }: Props) {
  const textsKey = `goethe:schreiben:${exam.id}:texts`;
  const timerKey = `goethe:schreiben:${exam.id}:start`;

  const [texts, setTexts] = useStoredState<Texts>(textsKey, { "1": "", "2": "" });
  const [settings] = useApiSettings();
  const [activeTeil, setActiveTeil] = useState<1 | 2>(1);
  const [feedback, setFeedback] = useState<SchreibenFeedback | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [samples, setSamples] = useState<Record<string, string> | null>(null);
  const [expired, setExpired] = useState(false);

  const task = exam.schreiben.parts.find((p) => p.teil === activeTeil)!;
  const locked = expired || Boolean(feedback);

  const filled = useMemo(
    () => exam.schreiben.parts.filter((p) => texts[String(p.teil) as "1" | "2"].trim().length > 0),
    [exam.schreiben.parts, texts],
  );

  const grade = useCallback(async () => {
    if (sending) return;
    if (!settings.apiKey.trim()) {
      setError(
        "Für die Korrektur wird ein eigener API-Schlüssel benötigt. Er lässt sich unter „Einstellungen“ hinterlegen.",
      );
      return;
    }
    const payload = exam.schreiben.parts
      .map((p) => ({ teil: p.teil, text: texts[String(p.teil) as "1" | "2"].trim() }))
      .filter((entry) => entry.text.length > 0);

    if (payload.length === 0) {
      setError("Es ist noch kein Text vorhanden, der korrigiert werden könnte.");
      return;
    }

    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: exam.id,
          provider: settings.provider,
          model: settings.model,
          apiKey: settings.apiKey,
          tasks: payload,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Die Korrektur ist fehlgeschlagen.");
      setFeedback(data as SchreibenFeedback);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Die Korrektur ist fehlgeschlagen.");
    } finally {
      setSending(false);
    }
  }, [exam.id, exam.schreiben.parts, sending, settings, texts]);

  const loadSamples = useCallback(async () => {
    if (samples) {
      setSamples(null);
      return;
    }
    const res = await fetch(`/api/exams/${exam.id}/loesungen`);
    if (!res.ok) {
      setError("Die Lösungsbeispiele konnten nicht geladen werden.");
      return;
    }
    const data = await res.json();
    setSamples(data.schreiben as Record<string, string>);
  }, [exam.id, samples]);

  const restart = useCallback(() => {
    if (!confirm("Beide Texte und die Uhr zurücksetzen?")) return;
    clearStored(textsKey, timerKey);
    window.location.reload();
  }, [textsKey, timerKey]);

  const words = countWords(texts[String(activeTeil) as "1" | "2"]);
  const target = task.wordCount;
  const ratio = words / target;

  return (
    <div className="mx-auto max-w-6xl px-4 py-5">
      <header className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={`/pruefung/${exam.id}`} className="text-xs text-[var(--muted)] hover:underline">
            ← {exam.title}
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Schreiben</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Timer
            storageKey={timerKey}
            mode={mode}
            minutes={exam.schreiben.durationMinutes}
            frozen={locked}
            onExpire={() => setExpired(true)}
          />
          <span className="chip">{filled.length} / 2 bearbeitet</span>
          <button className="btn" type="button" onClick={loadSamples}>
            {samples ? "Lösungsbeispiele ausblenden" : "Lösungsbeispiele"}
          </button>
          <button className="btn" type="button" onClick={restart}>
            Zurücksetzen
          </button>
          <button className="btn btn-primary" type="button" onClick={grade} disabled={sending}>
            {sending ? "Wird korrigiert …" : "Von der KI korrigieren lassen"}
          </button>
        </div>
      </header>

      {expired && !feedback && (
        <p className="mb-4 rounded-lg border border-[var(--warn)] bg-[var(--warn-soft)] px-3 py-2 text-sm text-[var(--warn)]">
          Die Prüfungszeit von {exam.schreiben.durationMinutes} Minuten ist abgelaufen. Die Texte
          lassen sich nicht mehr ändern, aber noch korrigieren.
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-lg border border-[var(--bad)] bg-[var(--bad-soft)] px-3 py-2 text-sm text-[var(--bad)]">
          {error}{" "}
          {!settings.apiKey.trim() && (
            <Link className="font-semibold underline" href="/einstellungen">
              Zu den Einstellungen
            </Link>
          )}
        </p>
      )}

      {feedback && <FeedbackView feedback={feedback} />}

      <nav className="no-print mb-4 flex flex-wrap gap-1.5">
        {exam.schreiben.parts.map((p) => (
          <button
            key={p.teil}
            type="button"
            onClick={() => setActiveTeil(p.teil)}
            className="rounded-lg border px-3 py-1.5 text-sm font-medium"
            style={
              p.teil === activeTeil
                ? { background: "var(--accent)", borderColor: "var(--accent)", color: "var(--accent-text)" }
                : { background: "var(--surface)" }
            }
          >
            Teil {p.teil}
            <span className="ml-2 text-xs opacity-70">
              ca. {p.wordCount} Wörter · {MAX_POINTS[p.teil]} Pkt.
            </span>
          </button>
        ))}
      </nav>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section className="card p-5 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Teil {task.teil} · vorgeschlagene Arbeitszeit {task.suggestedMinutes} Minuten
          </p>
          <p className="exam-text mb-4">{task.instruction}</p>

          {task.topicTitle && (
            <div className="mb-4 rounded-lg border-2 border-[var(--border-strong)] p-4 text-center">
              <h2 className="font-serif text-lg font-semibold">{task.topicTitle}</h2>
              {task.topicSubtitle && (
                <p className="mt-1 font-serif text-[0.95rem] text-[var(--muted)]">
                  {task.topicSubtitle}
                </p>
              )}
            </div>
          )}

          <ul className="mb-4 space-y-2">
            {task.bullets.map((bullet, index) => (
              <li key={index} className="flex gap-2.5 text-sm">
                <span className="mt-0.5 flex-none text-[var(--accent)]">■</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          <p className="rounded-lg bg-[var(--surface-2)] px-3 py-2 text-sm font-medium">
            Schreiben Sie circa {task.wordCount} Wörter.
          </p>
          <p className="mt-3 text-xs text-[var(--muted)]">
            Bewertet wird, wie genau die Inhaltspunkte bearbeitet sind, wie korrekt der Text ist und
            wie gut Sätze und Abschnitte sprachlich miteinander verknüpft sind.
          </p>

          {samples?.[String(task.teil)] && (
            <details open className="mt-4 rounded-lg border bg-[var(--surface-2)] p-3">
              <summary className="cursor-pointer text-sm font-semibold">
                Leistungsbeispiel auf C1-Niveau
              </summary>
              <p className="prose-sample mt-2 text-sm">{samples[String(task.teil)]}</p>
            </details>
          )}
        </section>

        <section className="card flex flex-col p-4">
          <div className="mb-2 flex items-center justify-between">
            <label className="label mb-0" htmlFor={`text-${task.teil}`}>
              Ihr Text zu Teil {task.teil}
            </label>
            <span
              className="chip tabular-nums"
              style={
                words === 0
                  ? undefined
                  : ratio < 0.5
                    ? { borderColor: "var(--bad)", color: "var(--bad)" }
                    : ratio >= 0.8 && ratio <= 1.35
                      ? { borderColor: "var(--good)", color: "var(--good)" }
                      : { borderColor: "var(--warn)", color: "var(--warn)" }
              }
              title={`Unter ${Math.round(target * 0.5)} Wörtern wird die Aufgabenerfüllung mit E (0 Punkte) bewertet.`}
            >
              {words} / {target} Wörter
            </span>
          </div>
          <textarea
            id={`text-${task.teil}`}
            className="textarea min-h-[62vh] flex-1 font-serif leading-relaxed"
            spellCheck
            lang="de"
            disabled={locked}
            placeholder={
              task.teil === 1
                ? "Beginnen Sie hier mit Ihrem Diskussionsbeitrag …"
                : "Beginnen Sie hier mit Ihrer Nachricht, z. B. „Sehr geehrte Frau …“"
            }
            value={texts[String(task.teil) as "1" | "2"]}
            onChange={(event) =>
              setTexts((prev) => ({ ...prev, [String(task.teil)]: event.target.value }))
            }
          />
          <p className="mt-2 text-xs text-[var(--muted)]">
            Der Text wird automatisch im Browser gespeichert. Hilfsmittel wie Wörterbücher sind in
            der echten Prüfung nicht erlaubt.
          </p>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function FeedbackView({ feedback }: { feedback: SchreibenFeedback }) {
  return (
    <section className="mb-5 space-y-4">
      <div
        className="card p-4"
        style={
          feedback.complete
            ? {
                borderColor: feedback.passed ? "var(--good)" : "var(--bad)",
                background: feedback.passed ? "var(--good-soft)" : "var(--bad-soft)",
              }
            : { borderColor: "var(--warn)", background: "var(--warn-soft)" }
        }
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
              Bewertung Schreiben
            </p>
            <p className="mt-1 text-2xl font-bold">
              {formatPoints(feedback.totalPoints)} /{" "}
              {feedback.complete
                ? 100
                : feedback.tasks.reduce((sum, task) => sum + task.maxPoints, 0)}{" "}
              Punkte
            </p>
          </div>
          {feedback.complete ? (
            <p
              className="text-lg font-bold"
              style={{ color: feedback.passed ? "var(--good)" : "var(--bad)" }}
            >
              {feedback.passed ? "Bestanden" : "Nicht bestanden"}
              <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                (Bestehensgrenze 60 Punkte)
              </span>
            </p>
          ) : (
            <p className="max-w-xs text-sm font-medium" style={{ color: "var(--warn)" }}>
              Nur eine der beiden Aufgaben wurde bewertet – für eine Aussage zum Bestehen wird das
              vollständige Modul benötigt (100 Punkte, Grenze 60).
            </p>
          )}
        </div>
        <p className="mt-3 text-sm">{feedback.overall}</p>
        <p className="mt-3 text-xs text-[var(--muted)]">
          Maschinelle Einschätzung nach den offiziellen Bewertungskriterien. Sie ersetzt keine
          Bewertung durch eine lizenzierte Prüferin bzw. einen lizenzierten Prüfer.
        </p>
      </div>

      {feedback.tasks.map((task) => (
        <TaskFeedbackCard key={task.teil} task={task} />
      ))}
    </section>
  );
}

function TaskFeedbackCard({ task }: { task: SchreibenTaskFeedback }) {
  const criteria = [
    { label: "Aufgabenerfüllung", value: task.erfuellung },
    { label: "Kohärenz", value: task.kohaerenz },
    { label: "Wortschatz", value: task.wortschatz },
    { label: "Strukturen", value: task.strukturen },
  ];

  return (
    <div className="card p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-bold">Teil {task.teil}</h3>
        <span className="text-sm font-semibold">
          {formatPoints(task.points)} / {task.maxPoints} Punkte
          <span className="ml-2 font-normal text-[var(--muted)]">{task.wordCount} Wörter</span>
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {criteria.map((criterion) => (
          <div key={criterion.label} className="rounded-lg border bg-[var(--surface-2)] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">{criterion.label}</span>
              <span className="chip tabular-nums" style={gradeStyle(criterion.value.grade)}>
                {criterion.value.grade} · {formatPoints(criterion.value.points)} Pkt.
              </span>
            </div>
            <p className="mt-1.5 text-sm text-[var(--muted)]">{criterion.value.comment}</p>
          </div>
        ))}
      </div>

      {task.corrections.length > 0 && (
        <div className="mt-3">
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Sprachliche Korrekturen
          </h4>
          <ul className="space-y-1.5">
            {task.corrections.map((correction, index) => (
              <li key={index} className="rounded-lg border p-2.5 text-sm">
                <span className="text-[var(--bad)] line-through">{correction.original}</span>
                <span className="mx-2 text-[var(--muted)]">→</span>
                <span className="font-medium text-[var(--good)]">{correction.correction}</span>
                <p className="mt-1 text-xs text-[var(--muted)]">{correction.reason}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 border-t pt-3 text-sm">{task.summary}</p>
    </div>
  );
}

function gradeStyle(grade: string) {
  if (grade === "A" || grade === "B")
    return { borderColor: "var(--good)", color: "var(--good)", background: "var(--good-soft)" };
  if (grade === "C")
    return { borderColor: "var(--warn)", color: "var(--warn)", background: "var(--warn-soft)" };
  return { borderColor: "var(--bad)", color: "var(--bad)", background: "var(--bad-soft)" };
}

function formatPoints(points: number) {
  return Number.isInteger(points) ? String(points) : points.toFixed(1).replace(".", ",");
}
