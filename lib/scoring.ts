import type { Exam, Grade } from "./types";

export const PASS_PERCENT = 60;

/** Punktwerte je Kriterium und Note – aus dem offiziellen Bewertungsbogen. */
export const SCHREIBEN_POINTS: Record<1 | 2, Record<string, Record<Grade, number>>> = {
  1: {
    erfuellung: { A: 14, B: 10.5, C: 7, D: 3.5, E: 0 },
    kohaerenz: { A: 14, B: 10.5, C: 7, D: 3.5, E: 0 },
    wortschatz: { A: 16, B: 12, C: 8, D: 4, E: 0 },
    strukturen: { A: 16, B: 12, C: 8, D: 4, E: 0 },
  },
  2: {
    erfuellung: { A: 10, B: 7.5, C: 5, D: 2.5, E: 0 },
    kohaerenz: { A: 10, B: 7.5, C: 5, D: 2.5, E: 0 },
    wortschatz: { A: 10, B: 7.5, C: 5, D: 2.5, E: 0 },
    strukturen: { A: 10, B: 7.5, C: 5, D: 2.5, E: 0 },
  },
};

export const SCHREIBEN_MAX: Record<1 | 2, number> = { 1: 60, 2: 40 };

export type LesenAnswers = Record<string, string>;

export interface LesenItemResult {
  id: number;
  teil: number;
  given: string | null;
  correct: string;
  isCorrect: boolean;
}

export interface LesenResult {
  items: LesenItemResult[];
  rawScore: number;
  maxRaw: number;
  points: number;
  passed: boolean;
  perTeil: Array<{ teil: number; correct: number; total: number }>;
}

/** Alle richtigen Lösungen eines Modellsatzes, nach Aufgabennummer. */
export function lesenSolutions(exam: Exam): Array<{ id: number; teil: number; answer: string }> {
  const out: Array<{ id: number; teil: number; answer: string }> = [];
  for (const part of exam.lesen.parts) {
    for (const item of part.items) {
      out.push({ id: item.id, teil: part.teil, answer: item.answer });
    }
  }
  return out.sort((a, b) => a.id - b.id);
}

export function scoreLesen(exam: Exam, answers: LesenAnswers): LesenResult {
  const solutions = lesenSolutions(exam);
  const items: LesenItemResult[] = solutions.map(({ id, teil, answer }) => {
    const given = answers[String(id)] ?? null;
    return { id, teil, given, correct: answer, isCorrect: given === answer };
  });

  const rawScore = items.filter((i) => i.isCorrect).length;
  const maxRaw = items.length;
  // 30 Rohpunkte werden auf 100 Punkte hochgerechnet (Bestehensgrenze 60).
  const points = maxRaw === 0 ? 0 : Math.round((rawScore / maxRaw) * 100);

  const perTeil = [1, 2, 3, 4].map((teil) => {
    const ofTeil = items.filter((i) => i.teil === teil);
    return { teil, correct: ofTeil.filter((i) => i.isCorrect).length, total: ofTeil.length };
  });

  return { items, rawScore, maxRaw, points, passed: points >= PASS_PERCENT, perTeil };
}

export function schreibenPoints(teil: 1 | 2, criterion: string, grade: Grade): number {
  return SCHREIBEN_POINTS[teil][criterion]?.[grade] ?? 0;
}

/**
 * Summe für eine Schreibaufgabe. Sonderregel aus dem Bewertungsbogen:
 * Wird die Aufgabenerfüllung mit E bewertet, ist die ganze Aufgabe 0 Punkte.
 */
export function schreibenTaskPoints(
  teil: 1 | 2,
  grades: { erfuellung: Grade; kohaerenz: Grade; wortschatz: Grade; strukturen: Grade },
): number {
  if (grades.erfuellung === "E") return 0;
  return (
    schreibenPoints(teil, "erfuellung", grades.erfuellung) +
    schreibenPoints(teil, "kohaerenz", grades.kohaerenz) +
    schreibenPoints(teil, "wortschatz", grades.wortschatz) +
    schreibenPoints(teil, "strukturen", grades.strukturen)
  );
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
