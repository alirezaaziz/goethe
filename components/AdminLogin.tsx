"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError(((await res.json()) as { error?: string }).error ?? "Anmeldung fehlgeschlagen.");
        return;
      }
      router.refresh();
    } catch {
      setError("Anmeldung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <form className="card p-6" onSubmit={submit}>
        <h1 className="text-xl font-bold">Adminbereich</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Hier lassen sich Modellsätze anlegen, bearbeiten und löschen.
        </p>
        <label className="label mt-5" htmlFor="password">
          Passwort
        </label>
        <input
          id="password"
          className="input"
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error && <p className="mt-2 text-sm text-[var(--bad)]">{error}</p>}
        <button className="btn btn-primary mt-4 w-full" type="submit" disabled={busy || !password}>
          {busy ? "Wird geprüft …" : "Anmelden"}
        </button>
      </form>
    </div>
  );
}
