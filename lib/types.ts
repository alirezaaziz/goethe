/**
 * Datenmodell eines Modellsatzes (Goethe-Zertifikat C1, modular).
 * Abgebildet werden nur die Module Lesen, Schreiben und Sprechen.
 */

export type OptionKey = "a" | "b" | "c" | "d";

/** Teil 1: Lückentext mit Multiple-Choice (4-gliedrig), 8 Items. */
export interface LesenPart1 {
  type: "mc-gap";
  teil: 1;
  suggestedMinutes: number;
  /** Arbeitsanweisung, z. B. "Sie lesen in einer Zeitschrift einen Artikel …" */
  instruction: string;
  text: ExamText;
  /** Beispiel 0 – im Text als [[0]] markiert. */
  example: { options: Record<string, string>; answer: string };
  items: Array<{
    /** Nummer der Lücke, im Text als [[n]] markiert. */
    id: number;
    options: Record<string, string>;
    answer: string;
  }>;
}

/** Teil 2: Multiple-Choice (3-gliedrig) zu einem längeren Text, 7 Items. */
export interface LesenPart2 {
  type: "mc-questions";
  teil: 2;
  suggestedMinutes: number;
  instruction: string;
  text: ExamText;
  items: Array<{
    id: number;
    question: string;
    options: Record<string, string>;
    answer: string;
  }>;
}

/** Teil 3: Lückentext mit Zuordnung von Sätzen (a–j, zwei passen nicht), 8 Items. */
export interface LesenPart3 {
  type: "sentence-insert";
  teil: 3;
  suggestedMinutes: number;
  instruction: string;
  text: ExamText;
  /** Beispiel 0 – im Text als [[0]] markiert. */
  example: { sentence: string };
  /** Satzbank a–j. */
  bank: Array<{ key: string; text: string }>;
  items: Array<{ id: number; answer: string }>;
}

/** Teil 4: Zuordnung von Aussagen zu Personen (a–c oder 0 = niemand), 7 Items. */
export interface LesenPart4 {
  type: "match-source";
  teil: 4;
  suggestedMinutes: number;
  instruction: string;
  /** Überschrift über den Beiträgen, z. B. "Privatheit in Zeiten des Internets". */
  heading: string;
  subheading?: string;
  sources: Array<{ key: string; name: string; text: string }>;
  example: { statement: string; answer: string };
  items: Array<{ id: number; statement: string; answer: string }>;
}

export type LesenPart = LesenPart1 | LesenPart2 | LesenPart3 | LesenPart4;

export interface ExamText {
  title?: string;
  subtitle?: string;
  /** Vorspann/Teaser über dem eigentlichen Fließtext. */
  intro?: string;
  /** Absätze. Lücken werden als [[n]] notiert. */
  paragraphs: string[];
}

export interface LesenModule {
  durationMinutes: number;
  parts: LesenPart[];
}

export interface SchreibenTask {
  teil: 1 | 2;
  suggestedMinutes: number;
  /** Arbeitsanweisung bzw. Situationsbeschreibung. */
  instruction: string;
  /** Nur Teil 1: Titel und Untertitel des Forumsthemas. */
  topicTitle?: string;
  topicSubtitle?: string;
  bullets: string[];
  wordCount: number;
  /** Musterlösung auf C1-Niveau (nur für die Selbstkontrolle sichtbar). */
  sampleAnswer: string;
}

export interface SchreibenModule {
  durationMinutes: number;
  parts: SchreibenTask[];
}

export interface SprechenTopic {
  title: string;
  intro: string;
  /** Optionale Zusatzangaben im Kasten (Beispiele, Zahlen, Zitate). */
  extra?: string[];
  bullets: string[];
}

export interface SprechenPart1 {
  type: "vortrag";
  teil: 1;
  instruction: string;
  durationMinutes: number;
  /** Zwei Themen zur Auswahl. */
  topics: SprechenTopic[];
}

export interface SprechenPart2 {
  type: "diskussion";
  teil: 2;
  instruction: string;
  durationMinutes: number;
  inputTitle: string;
  inputSubtitle?: string;
  inputText: string;
  bullets: string[];
}

export interface SprechenModule {
  preparationMinutes: number;
  parts: [SprechenPart1, SprechenPart2];
}

export interface Exam {
  id: string;
  title: string;
  /** Kurzbeschreibung für die Übersicht. */
  description?: string;
  createdAt: string;
  updatedAt: string;
  lesen: LesenModule;
  schreiben: SchreibenModule;
  sprechen: SprechenModule;
}

/** Exam ohne Lösungen – das ist, was der Browser während der Prüfung bekommt. */
export type PublicExam = Exam;

export type ModuleName = "lesen" | "schreiben" | "sprechen";

export type Grade = "A" | "B" | "C" | "D" | "E";

export interface CriterionResult {
  grade: Grade;
  points: number;
  comment: string;
}

export interface SchreibenTaskFeedback {
  teil: 1 | 2;
  wordCount: number;
  erfuellung: CriterionResult;
  kohaerenz: CriterionResult;
  wortschatz: CriterionResult;
  strukturen: CriterionResult;
  points: number;
  maxPoints: number;
  /** Konkrete Korrekturen: falsche Stelle → Korrektur → Begründung. */
  corrections: Array<{ original: string; correction: string; reason: string }>;
  summary: string;
}

export interface SchreibenFeedback {
  tasks: SchreibenTaskFeedback[];
  totalPoints: number;
  /** Nur wenn beide Aufgaben bewertet wurden, ist eine Bestehensaussage möglich. */
  complete: boolean;
  passed: boolean;
  overall: string;
}
