import { examSchema, validateGaps } from "./schema";
import type { Exam } from "./types";

/** Schema- und Konsistenzprüfung mit deutschen Meldungen. */
export function validateExam(payload: unknown):
  | { exam: Exam }
  | { error: string; issues: string[] } {
  const parsed = examSchema.safeParse(payload);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .slice(0, 25)
      .map((issue) => `${issue.path.join(".") || "(Wurzel)"}: ${germanMessage(issue)}`);
    return { error: "Das JSON passt nicht zum erwarteten Format.", issues };
  }

  const gapProblems = validateGaps(parsed.data);
  const ids = parsed.data.lesen.parts.flatMap((part) => part.items.map((item) => item.id));
  const expected = Array.from({ length: 30 }, (_, index) => index + 1);
  const numbering =
    ids.length === 30 && ids.every((id, index) => id === expected[index])
      ? []
      : [`Die Aufgabennummern müssen lückenlos von 1 bis 30 laufen. Gefunden: ${ids.join(", ")}`];

  const issues = [...gapProblems, ...numbering];
  if (issues.length > 0) {
    return { error: "Der Modellsatz ist in sich nicht schlüssig.", issues };
  }

  return { exam: parsed.data as Exam };
}

/** Die englischen Standardmeldungen von Zod ins Deutsche übersetzen. */
function germanMessage(issue: {
  code: string;
  message: string;
  expected?: unknown;
  values?: unknown[];
  minimum?: unknown;
  maximum?: unknown;
  exact?: boolean;
  origin?: unknown;
}): string {
  const unit = issue.origin === "array" ? "Einträge" : "Zeichen";

  switch (issue.code) {
    case "invalid_type":
      return issue.message.includes("received undefined")
        ? "Das Feld fehlt."
        : `Falscher Datentyp: erwartet wird ${String(issue.expected)}.`;
    case "too_small":
      return issue.exact
        ? `Es werden genau ${String(issue.minimum)} ${unit} erwartet, es sind zu wenige.`
        : `Zu wenige ${unit} (mindestens ${String(issue.minimum)}).`;
    case "too_big":
      return issue.exact
        ? `Es werden genau ${String(issue.maximum)} ${unit} erwartet, es sind zu viele.`
        : `Zu viele ${unit} (höchstens ${String(issue.maximum)}).`;
    case "invalid_value":
      return `Unzulässiger Wert. Erlaubt ist nur: ${(issue.values ?? []).map(String).join(", ")}.`;
    case "invalid_union":
      return "Der Wert passt zu keiner der erlaubten Varianten.";
    case "unrecognized_keys":
      return "Unbekanntes Feld.";
    default:
      return issue.message;
  }
}
