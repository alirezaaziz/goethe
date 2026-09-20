import { z } from "zod";

/**
 * Validierung für JSON, das im Adminbereich eingefügt wird.
 * Die Fehlermeldungen landen direkt in der Oberfläche, deshalb sind sie deutsch.
 */

const optionRecord = (keys: string[]) =>
  z
    .record(z.string(), z.string().min(1))
    .refine(
      (o) => keys.every((k) => typeof o[k] === "string") && Object.keys(o).length === keys.length,
      { message: `Es werden genau die Optionen ${keys.join(", ")} erwartet.` },
    );

const examText = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  intro: z.string().optional(),
  paragraphs: z.array(z.string().min(1)).min(1),
});

const abcd = ["a", "b", "c", "d"];
const abc = ["a", "b", "c"];

const lesenPart1 = z.object({
  type: z.literal("mc-gap"),
  teil: z.literal(1),
  suggestedMinutes: z.number().int().positive(),
  instruction: z.string().min(1),
  text: examText,
  example: z.object({ options: optionRecord(abcd), answer: z.enum(abcd) }),
  items: z
    .array(
      z.object({
        id: z.number().int().positive(),
        options: optionRecord(abcd),
        answer: z.enum(abcd),
      }),
    )
    .length(8),
});

const lesenPart2 = z.object({
  type: z.literal("mc-questions"),
  teil: z.literal(2),
  suggestedMinutes: z.number().int().positive(),
  instruction: z.string().min(1),
  text: examText,
  items: z
    .array(
      z.object({
        id: z.number().int().positive(),
        question: z.string().min(1),
        options: optionRecord(abc),
        answer: z.enum(abc),
      }),
    )
    .length(7),
});

const bankKeys = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"] as const;

const lesenPart3 = z.object({
  type: z.literal("sentence-insert"),
  teil: z.literal(3),
  suggestedMinutes: z.number().int().positive(),
  instruction: z.string().min(1),
  text: examText,
  example: z.object({ sentence: z.string().min(1) }),
  bank: z
    .array(z.object({ key: z.enum(bankKeys), text: z.string().min(1) }))
    .length(10),
  items: z
    .array(z.object({ id: z.number().int().positive(), answer: z.enum(bankKeys) }))
    .length(8),
});

const lesenPart4 = z.object({
  type: z.literal("match-source"),
  teil: z.literal(4),
  suggestedMinutes: z.number().int().positive(),
  instruction: z.string().min(1),
  heading: z.string().min(1),
  subheading: z.string().optional(),
  sources: z
    .array(z.object({ key: z.enum(abc), name: z.string().min(1), text: z.string().min(1) }))
    .length(3),
  example: z.object({ statement: z.string().min(1), answer: z.enum([...abc, "0"]) }),
  items: z
    .array(
      z.object({
        id: z.number().int().positive(),
        statement: z.string().min(1),
        answer: z.enum([...abc, "0"]),
      }),
    )
    .length(7),
});

const schreibenTask = z.object({
  teil: z.union([z.literal(1), z.literal(2)]),
  suggestedMinutes: z.number().int().positive(),
  instruction: z.string().min(1),
  topicTitle: z.string().optional(),
  topicSubtitle: z.string().optional(),
  bullets: z.array(z.string().min(1)).length(4),
  wordCount: z.number().int().positive(),
  sampleAnswer: z.string().min(1),
});

const sprechenTopic = z.object({
  title: z.string().min(1),
  intro: z.string().min(1),
  extra: z.array(z.string().min(1)).optional(),
  bullets: z.array(z.string().min(1)).length(4),
});

export const examSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9][a-z0-9-]*$/, "Nur Kleinbuchstaben, Ziffern und Bindestriche."),
  title: z.string().min(1),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  lesen: z.object({
    durationMinutes: z.number().int().positive(),
    parts: z.tuple([lesenPart1, lesenPart2, lesenPart3, lesenPart4]),
  }),
  schreiben: z.object({
    durationMinutes: z.number().int().positive(),
    parts: z.tuple([schreibenTask, schreibenTask]),
  }),
  sprechen: z.object({
    preparationMinutes: z.number().int().positive(),
    parts: z.tuple([
      z.object({
        type: z.literal("vortrag"),
        teil: z.literal(1),
        instruction: z.string().min(1),
        durationMinutes: z.number().int().positive(),
        topics: z.array(sprechenTopic).length(2),
      }),
      z.object({
        type: z.literal("diskussion"),
        teil: z.literal(2),
        instruction: z.string().min(1),
        durationMinutes: z.number().int().positive(),
        inputTitle: z.string().min(1),
        inputSubtitle: z.string().optional(),
        inputText: z.string().min(1),
        bullets: z.array(z.string().min(1)).length(4),
      }),
    ]),
  }),
});

/** Prüft zusätzlich, dass jede Lücke im Text auch wirklich vorkommt. */
export function validateGaps(exam: z.infer<typeof examSchema>): string[] {
  const problems: string[] = [];
  for (const part of exam.lesen.parts) {
    if (part.type !== "mc-gap" && part.type !== "sentence-insert") continue;
    const body = part.text.paragraphs.join("\n");
    const expected = [0, ...part.items.map((i) => i.id)];
    for (const id of expected) {
      if (!body.includes(`[[${id}]]`)) {
        problems.push(`Lesen Teil ${part.teil}: Die Lücke [[${id}]] fehlt im Text.`);
      }
    }
  }
  return problems;
}

export type ParsedExam = z.infer<typeof examSchema>;
