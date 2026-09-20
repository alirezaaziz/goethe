"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    // Privater Modus, gesperrter Speicher o. Ä. – dann eben ohne Persistenz.
    return fallback;
  }
}

/**
 * Wie useState, speichert den Wert aber zusätzlich im localStorage.
 * Beim ersten Render wird bewusst der Fallback benutzt, damit Server- und
 * Client-Markup identisch sind; der gespeicherte Wert kommt im Effekt nach.
 */
export function useStoredState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(read(key, fallback));
    setHydrated(true);
    // Nur bei Schlüsselwechsel neu laden.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Speicher nicht verfügbar – kein Grund, die Prüfung abzubrechen. */
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}

export function clearStored(...keys: string[]) {
  for (const key of keys) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignorieren */
    }
  }
}

/** Kopiert Text in die Zwischenablage und meldet zwei Sekunden lang Erfolg. */
export function useCopy() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }, []);

  return { copied, copy };
}
