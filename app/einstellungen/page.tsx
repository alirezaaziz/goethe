"use client";

import { useState } from "react";
import Link from "next/link";
import { useApiSettings, EMPTY_SETTINGS } from "@/lib/client/apiKey";
import { MODEL_CHOICES, DEFAULT_MODEL, type Provider } from "@/lib/providers";

export default function SettingsPage() {
  const [settings, setSettings, hydrated] = useApiSettings();
  const [visible, setVisible] = useState(false);

  function setProvider(provider: Provider) {
    setSettings((prev) => ({ ...prev, provider, model: DEFAULT_MODEL[provider] }));
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Einstellungen</h1>
      <p className="mt-2 text-[var(--muted)]">
        Für die Korrektur des Moduls Schreiben wird ein eigener API-Schlüssel benötigt. Alle anderen
        Funktionen des Trainers arbeiten ohne Schlüssel.
      </p>

      <section className="card mt-7 p-5">
        <h2 className="text-base font-bold">KI-Korrektur für das Modul Schreiben</h2>

        <div className="mt-4">
          <span className="label">Anbieter</span>
          <div className="flex flex-wrap gap-2">
            {(["anthropic", "openai"] as Provider[]).map((provider) => (
              <button
                key={provider}
                type="button"
                onClick={() => setProvider(provider)}
                className="rounded-lg border px-3.5 py-2 text-sm font-medium"
                style={
                  settings.provider === provider
                    ? {
                        background: "var(--accent)",
                        borderColor: "var(--accent)",
                        color: "var(--accent-text)",
                      }
                    : { background: "var(--surface)" }
                }
              >
                {provider === "anthropic" ? "Claude (Anthropic)" : "ChatGPT (OpenAI)"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="label" htmlFor="model">
            Modell
          </label>
          <select
            id="model"
            className="select"
            value={settings.model}
            onChange={(event) => setSettings((prev) => ({ ...prev, model: event.target.value }))}
          >
            {MODEL_CHOICES[settings.provider].map((choice) => (
              <option key={choice.id} value={choice.id}>
                {choice.label}
              </option>
            ))}
            {!MODEL_CHOICES[settings.provider].some((choice) => choice.id === settings.model) && (
              <option value={settings.model}>{settings.model} (eigene Angabe)</option>
            )}
          </select>
        </div>

        <div className="mt-4">
          <label className="label" htmlFor="apiKey">
            API-Schlüssel
          </label>
          <div className="flex gap-2">
            <input
              id="apiKey"
              className="input font-mono text-sm"
              type={visible ? "text" : "password"}
              autoComplete="off"
              spellCheck={false}
              placeholder={settings.provider === "anthropic" ? "sk-ant-…" : "sk-…"}
              value={hydrated ? settings.apiKey : ""}
              onChange={(event) =>
                setSettings((prev) => ({ ...prev, apiKey: event.target.value }))
              }
            />
            <button className="btn flex-none" type="button" onClick={() => setVisible((v) => !v)}>
              {visible ? "Verbergen" : "Anzeigen"}
            </button>
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Der Schlüssel wird nur im lokalen Speicher dieses Browsers abgelegt. Für eine Korrektur
            wird er einmalig an diese Anwendung und von dort an{" "}
            {settings.provider === "anthropic" ? "Anthropic" : "OpenAI"} übermittelt und danach
            verworfen – gespeichert oder protokolliert wird er nicht.
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Schlüssel erstellen:{" "}
            {settings.provider === "anthropic" ? (
              <a
                className="underline"
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noreferrer"
              >
                console.anthropic.com
              </a>
            ) : (
              <a
                className="underline"
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
              >
                platform.openai.com
              </a>
            )}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4">
          <button
            className="btn btn-danger"
            type="button"
            onClick={() => {
              if (confirm("Gespeicherten Schlüssel aus diesem Browser löschen?")) {
                setSettings(EMPTY_SETTINGS);
              }
            }}
          >
            Schlüssel löschen
          </button>
          <span className="text-xs text-[var(--muted)]">
            {hydrated && settings.apiKey
              ? `Gespeichert (endet auf …${settings.apiKey.slice(-4)})`
              : "Noch kein Schlüssel hinterlegt"}
          </span>
        </div>
      </section>

      <p className="mt-6 text-sm text-[var(--muted)]">
        Die Module Lesen und Sprechen brauchen keinen Schlüssel.{" "}
        <Link className="underline" href="/">
          Zurück zu den Modellsätzen
        </Link>
      </p>
    </div>
  );
}
