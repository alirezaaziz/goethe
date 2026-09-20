"use client";

import { useStoredState } from "./storage";
import type { Provider } from "@/lib/providers";

export interface ApiSettings {
  provider: Provider;
  apiKey: string;
  model: string;
}

export const API_SETTINGS_KEY = "goethe:api-settings";

export const EMPTY_SETTINGS: ApiSettings = {
  provider: "anthropic",
  apiKey: "",
  model: "claude-opus-5",
};

/**
 * Der Schlüssel liegt ausschließlich im localStorage des Browsers und wird
 * nur für die Dauer einer Korrekturanfrage an den eigenen Server geschickt,
 * der ihn an den Anbieter weiterreicht und danach verwirft.
 */
export function useApiSettings() {
  return useStoredState<ApiSettings>(API_SETTINGS_KEY, EMPTY_SETTINGS);
}
