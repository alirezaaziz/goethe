"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { clearStored, useStoredState } from "@/lib/client/storage";
import type { TimerMode } from "./Timer";
import type { Exam } from "@/lib/types";

interface Props {
  exam: Exam;
  mode: TimerMode;
}

interface Phase {
  id: string;
  label: string;
  hint: string;
  seconds: number;
}

function formatClock(seconds: number) {
  const sign = seconds < 0 ? "-" : "";
  const s = Math.abs(seconds);
  return `${sign}${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function SprechenRunner({ exam, mode }: Props) {
  const notesKey = `goethe:sprechen:${exam.id}:notizen`;
  const topicKey = `goethe:sprechen:${exam.id}:thema`;

  const [vortrag, diskussion] = exam.sprechen.parts;
  const [notes, setNotes] = useStoredState(notesKey, "");
  const [topicIndex, setTopicIndex] = useStoredState<number>(topicKey, 0);

  const phases = useMemo<Phase[]>(
    () => [
      {
        id: "vorbereitung",
        label: "Vorbereitung",
        hint: "Thema wählen, Stichpunkte notieren. Sie bereiten sich allein vor.",
        seconds: exam.sprechen.preparationMinutes * 60,
      },
      {
        id: "vortrag",
        label: "Teil 1 – Vortrag",
        hint: "Frei sprechen, alle vier Punkte abdecken, gut strukturiert vortragen.",
        seconds: 5 * 60,
      },
      {
        id: "fragen",
        label: "Teil 1 – Fragen",
        hint: "Nachfragen der Gesprächspartnerinnen und Gesprächspartner beantworten.",
        seconds: 2 * 60,
      },
      {
        id: "diskussion",
        label: "Teil 2 – Diskussion",
        hint: "Standpunkte vertreten, argumentieren, sich am Ende auf Argumente einigen.",
        seconds: diskussion.durationMinutes * 60,
      },
    ],
    [diskussion.durationMinutes, exam.sprechen.preparationMinutes],
  );

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const phase = phases[phaseIndex];

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const goToPhase = useCallback((index: number) => {
    setPhaseIndex(index);
    setElapsed(0);
    setRunning(false);
  }, []);

  const remaining = phase.seconds - elapsed;
  const display = mode === "timed" ? remaining : elapsed;
  const over = mode === "timed" && remaining <= 0;
  const critical = mode === "timed" && remaining <= 30;

  const topic = vortrag.topics[topicIndex] ?? vortrag.topics[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-5">
      <header className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={`/pruefung/${exam.id}`} className="text-xs text-[var(--muted)] hover:underline">
            ← {exam.title}
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Sprechen</h1>
        </div>
        <button
          className="btn"
          type="button"
          onClick={() => {
            if (!confirm("Notizen und Themenwahl zurücksetzen?")) return;
            clearStored(notesKey, topicKey);
            window.location.reload();
          }}
        >
          Zurücksetzen
        </button>
      </header>

      <section className="card no-print mb-5 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {phases.map((entry, index) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => goToPhase(index)}
              className="rounded-lg border px-3 py-1.5 text-sm font-medium"
              style={
                index === phaseIndex
                  ? { background: "var(--accent)", borderColor: "var(--accent)", color: "var(--accent-text)" }
                  : index < phaseIndex
                    ? { background: "var(--surface-2)", color: "var(--muted)" }
                    : { background: "var(--surface)" }
              }
            >
              {entry.label}
              <span className="ml-2 text-xs opacity-70">{Math.round(entry.seconds / 60)} Min.</span>
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <div>
            <p
              className="font-mono text-3xl font-bold tabular-nums"
              style={{ color: over || critical ? "var(--bad)" : undefined }}
            >
              {formatClock(display)}
            </p>
            <p className="mt-0.5 text-sm text-[var(--muted)]">{phase.hint}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn" type="button" onClick={() => setRunning((value) => !value)}>
              {running ? "Pause" : elapsed > 0 ? "Weiter" : "Start"}
            </button>
            <button className="btn" type="button" onClick={() => goToPhase(phaseIndex)}>
              Neu starten
            </button>
            {phaseIndex < phases.length - 1 && (
              <button className="btn btn-primary" type="button" onClick={() => goToPhase(phaseIndex + 1)}>
                Nächste Phase
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <section className="card p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold">
                Teil 1 – Vortrag halten
                <span className="ml-2 text-sm font-normal text-[var(--muted)]">
                  circa {vortrag.durationMinutes} Minuten
                </span>
              </h2>
              <div className="no-print flex gap-1.5">
                {vortrag.topics.map((entry, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setTopicIndex(index)}
                    className="rounded-lg border px-2.5 py-1 text-sm font-medium"
                    style={
                      index === topicIndex
                        ? { background: "var(--accent)", borderColor: "var(--accent)", color: "var(--accent-text)" }
                        : { background: "var(--surface)" }
                    }
                  >
                    Thema {index + 1}
                  </button>
                ))}
              </div>
            </div>

            <p className="exam-text mb-4 text-[0.95rem] text-[var(--muted)]">{vortrag.instruction}</p>

            <div className="rounded-lg border-2 border-[var(--border-strong)] p-4">
              <h3 className="font-serif text-lg font-semibold leading-snug">{topic.title}</h3>
              <p className="exam-text mt-2">{topic.intro}</p>
              {topic.extra && topic.extra.length > 0 && (
                <ul className="mt-3 space-y-0.5 font-mono text-sm text-[var(--muted)]">
                  {topic.extra.map((entry, index) => (
                    <li key={index}>{entry}</li>
                  ))}
                </ul>
              )}
            </div>

            <ul className="mt-4 space-y-2">
              {topic.bullets.map((bullet, index) => (
                <li key={index} className="flex gap-2.5 text-sm">
                  <span className="mt-0.5 flex-none text-[var(--accent)]">■</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-5">
            <h2 className="mb-3 text-base font-bold">
              Teil 2 – Diskussion führen
              <span className="ml-2 text-sm font-normal text-[var(--muted)]">
                circa {diskussion.durationMinutes} Minuten
              </span>
            </h2>
            <p className="exam-text mb-4 text-[0.95rem] text-[var(--muted)]">
              {diskussion.instruction}
            </p>
            <div className="rounded-lg border-2 border-[var(--border-strong)] p-4">
              <h3 className="font-serif text-lg font-semibold">{diskussion.inputTitle}</h3>
              {diskussion.inputSubtitle && (
                <p className="font-serif text-[0.95rem] font-semibold text-[var(--muted)]">
                  {diskussion.inputSubtitle}
                </p>
              )}
              <p className="exam-text mt-2">{diskussion.inputText}</p>
            </div>
            <ul className="mt-4 space-y-2">
              {diskussion.bullets.map((bullet, index) => (
                <li key={index} className="flex gap-2.5 text-sm">
                  <span className="mt-0.5 flex-none text-[var(--accent)]">■</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-5 lg:sticky lg:top-4 lg:self-start">
          <section className="card p-4">
            <label className="label" htmlFor="notizen">
              Notizen für die Vorbereitung
            </label>
            <textarea
              id="notizen"
              className="textarea min-h-[45vh] font-serif leading-relaxed"
              lang="de"
              placeholder="Stichpunkte, Gliederung, Redemittel …"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
            <p className="mt-2 text-xs text-[var(--muted)]">
              In der Prüfung dürfen Sie sich Notizen machen, müssen aber frei sprechen.
            </p>
          </section>

          <Recorder />
        </div>
      </div>
    </div>
  );
}

/**
 * Eigene Aufnahme zur Selbstkontrolle. Die Datei bleibt im Browser und wird
 * nirgendwohin hochgeladen.
 */
function Recorder() {
  const [recording, setRecording] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
      recorder.current?.stream.getTracks().forEach((track) => track.stop());
    },
    [url],
  );

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const instance = new MediaRecorder(stream);
      chunks.current = [];
      instance.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.current.push(event.data);
      };
      instance.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunks.current, { type: instance.mimeType });
        setUrl((previous) => {
          if (previous) URL.revokeObjectURL(previous);
          return URL.createObjectURL(blob);
        });
      };
      instance.start();
      recorder.current = instance;
      setRecording(true);
    } catch {
      setError("Auf das Mikrofon konnte nicht zugegriffen werden.");
    }
  }

  function stop() {
    recorder.current?.stop();
    recorder.current = null;
    setRecording(false);
  }

  return (
    <section className="card no-print p-4">
      <h2 className="text-sm font-bold">Eigene Aufnahme</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Nur zur Selbstkontrolle. Die Aufnahme bleibt in diesem Browser und wird nicht hochgeladen.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className={recording ? "btn btn-danger" : "btn"}
          type="button"
          onClick={recording ? stop : start}
        >
          {recording ? "■ Aufnahme beenden" : "● Aufnahme starten"}
        </button>
        {url && (
          <a className="btn" href={url} download="sprechen-aufnahme.webm">
            Herunterladen
          </a>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-[var(--bad)]">{error}</p>}
      {url && <audio className="mt-3 w-full" controls src={url} />}
    </section>
  );
}
