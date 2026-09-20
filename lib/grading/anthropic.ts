import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { SYSTEM_PROMPT, feedbackSchema, type RawFeedback } from "./shared";

/** Korrektur über die Anthropic Messages API mit dem Schlüssel der Nutzerin/des Nutzers. */
export async function gradeWithAnthropic(
  apiKey: string,
  model: string,
  userPrompt: string,
): Promise<RawFeedback> {
  const client = new Anthropic({ apiKey, maxRetries: 1 });

  const response = await client.messages.parse({
    model,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
    output_config: { format: zodOutputFormat(feedbackSchema) },
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Das Modell hat die Bewertung abgelehnt. Bitte den Text prüfen.");
  }
  if (!response.parsed_output) {
    throw new Error("Das Modell hat keine auswertbare Antwort geliefert.");
  }
  return response.parsed_output;
}
