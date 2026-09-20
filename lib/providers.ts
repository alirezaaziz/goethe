/**
 * Anbieter- und Modellauswahl. Bewusst frei von Server-Abhängigkeiten,
 * damit die Einstellungsseite nicht das Validierungsschema mitlädt.
 */

export type Provider = "anthropic" | "openai";

export const DEFAULT_MODEL: Record<Provider, string> = {
  anthropic: "claude-opus-5",
  openai: "gpt-5.2",
};

export const MODEL_CHOICES: Record<Provider, Array<{ id: string; label: string }>> = {
  anthropic: [
    { id: "claude-opus-5", label: "Claude Opus 5 (am genauesten)" },
    { id: "claude-sonnet-5", label: "Claude Sonnet 5 (günstiger)" },
    { id: "claude-haiku-4-5", label: "Claude Haiku 4.5 (am günstigsten)" },
  ],
  openai: [
    { id: "gpt-5.2", label: "GPT-5.2" },
    { id: "gpt-5.1", label: "GPT-5.1" },
    { id: "gpt-5-mini", label: "GPT-5 mini (günstiger)" },
  ],
};
