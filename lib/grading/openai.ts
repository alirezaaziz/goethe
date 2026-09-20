import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { SYSTEM_PROMPT, feedbackSchema, type RawFeedback } from "./shared";

/** Korrektur über die OpenAI Responses API mit dem Schlüssel der Nutzerin/des Nutzers. */
export async function gradeWithOpenAI(
  apiKey: string,
  model: string,
  userPrompt: string,
): Promise<RawFeedback> {
  const client = new OpenAI({ apiKey, maxRetries: 1 });

  const response = await client.responses.parse({
    model,
    instructions: SYSTEM_PROMPT,
    input: userPrompt,
    max_output_tokens: 16000,
    text: { format: zodTextFormat(feedbackSchema, "bewertung") },
  });

  if (!response.output_parsed) {
    throw new Error("Das Modell hat keine auswertbare Antwort geliefert.");
  }
  return response.output_parsed;
}
