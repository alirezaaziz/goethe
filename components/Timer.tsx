"use client";

import { useEffect, useRef, useState } from "react";

export type TimerMode = "timed" | "untimed";

interface Props {
  /** Schlüssel für den localStorage – pro Modellsatz und Modul eindeutig. */
  storageKey: string;
  mode: TimerMode;
  /** Offizielle Bearbeitungszeit des Moduls in Minuten. */
  minutes: number;
  /** Wird einmal aufgerufen, wenn die Zeit abgelaufen ist. */
  onExpire?: () => void;
  /** Angehalten, sobald abgegeben wurde. */
  frozen?: boolean;
}

function format(totalSeconds: number) {
  const sign = totalSeconds < 0 ? "-" : "";
  const s = Math.abs(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${sign}${h}:${mm}:${ss}` : `${sign}${mm}:${ss}`;
}

/**
 * Die Uhr läuft über einen gespeicherten Startzeitpunkt, nicht über einen
 * Zähler – ein Reload oder ein Tabwechsel verfälscht die Zeit damit nicht.
 */
export default function Timer({ storageKey, mode, minutes, onExpire, frozen }: Props) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const expired = useRef(false);

  useEffect(() => {
    let stored: number | null = null;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) stored = Number(raw);
    } catch {
      /* ignorieren */
    }
    const start = stored && Number.isFinite(stored) ? stored : Date.now();
    if (!stored) {
      try {
        window.localStorage.setItem(storageKey, String(start));
      } catch {
        /* ignorieren */
      }
    }
    setStartedAt(start);
  }, [storageKey]);

  useEffect(() => {
    if (frozen) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [frozen]);

  if (startedAt === null) {
    return <span className="chip font-mono tabular-nums">--:--</span>;
  }

  const elapsed = Math.floor((now - startedAt) / 1000);
  const remaining = minutes * 60 - elapsed;

  if (mode === "timed" && remaining <= 0 && !expired.current && !frozen) {
    expired.current = true;
    // Nach dem Render aufrufen, damit kein Zustand während des Renderns gesetzt wird.
    queueMicrotask(() => onExpire?.());
  }

  const value = mode === "timed" ? remaining : elapsed;
  const critical = mode === "timed" && remaining <= 300;
  const warning = mode === "timed" && remaining <= 600 && !critical;

  return (
    <span
      className="chip font-mono tabular-nums"
      style={
        critical
          ? { background: "var(--bad-soft)", borderColor: "var(--bad)", color: "var(--bad)" }
          : warning
            ? { background: "var(--warn-soft)", borderColor: "var(--warn)", color: "var(--warn)" }
            : undefined
      }
      title={
        mode === "timed"
          ? `Verbleibende Zeit von ${minutes} Minuten`
          : "Verstrichene Zeit (ohne Zeitbegrenzung)"
      }
    >
      {mode === "timed" ? "⏳" : "⏱"} {format(value)}
      {mode === "untimed" && (
        <span className="font-sans text-[0.7rem] opacity-70">/ {minutes} Min.</span>
      )}
    </span>
  );
}
