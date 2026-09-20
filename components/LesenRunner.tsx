"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ExamTextView from "./ExamTextView";
import Timer, { type TimerMode } from "./Timer";
import { clearStored, useStoredState } from "@/lib/client/storage";
import { readJson } from "@/lib/client/fetchJson";
import type { Exam, LesenPart } from "@/lib/types";
import type { LesenResult } from "@/lib/scoring";

interface Props {
  exam: Exam;
  mode: TimerMode;
}

type Answers = Record<string, string>;

export default function LesenRunner({ exam, mode }: Props) {
  const answersKey = `goethe:lesen:${exam.id}:answers`;
  const timerKey = `goethe:lesen:${exam.id}:start`;

  const [answers, setAnswers] = useStoredState<Answers>(answersKey, {});
  const [activeTeil, setActiveTeil] = useState(1);

  // Direktlink auf einen Teil, z. B. …/lesen?teil=3
  useEffect(() => {
    const requested = Number(new URLSearchParams(window.location.search).get("teil"));
    if (exam.lesen.parts.some((p) => p.teil === requested)) setActiveTeil(requested);
  }, [exam.lesen.parts]);
  const [result, setResult] = useState<LesenResult | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalItems = useMemo(
    () => exam.lesen.parts.reduce((sum, part) => sum + part.items.length, 0),
    [exam],
  );
  const answeredCount = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers],
  );

  const setAnswer = useCallback(
    (id: number, value: string | null) => {
      if (result) return;
      setAnswers((prev) => {
        const next = { ...prev };
        if (value === null) delete next[String(id)];
        else next[String(id)] = value;
        return next;
      });
    },
    [result, setAnswers],
  );

  const submit = useCallback(async () => {
    if (result || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/exams/${exam.id}/lesen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await readJson<LesenResult & { error?: string }>(res);
      if (!res.ok) throw new Error(data.error ?? "Auswertung fehlgeschlagen.");
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auswertung fehlgeschlagen.");
    } finally {
      setSending(false);
    }
  }, [answers, exam.id, result, sending]);

  const restart = useCallback(() => {
    if (!confirm("Alle Antworten und die Uhr zurücksetzen?")) return;
    clearStored(answersKey, timerKey);
    window.location.reload();
  }, [answersKey, timerKey]);

  const resultById = useMemo(() => {
    if (!result) return null;
    return new Map(result.items.map((item) => [item.id, item]));
  }, [result]);

  const part = exam.lesen.parts.find((p) => p.teil === activeTeil)!;

  return (
    <div className="mx-auto max-w-6xl px-4 py-5">
      <header className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/pruefung/${exam.id}`}
            className="text-xs text-[var(--muted)] hover:underline"
          >
            ← {exam.title}
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Lesen</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Timer
            storageKey={timerKey}
            mode={mode}
            minutes={exam.lesen.durationMinutes}
            frozen={Boolean(result)}
            onExpire={submit}
          />
          <span className="chip">
            {answeredCount} / {totalItems} beantwortet
          </span>
          <button className="btn" onClick={restart} type="button">
            Zurücksetzen
          </button>
          {!result && (
            <button className="btn btn-primary" onClick={submit} disabled={sending} type="button">
              {sending ? "Wird ausgewertet …" : "Abgeben und auswerten"}
            </button>
          )}
        </div>
      </header>

      {error && (
        <p className="mb-4 rounded-lg border border-[var(--bad)] bg-[var(--bad-soft)] px-3 py-2 text-sm text-[var(--bad)]">
          {error}
        </p>
      )}

      {result && <ResultBanner result={result} examId={exam.id} />}

      <nav className="no-print mb-4 flex flex-wrap gap-1.5">
        {exam.lesen.parts.map((p) => {
          const done = p.items.filter((i) => answers[String(i.id)]).length;
          return (
            <button
              key={p.teil}
              type="button"
              onClick={() => {
                setActiveTeil(p.teil);
                const url = new URL(window.location.href);
                url.searchParams.set("teil", String(p.teil));
                window.history.replaceState(null, "", url);
              }}
              className="rounded-lg border px-3 py-1.5 text-sm font-medium"
              style={
                p.teil === activeTeil
                  ? {
                      background: "var(--accent)",
                      borderColor: "var(--accent)",
                      color: "var(--accent-text)",
                    }
                  : { background: "var(--surface)" }
              }
            >
              Teil {p.teil}
              <span className="ml-2 text-xs opacity-70">
                {result
                  ? `${result.perTeil.find((t) => t.teil === p.teil)?.correct ?? 0}/${p.items.length}`
                  : `${done}/${p.items.length}`}
              </span>
            </button>
          );
        })}
      </nav>

      <p className="mb-4 rounded-lg border bg-[var(--surface-2)] px-3 py-2 text-sm">
        <strong className="mr-2">Teil {part.teil}</strong>
        {part.instruction}
        <span className="ml-2 text-xs text-[var(--muted)]">
          (vorgeschlagene Arbeitszeit: {part.suggestedMinutes} Minuten)
        </span>
      </p>

      <PartView
        part={part}
        answers={answers}
        setAnswer={setAnswer}
        resultById={resultById}
        locked={Boolean(result)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ResultBanner({ result, examId }: { result: LesenResult; examId: string }) {
  return (
    <section
      className="card mb-5 p-4"
      style={{
        borderColor: result.passed ? "var(--good)" : "var(--bad)",
        background: result.passed ? "var(--good-soft)" : "var(--bad-soft)",
      }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Ergebnis Lesen
          </p>
          <p className="mt-1 text-2xl font-bold">
            {result.points} / 100 Punkte
            <span className="ml-3 text-base font-medium text-[var(--muted)]">
              {result.rawScore} von {result.maxRaw} Aufgaben richtig
            </span>
          </p>
        </div>
        <p
          className="text-lg font-bold"
          style={{ color: result.passed ? "var(--good)" : "var(--bad)" }}
        >
          {result.passed ? "Bestanden" : "Nicht bestanden"}
          <span className="ml-2 text-xs font-normal text-[var(--muted)]">
            (Bestehensgrenze 60 Punkte)
          </span>
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {result.perTeil.map((t) => (
          <span key={t.teil} className="chip">
            Teil {t.teil}: {t.correct}/{t.total}
          </span>
        ))}
        <Link className="chip hover:underline" href={`/pruefung/${examId}`}>
          → zur Modulübersicht
        </Link>
      </div>
    </section>
  );
}

type ResultMap = Map<number, { given: string | null; correct: string; isCorrect: boolean }> | null;

interface PartProps {
  part: LesenPart;
  answers: Answers;
  setAnswer: (id: number, value: string | null) => void;
  resultById: ResultMap;
  locked: boolean;
}

function PartView(props: PartProps) {
  switch (props.part.type) {
    case "mc-gap":
      return <McGapPart {...props} part={props.part} />;
    case "mc-questions":
      return <McQuestionsPart {...props} part={props.part} />;
    case "sentence-insert":
      return <SentenceInsertPart {...props} part={props.part} />;
    case "match-source":
      return <MatchSourcePart {...props} part={props.part} />;
  }
}

/** Zustand einer Option nach der Auswertung. */
function optionState(
  resultById: ResultMap,
  id: number,
  key: string,
): "correct" | "wrong" | "missed" | undefined {
  const entry = resultById?.get(id);
  if (!entry) return undefined;
  if (key === entry.correct) return entry.isCorrect ? "correct" : "missed";
  if (key === entry.given) return "wrong";
  return undefined;
}

function gapState(resultById: ResultMap, id: number) {
  const entry = resultById?.get(id);
  if (!entry) return undefined;
  return entry.isCorrect ? ("correct" as const) : ("wrong" as const);
}

/* ---------------- Teil 1: Lückentext mit Multiple-Choice ---------------- */

function McGapPart({
  part,
  answers,
  setAnswer,
  resultById,
  locked,
}: PartProps & { part: Extract<LesenPart, { type: "mc-gap" }> }) {
  const [activeGap, setActiveGap] = useState<number | null>(null);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="card p-5 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto">
        <ExamTextView
          text={part.text}
          activeGap={activeGap}
          gapFilled={(id) => (id === 0 ? true : Boolean(answers[String(id)]))}
          gapState={(id) => (id === 0 ? undefined : gapState(resultById, id))}
          gapLabel={(id) => {
            if (id === 0) return `0 ${part.example.options[part.example.answer]}`;
            const chosen = answers[String(id)];
            return chosen ? `${id} ${part.items.find((i) => i.id === id)!.options[chosen]}` : String(id);
          }}
          onGapClick={(id) => {
            if (id === 0) return;
            setActiveGap(id);
            document.getElementById(`item-${id}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
          }}
        />
      </div>

      <div className="space-y-3">
        <div className="card p-3 opacity-70">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Beispiel
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(part.example.options).map(([key, label]) => (
              <div
                key={key}
                className="opt"
                data-state={key === part.example.answer ? "correct" : undefined}
              >
                <span className="opt-key">{key}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {part.items.map((item) => (
          <div key={item.id} id={`item-${item.id}`} className="card p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold">{item.id}</span>
              <Verdict resultById={resultById} id={item.id} />
            </div>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {Object.entries(item.options).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className="opt"
                  disabled={locked}
                  data-selected={answers[String(item.id)] === key}
                  data-state={optionState(resultById, item.id, key)}
                  onClick={() =>
                    setAnswer(item.id, answers[String(item.id)] === key ? null : key)
                  }
                >
                  <span className="opt-key">{key}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Teil 2: Multiple-Choice zum Text ---------------- */

function McQuestionsPart({
  part,
  answers,
  setAnswer,
  resultById,
  locked,
}: PartProps & { part: Extract<LesenPart, { type: "mc-questions" }> }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="card p-5 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto">
        <ExamTextView text={part.text} />
      </div>
      <div className="space-y-3">
        {part.items.map((item) => (
          <div key={item.id} className="card p-3">
            <div className="mb-2 flex items-start justify-between gap-3">
              <p className="text-sm font-medium">
                <span className="mr-2 font-bold">{item.id}</span>
                {item.question}
              </p>
              <Verdict resultById={resultById} id={item.id} />
            </div>
            <div className="space-y-1.5">
              {Object.entries(item.options).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className="opt"
                  disabled={locked}
                  data-selected={answers[String(item.id)] === key}
                  data-state={optionState(resultById, item.id, key)}
                  onClick={() =>
                    setAnswer(item.id, answers[String(item.id)] === key ? null : key)
                  }
                >
                  <span className="opt-key">{key}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Teil 3: Sätze in Lücken einsetzen ---------------- */

function SentenceInsertPart({
  part,
  answers,
  setAnswer,
  resultById,
  locked,
}: PartProps & { part: Extract<LesenPart, { type: "sentence-insert" }> }) {
  const [activeGap, setActiveGap] = useState<number | null>(part.items[0]?.id ?? null);

  const usedBy = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of part.items) {
      const value = answers[String(item.id)];
      if (value) map.set(value, item.id);
    }
    return map;
  }, [answers, part.items]);

  function assign(key: string) {
    if (locked || activeGap === null) return;
    // Ein Satz kann nur in einer Lücke stehen – vorherige Zuordnung räumen.
    const previous = usedBy.get(key);
    if (previous !== undefined && previous !== activeGap) setAnswer(previous, null);
    setAnswer(activeGap, answers[String(activeGap)] === key ? null : key);
    const next = part.items.find((i) => i.id > activeGap && !answers[String(i.id)]);
    setActiveGap(next?.id ?? activeGap);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="card p-5 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto">
        <ExamTextView
          text={part.text}
          activeGap={activeGap}
          gapFilled={(id) => (id === 0 ? true : Boolean(answers[String(id)]))}
          gapState={(id) => (id === 0 ? undefined : gapState(resultById, id))}
          gapLabel={(id) => (id === 0 ? "0" : `${id} ${answers[String(id)] ?? "…"}`)}
          onGapClick={(id) => id !== 0 && setActiveGap(id)}
        />
        <p className="mt-4 rounded-lg border bg-[var(--surface-2)] p-3 text-sm">
          <strong>Beispiel 0:</strong> {part.example.sentence}
        </p>
      </div>

      <div className="space-y-4">
        <div className="card p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Lücken – erst Lücke wählen, dann Satz anklicken
          </p>
          <div className="flex flex-wrap gap-1.5">
            {part.items.map((item) => {
              const chosen = answers[String(item.id)];
              const entry = resultById?.get(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveGap(item.id)}
                  className="rounded-lg border px-2.5 py-1.5 text-sm font-semibold tabular-nums"
                  style={{
                    background: entry
                      ? entry.isCorrect
                        ? "var(--good-soft)"
                        : "var(--bad-soft)"
                      : activeGap === item.id
                        ? "var(--accent)"
                        : chosen
                          ? "var(--accent-soft)"
                          : "var(--surface)",
                    color: entry
                      ? entry.isCorrect
                        ? "var(--good)"
                        : "var(--bad)"
                      : activeGap === item.id
                        ? "var(--accent-text)"
                        : undefined,
                    borderColor:
                      activeGap === item.id && !entry ? "var(--accent)" : "var(--border)",
                  }}
                >
                  {item.id}
                  <span className="ml-1.5 opacity-80">{chosen ?? "–"}</span>
                  {entry && !entry.isCorrect && (
                    <span className="ml-1.5 text-xs">→ {entry.correct}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Sätze – zwei passen nicht
          </p>
          <div className="space-y-1.5">
            {part.bank.map((entry) => {
              const inGap = usedBy.get(entry.key);
              return (
                <button
                  key={entry.key}
                  type="button"
                  className="opt"
                  disabled={locked}
                  data-selected={activeGap !== null && answers[String(activeGap)] === entry.key}
                  onClick={() => assign(entry.key)}
                  style={inGap !== undefined ? { opacity: 0.6 } : undefined}
                >
                  <span className="opt-key">{entry.key}</span>
                  <span>
                    {entry.text}
                    {inGap !== undefined && (
                      <em className="ml-1.5 not-italic text-xs text-[var(--muted)]">
                        → Lücke {inGap}
                      </em>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Teil 4: Aussagen Personen zuordnen ---------------- */

function MatchSourcePart({
  part,
  answers,
  setAnswer,
  resultById,
  locked,
}: PartProps & { part: Extract<LesenPart, { type: "match-source" }> }) {
  const keys = [...part.sources.map((s) => s.key), "0"];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="card p-5 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto">
        <header className="mb-4 border-b pb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            {part.heading}
          </p>
          {part.subheading && (
            <h3 className="mt-1 text-lg font-semibold tracking-tight">{part.subheading}</h3>
          )}
        </header>
        <div className="space-y-5">
          {part.sources.map((source) => (
            <section key={source.key}>
              <h4 className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
                <span className="opt-key">{source.key}</span>
                {source.name}
              </h4>
              <p className="exam-text">{source.text}</p>
            </section>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="card p-3 opacity-70">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Beispiel 0
          </p>
          <p className="text-sm">
            {part.example.statement}{" "}
            <strong className="ml-1">Lösung: {part.example.answer}</strong>
          </p>
        </div>

        {part.items.map((item) => (
          <div key={item.id} className="card p-3">
            <div className="mb-2 flex items-start justify-between gap-3">
              <p className="text-sm">
                <span className="mr-2 font-bold">{item.id}</span>
                {item.statement}
              </p>
              <Verdict resultById={resultById} id={item.id} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {keys.map((key) => (
                <button
                  key={key}
                  type="button"
                  className="opt !w-auto"
                  disabled={locked}
                  data-selected={answers[String(item.id)] === key}
                  data-state={optionState(resultById, item.id, key)}
                  onClick={() =>
                    setAnswer(item.id, answers[String(item.id)] === key ? null : key)
                  }
                  title={
                    key === "0"
                      ? "Die Aussage passt zu niemandem."
                      : part.sources.find((s) => s.key === key)?.name
                  }
                >
                  <span className="opt-key">{key}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Verdict({ resultById, id }: { resultById: ResultMap; id: number }) {
  const entry = resultById?.get(id);
  if (!entry) return null;
  return (
    <span
      className="chip flex-none"
      style={{
        background: entry.isCorrect ? "var(--good-soft)" : "var(--bad-soft)",
        borderColor: entry.isCorrect ? "var(--good)" : "var(--bad)",
        color: entry.isCorrect ? "var(--good)" : "var(--bad)",
      }}
    >
      {entry.isCorrect ? "✓ richtig" : `✗ richtig: ${entry.correct}`}
    </span>
  );
}
