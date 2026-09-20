import type { Exam } from "./types";

/**
 * Entfernt alles, was während der Bearbeitung nicht im Browser landen soll:
 * die Lösungen der Leseaufgaben und die Leistungsbeispiele zum Schreiben.
 * Die Beispielaufgaben (Nummer 0) behalten ihre Lösung, weil sie auch auf dem
 * Originalbogen sichtbar ist.
 */
export function sanitizeExam(exam: Exam): Exam {
  return {
    ...exam,
    lesen: {
      ...exam.lesen,
      parts: exam.lesen.parts.map((part) => ({
        ...part,
        items: part.items.map((item) => ({ ...item, answer: "" })),
      })) as Exam["lesen"]["parts"],
    },
    schreiben: {
      ...exam.schreiben,
      parts: exam.schreiben.parts.map((part) => ({ ...part, sampleAnswer: "" })) as Exam["schreiben"]["parts"],
    },
  };
}
