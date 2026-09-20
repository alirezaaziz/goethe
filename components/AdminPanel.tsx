"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCopy } from "@/lib/client/storage";
import { readJson } from "@/lib/client/fetchJson";
import type { Exam } from "@/lib/types";

interface StorageInfo {
  backend: "blob" | "datei";
  onVercel: boolean;
  /** Name der Variablen, über die der Blob-Zugang gefunden wurde. */
  via: string | null;
  blobEnvNames: string[];
}

interface Props {
  initialExams: Exam[];
  storage: StorageInfo;
  /** Gesetzt, wenn der Speicher nicht gelesen werden konnte. */
  loadError: string | null;
}

type Tab = "saetze" | "prompt";

/** Gerüst für einen neuen Modellsatz – zeigt die erwartete Struktur. */
const TEMPLATE = `{
  "id": "modellsatz-02",
  "title": "Modellsatz 02",
  "description": "Kurze Einordnung",
  "lesen": { "durationMinutes": 65, "parts": [] },
  "schreiben": { "durationMinutes": 75, "parts": [] },
  "sprechen": { "preparationMinutes": 20, "parts": [] }
}`;

export default function AdminPanel({ initialExams, storage, loadError }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("saetze");
  const [exams, setExams] = useState(initialExams);

  useEffect(() => setExams(initialExams), [initialExams]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Adminbereich</h1>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Speicherort:{" "}
            {storage.backend === "blob"
              ? `Vercel Blob (über ${storage.via})`
              : "lokale Datei .data/exams.json"}{" "}
            · {exams.length === 1 ? "1 Modellsatz" : `${exams.length} Modellsätze`}
          </p>
        </div>
        <button
          className="btn"
          type="button"
          onClick={async () => {
            await fetch("/api/admin/session", { method: "DELETE" });
            router.refresh();
          }}
        >
          Abmelden
        </button>
      </header>

      {loadError && (
        <div className="mb-5 rounded-lg border border-[var(--bad)] bg-[var(--bad-soft)] p-4 text-sm text-[var(--bad)]">
          <p className="font-semibold">Der Speicher konnte nicht gelesen werden.</p>
          <p className="mt-1.5">{loadError}</p>
          <p className="mt-1.5">
            Solange das so ist, wird nichts gespeichert – damit der vorhandene Bestand nicht
            versehentlich überschrieben wird.
          </p>
        </div>
      )}

      {storage.onVercel && storage.backend === "datei" && (
        <div className="mb-5 rounded-lg border border-[var(--bad)] bg-[var(--bad-soft)] p-4 text-sm text-[var(--bad)]">
          <p className="font-semibold">Speichern ist derzeit nicht möglich.</p>
          <p className="mt-1.5">
            In dieser Bereitstellung ist kein Blob-Token angekommen. Ein im Dashboard verbundener
            Store wirkt erst, nachdem das Projekt neu deployt wurde: Vercel-Dashboard →
            Deployments → beim neuesten Eintrag über das Menü „Redeploy“ auswählen.
          </p>
          <p className="mt-1.5">
            Gefundene Blob-Variablen:{" "}
            <code className="font-mono">
              {storage.blobEnvNames.length > 0 ? storage.blobEnvNames.join(", ") : "keine"}
            </code>
          </p>
        </div>
      )}

      <nav className="mb-5 flex gap-1.5">
        {(
          [
            ["saetze", "Modellsätze"],
            ["prompt", "Prompt für neue Modellsätze"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className="rounded-lg border px-3.5 py-2 text-sm font-medium"
            style={
              tab === key
                ? { background: "var(--accent)", borderColor: "var(--accent)", color: "var(--accent-text)" }
                : { background: "var(--surface)" }
            }
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "saetze" ? (
        <ExamManager exams={exams} onChange={setExams} />
      ) : (
        <PromptTab exams={exams} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ExamManager({
  exams,
  onChange,
}: {
  exams: Exam[];
  onChange: (exams: Exam[]) => void;
}) {
  const router = useRouter();
  /** null = Liste, "" = neuer Satz, sonst die ID des bearbeiteten Satzes. */
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const res = await fetch("/api/admin/exams");
    if (res.ok) onChange((await readJson<{ exams: Exam[] }>(res)).exams);
    router.refresh();
  }, [onChange, router]);

  function startNew() {
    setEditing("");
    setDraft(TEMPLATE);
    setError(null);
    setIssues([]);
  }

  function startEdit(exam: Exam) {
    const { createdAt: _c, updatedAt: _u, ...rest } = exam;
    setEditing(exam.id);
    setDraft(JSON.stringify(rest, null, 2));
    setError(null);
    setIssues([]);
  }

  async function save() {
    setBusy(true);
    setError(null);
    setIssues([]);
    try {
      let payload: unknown;
      try {
        payload = JSON.parse(draft);
      } catch (err) {
        setError(`Das ist kein gültiges JSON: ${(err as Error).message}`);
        return;
      }

      const isNew = editing === "";
      const res = await fetch(isNew ? "/api/admin/exams" : `/api/admin/exams/${editing}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await readJson<{ error?: string; issues?: string[] }>(res);
      if (!res.ok) {
        setError(data.error ?? "Speichern fehlgeschlagen.");
        setIssues(data.issues ?? []);
        return;
      }
      setNotice(isNew ? "Modellsatz angelegt." : "Änderungen gespeichert.");
      setEditing(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(exam: Exam) {
    if (!confirm(`Modellsatz „${exam.title}“ endgültig löschen? Das lässt sich nicht rückgängig machen.`))
      return;
    try {
      const res = await fetch(`/api/admin/exams/${exam.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await readJson<{ error?: string }>(res);
        setError(data.error ?? "Löschen fehlgeschlagen.");
        return;
      }
      setNotice(`„${exam.title}“ wurde gelöscht.`);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Löschen fehlgeschlagen.");
    }
  }

  if (editing !== null) {
    return (
      <section className="card p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold">
            {editing === "" ? "Neuer Modellsatz" : `Bearbeiten: ${editing}`}
          </h2>
          <div className="flex gap-2">
            <button className="btn" type="button" onClick={() => setEditing(null)} disabled={busy}>
              Abbrechen
            </button>
            <button className="btn btn-primary" type="button" onClick={save} disabled={busy}>
              {busy ? "Wird gespeichert …" : "Speichern"}
            </button>
          </div>
        </div>

        <p className="mb-3 text-xs text-[var(--muted)]">
          Fügen Sie hier das JSON eines Modellsatzes ein. Vor dem Speichern wird geprüft, ob Aufbau,
          Aufgabenanzahl, Nummerierung von 1 bis 30 und alle Lückenmarkierungen stimmen.
        </p>

        {error && (
          <div className="mb-3 rounded-lg border border-[var(--bad)] bg-[var(--bad-soft)] p-3 text-sm text-[var(--bad)]">
            <p className="font-semibold">{error}</p>
            {issues.length > 0 && (
              <ul className="mt-2 list-disc space-y-0.5 pl-5 font-mono text-xs">
                {issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <textarea
          className="textarea min-h-[65vh] font-mono text-xs leading-relaxed"
          spellCheck={false}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
          <span>{draft.length.toLocaleString("de-DE")} Zeichen</span>
          <button
            className="underline"
            type="button"
            onClick={() => {
              try {
                setDraft(JSON.stringify(JSON.parse(draft), null, 2));
                setError(null);
              } catch (err) {
                setError(`Das ist kein gültiges JSON: ${(err as Error).message}`);
              }
            }}
          >
            JSON formatieren
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      {notice && (
        <p className="mb-4 rounded-lg border border-[var(--good)] bg-[var(--good-soft)] px-3 py-2 text-sm text-[var(--good)]">
          {notice}
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-lg border border-[var(--bad)] bg-[var(--bad-soft)] px-3 py-2 text-sm text-[var(--bad)]">
          {error}
        </p>
      )}

      <div className="mb-4 flex justify-end">
        <button className="btn btn-primary" type="button" onClick={startNew}>
          + Modellsatz hinzufügen
        </button>
      </div>

      {exams.length === 0 ? (
        <div className="card p-8 text-center text-sm text-[var(--muted)]">
          Noch kein Modellsatz vorhanden. Erzeugen Sie einen mit dem Prompt aus dem zweiten Reiter
          und fügen Sie das Ergebnis hier ein.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {exams.map((exam) => (
            <li key={exam.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold">{exam.title}</h3>
                  <p className="mt-0.5 font-mono text-xs text-[var(--muted)]">{exam.id}</p>
                  {exam.description && (
                    <p className="mt-1 text-sm text-[var(--muted)]">{exam.description}</p>
                  )}
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Lesen: {exam.lesen.parts.reduce((sum, part) => sum + part.items.length, 0)}{" "}
                    Aufgaben · Schreiben: {exam.schreiben.parts.length} Aufgaben · Sprechen:{" "}
                    {exam.sprechen.parts[0].topics.length} Vortragsthemen
                  </p>
                </div>
                <div className="flex flex-none flex-wrap gap-2">
                  <Link className="btn" href={`/pruefung/${exam.id}`}>
                    Ansehen
                  </Link>
                  <button className="btn" type="button" onClick={() => startEdit(exam)}>
                    Bearbeiten
                  </button>
                  <button className="btn btn-danger" type="button" onClick={() => remove(exam)}>
                    Löschen
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */

function PromptTab({ exams }: { exams: Exam[] }) {
  const [referenceId, setReferenceId] = useState(exams[0]?.id ?? "");
  const [hint, setHint] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const { copied, copy } = useCopy();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL("/api/admin/prompt", window.location.origin);
      if (referenceId) url.searchParams.set("referenz", referenceId);
      if (hint.trim()) url.searchParams.set("themen", hint.trim());
      const res = await fetch(url);
      const data = await readJson<{ prompt?: string; error?: string }>(res);
      setPrompt(data.prompt ?? data.error ?? "");
    } catch (err) {
      setPrompt(err instanceof Error ? err.message : "Der Prompt konnte nicht erzeugt werden.");
    } finally {
      setLoading(false);
    }
  }, [hint, referenceId]);

  useEffect(() => {
    void load();
    // Nur bei Wechsel der Referenz neu laden; die Themenvorgabe wird per Knopf übernommen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referenceId]);

  return (
    <section className="card p-5">
      <h2 className="text-base font-bold">Prompt für einen neuen Modellsatz</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Kopieren Sie diesen Prompt und geben Sie ihn einer KI Ihrer Wahl. Sie erhalten ein
        JSON-Objekt, das sich direkt im Reiter „Modellsätze“ einfügen lässt – einschließlich aller
        Lesen-Lösungen und der Leistungsbeispiele für das Modul Schreiben.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="referenz">
            Stilvorlage
          </label>
          <select
            id="referenz"
            className="select"
            value={referenceId}
            onChange={(event) => setReferenceId(event.target.value)}
          >
            <option value="">ohne Vorlage (nur Formatbeschreibung)</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Der gewählte Satz wird vollständig in den Prompt eingebettet. Das überträgt Aufbau, Ton
            und Schwierigkeitsgrad am zuverlässigsten.
          </p>
        </div>
        <div>
          <label className="label" htmlFor="themen">
            Themenvorgabe (optional)
          </label>
          <input
            id="themen"
            className="input"
            placeholder="z. B. Homeoffice, Städtebau, künstliche Intelligenz"
            value={hint}
            onChange={(event) => setHint(event.target.value)}
          />
          <button className="btn mt-2" type="button" onClick={load} disabled={loading}>
            {loading ? "Wird erzeugt …" : "Prompt aktualisieren"}
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-[var(--muted)]">
          {prompt.length.toLocaleString("de-DE")} Zeichen
          {referenceId && " (inklusive eingebetteter Stilvorlage)"}
        </span>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => copy(prompt)}
          disabled={!prompt}
        >
          {copied ? "✓ Kopiert" : "Prompt kopieren"}
        </button>
      </div>

      <textarea
        className="textarea mt-2 min-h-[50vh] font-mono text-xs leading-relaxed"
        readOnly
        spellCheck={false}
        value={prompt}
        onFocus={(event) => event.currentTarget.select()}
      />
    </section>
  );
}
