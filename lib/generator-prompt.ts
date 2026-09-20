import type { Exam } from "./types";

/**
 * Baut den Prompt, mit dem eine andere KI einen neuen Modellsatz im exakt
 * gleichen Stil erzeugt. Ein vorhandener Modellsatz wird vollständig als
 * Referenz mitgeschickt – das ist der Teil, der den Stil wirklich überträgt.
 */
export function buildGeneratorPrompt(reference: Exam | null, topicHint?: string): string {
  const referenceBlock = reference
    ? [
        "## REFERENZ-MODELLSATZ (Stilvorlage – Aufbau, Länge, Ton und Schwierigkeitsgrad exakt übernehmen)",
        "",
        "```json",
        JSON.stringify(stripMeta(reference), null, 2),
        "```",
      ].join("\n")
    : [
        "## REFERENZ-MODELLSATZ",
        "",
        "Es ist noch kein Referenz-Modellsatz vorhanden. Halte dich streng an die Formatbeschreibung oben.",
      ].join("\n");

  const hintBlock = topicHint?.trim()
    ? `\n## THEMENVORGABE\n\nVerwende möglichst diese Themen bzw. Themenrichtung: ${topicHint.trim()}\n`
    : "";

  return `# Auftrag: neuen Modellsatz für das Goethe-Zertifikat C1 (modular) erstellen

Du bist Testautorin bzw. Testautor beim Goethe-Institut und erstellst einen **vollständig neuen** Modellsatz für das Goethe-Zertifikat C1 (modular). Der Satz umfasst die Module **Lesen**, **Schreiben** und **Sprechen**. Das Modul Hören wird bewusst nicht erstellt.

Gib als Antwort **ausschließlich ein einziges gültiges JSON-Objekt** zurück – kein Markdown, keine Code-Fences, keine Erklärungen davor oder danach. Alle Texte sind auf Deutsch.

---

## 1. Verbindliche Vorgaben zum Prüfungsformat

### Modul LESEN – 65 Minuten, 30 Aufgaben (Nummern 1 bis 30 fortlaufend)

| Teil | Aufgabentyp | Textsorte | Items | Nummern | Arbeitszeit |
|---|---|---|---|---|---|
| 1 | Lückentext mit Multiple-Choice, 4-gliedrig | populärwissenschaftlicher, informativer Artikel | 8 | 1–8 | 10 Min. |
| 2 | Multiple-Choice, 3-gliedrig | Zeitschriftenartikel mit hohem Informationsgehalt | 7 | 9–15 | 20 Min. |
| 3 | Lückentext mit Zuordnung von Sätzen | Kommentar oder Reportage aus der Presse | 8 | 16–23 | 20 Min. |
| 4 | Zuordnung von Aussagen zu Personen | (populär-)wissenschaftliche Beiträge | 7 | 24–30 | 15 Min. |

**Teil 1** – Fließtext von circa 300–350 Wörtern mit neun Lücken: eine Beispiellücke \`[[0]]\` und die Lücken \`[[1]]\` bis \`[[8]]\`. Geprüft werden Grammatik und Lexik: Konnektoren, Präpositionen, Relativpronomen, Verweiswörter (\`daraus\`, \`somit\`, \`dazu\`), feste Wendungen und semantisch eng benachbarte Verben. Alle vier Optionen müssen grammatisch plausibel wirken; nur eine passt wirklich.

**Teil 2** – Ein Sachtext von circa 550–700 Wörtern in mehreren Absätzen. Dazu sieben Aufgaben (9–15), die der Reihenfolge des Textes folgen. Jede Aufgabe hat drei Optionen. Die Aufgabenstämme sind teils Satzanfänge, die fortgesetzt werden („Den Eltern wird empfohlen, …"), teils direkte Fragen. Die Distraktoren greifen Formulierungen aus dem Text auf, treffen aber die Aussage nicht.

**Teil 3** – Ein meinungsbetonter Kommentar von circa 500–600 Wörtern mit neun Satzlücken: die Beispiellücke \`[[0]]\` und \`[[16]]\` bis \`[[23]]\`. Die Satzbank enthält **genau zehn** Sätze mit den Schlüsseln \`a\` bis \`j\`; acht passen, **zwei sind Distraktoren**. Die Lücken stehen mitten im Absatz, nie am Absatzanfang; die Lösung ergibt sich aus dem Rück- und Vorwärtsbezug (Pronomen, Konnektoren, Wiederaufnahme).

**Teil 4** – Drei namentlich genannte Fachleute (\`a\`, \`b\`, \`c\`) mit je einem Beitrag von circa 180–220 Wörtern zum selben Oberthema, aber mit unterschiedlichen Schwerpunkten. Dazu ein Beispiel und sieben Aussagen (24–30). Lösung ist \`a\`, \`b\`, \`c\` oder \`"0"\`, wenn die Aussage zu niemandem passt. **Genau zwei** der sieben Aussagen müssen \`"0"\` sein. Die Aussagen paraphrasieren den Beitrag, sie zitieren ihn nicht.

### Modul SCHREIBEN – 75 Minuten, zwei Aufgaben

**Teil 1** (50 Min., circa 230 Wörter, 60 Punkte) – Diskussionsbeitrag für ein Internetforum zu einer kontroversen Frage aus Bildung, Beruf oder Gesellschaft. Vorgegeben sind ein Thementitel, eine Leitfrage und **genau vier** Inhaltspunkte, die vier verschiedene Sprachfunktionen verlangen, zum Beispiel: etwas erklären, anhand eines Beispiels argumentieren, Gründe nennen, eine Alternative erläutern.

**Teil 2** (25 Min., circa 120 Wörter, 40 Punkte) – (halb-)formelle Mitteilung, meist eine E-Mail oder ein Brief an eine konkrete Person aus dem beruflichen Umfeld. Die Situation wird in zwei bis drei Sätzen geschildert. **Genau vier** Inhaltspunkte mit vier verschiedenen Sprachfunktionen, zum Beispiel: höflich eröffnen und Verständnis zeigen, ein Problem beschreiben, Wünsche formulieren, einen Kompromiss vorschlagen.

Zu **jeder** der beiden Aufgaben schreibst du eine **Musterlösung auf sicherem C1-Niveau** in das Feld \`sampleAnswer\`. Die Musterlösung deckt alle vier Inhaltspunkte ab, trifft die geforderte Wortzahl (±10 %), ist klar gegliedert, verwendet ein breites und differenziertes Repertoire (Konnektoren wie *nichtsdestotrotz*, *gleichwohl*, *sofern*; Nominalisierungen; Passiversatzformen; Konjunktiv II) und wählt ein zur Situation passendes Register. Absätze trennst du mit \`\\n\\n\`. Teil 2 beginnt mit einer Anrede und endet mit einer Grußformel.

### Modul SPRECHEN – circa 20 Minuten, 20 Minuten Vorbereitungszeit

**Teil 1** (circa 7 Min.) – Kurzvortrag. **Zwei** Themen zur Auswahl, jedes mit Titel (als Frage formuliert), einem Einleitungstext von zwei bis vier Sätzen und **genau vier** Inhaltspunkten (Beispiel geben, dafür oder dagegen argumentieren, auf das Heimatland eingehen, einen Vorschlag machen oder mit einem Ausblick schließen). Optionale Stichpunkte im Kasten kommen in \`extra\`.

**Teil 2** (circa 5 Min.) – Diskussion zu zweit über eine kontroverse Frage. Vorgegeben sind ein kurzer Inputtext im Stil einer Meldung (mit einer konkreten Zahl oder einem Gesetzesbezug) und **genau vier** Inhaltspunkte.

---

## 2. JSON-Format

\`\`\`
{
  "id": "kleingeschriebene-id-mit-bindestrichen",
  "title": "Modellsatz …",
  "description": "ein Satz zur Einordnung",
  "lesen": {
    "durationMinutes": 65,
    "parts": [
      {
        "type": "mc-gap", "teil": 1, "suggestedMinutes": 10,
        "instruction": "Sie lesen … Wählen Sie für jede Lücke die richtige Lösung.",
        "text": { "title": "…", "subtitle": "…", "intro": "…", "paragraphs": ["… [[0]] … [[1]] …", "…"] },
        "example": { "options": { "a": "…", "b": "…", "c": "…", "d": "…" }, "answer": "d" },
        "items": [ { "id": 1, "options": { "a": "…", "b": "…", "c": "…", "d": "…" }, "answer": "b" } ]
      },
      {
        "type": "mc-questions", "teil": 2, "suggestedMinutes": 20,
        "instruction": "Sie lesen … Wählen Sie bei jeder Aufgabe die richtige Lösung.",
        "text": { "title": "…", "subtitle": "…", "paragraphs": ["…", "…"] },
        "items": [ { "id": 9, "question": "…", "options": { "a": "…", "b": "…", "c": "…" }, "answer": "a" } ]
      },
      {
        "type": "sentence-insert", "teil": 3, "suggestedMinutes": 20,
        "instruction": "Sie lesen … Welche Sätze passen in die Lücken? Zwei Sätze passen nicht.",
        "text": { "title": "…", "paragraphs": ["… [[0]] … [[16]] …", "…"] },
        "example": { "sentence": "…" },
        "bank": [ { "key": "a", "text": "…" }, … genau 10 Einträge a bis j … ],
        "items": [ { "id": 16, "answer": "e" }, … genau 8 Einträge 16 bis 23 … ]
      },
      {
        "type": "match-source", "teil": 4, "suggestedMinutes": 15,
        "instruction": "Sie lesen … Wählen Sie bei jeder Aussage: Wer äußert das? Zwei Aussagen passen nicht. Markieren Sie in diesem Fall 0.",
        "heading": "…", "subheading": "…",
        "sources": [ { "key": "a", "name": "Vorname Nachname, Funktion", "text": "…" }, … genau 3 … ],
        "example": { "statement": "…", "answer": "a" },
        "items": [ { "id": 24, "statement": "…", "answer": "c" }, … genau 7 Einträge 24 bis 30 … ]
      }
    ]
  },
  "schreiben": {
    "durationMinutes": 75,
    "parts": [
      { "teil": 1, "suggestedMinutes": 50, "instruction": "Für das Internetforum … verfassen Sie einen Diskussionsbeitrag zu diesem Thema:",
        "topicTitle": "…", "topicSubtitle": "…", "bullets": ["…","…","…","…"], "wordCount": 230, "sampleAnswer": "…" },
      { "teil": 2, "suggestedMinutes": 25, "instruction": "Situationsbeschreibung … Schreiben Sie eine … an …",
        "bullets": ["…","…","…","…"], "wordCount": 120, "sampleAnswer": "…" }
    ]
  },
  "sprechen": {
    "preparationMinutes": 20,
    "parts": [
      { "type": "vortrag", "teil": 1, "durationMinutes": 7,
        "instruction": "Sie nehmen an einem Seminar zu aktuellen Fragen teil und halten einen kurzen Vortrag …",
        "topics": [ { "title": "…?", "intro": "…", "extra": ["…"], "bullets": ["…","…","…","…"] }, { … zweites Thema … } ] },
      { "type": "diskussion", "teil": 2, "durationMinutes": 5,
        "instruction": "Sie diskutieren mit einer Kollegin/einem Kollegen über das Thema …",
        "inputTitle": "…", "inputSubtitle": "…", "inputText": "…", "bullets": ["…","…","…","…"] }
    ]
  }
}
\`\`\`

## 3. Harte Regeln – die Datei wird sonst abgelehnt

1. Reines JSON, keine Code-Fences, keine Kommentare, kein Text außerhalb des Objekts.
2. \`id\` besteht nur aus Kleinbuchstaben, Ziffern und Bindestrichen und unterscheidet sich vom Referenzsatz.
3. Die Aufgabennummern laufen lückenlos von 1 bis 30 und dürfen nicht doppelt vorkommen.
4. Jede Lücke \`[[n]]\` steht **genau einmal** im jeweiligen Text – inklusive \`[[0]]\` für das Beispiel. In Teil 2 und Teil 4 gibt es keine Lückenmarkierungen.
5. Teil 1 und Teil 3 haben 8 Items, Teil 2 und Teil 4 haben 7 Items. Teil 3 hat 10 Sätze in der Satzbank, Teil 4 genau 3 Beiträge.
6. Die Lösungsbuchstaben verteilen sich einigermaßen gleichmäßig; niemals drei gleiche Lösungen hintereinander.
7. In Teil 4 ist bei genau zwei Aussagen die Lösung \`"0"\`.
8. \`bullets\` hat überall genau vier Einträge.
9. Beide \`sampleAnswer\`-Felder sind ausgefüllt. Für Lesen sind die Lösungen über die \`answer\`-Felder vollständig vorhanden.
10. Alle Themen und Texte sind **neu erfunden** – übernimm aus dem Referenzsatz nur Aufbau, Ton, Länge und Schwierigkeitsgrad, niemals Inhalte.
11. Absatzumbrüche innerhalb eines Strings als \`\\n\\n\`; Anführungszeichen im Deutschen als „…".
12. Prüfe vor der Ausgabe jede Leseaufgabe noch einmal gegen den Text: Es darf nur genau eine Option richtig sein, und sie muss sich aus dem Text belegen lassen.
${hintBlock}
---

${referenceBlock}

---

Erstelle jetzt den neuen Modellsatz. Antworte mit dem JSON-Objekt und sonst nichts.`;
}

function stripMeta(exam: Exam) {
  const { createdAt: _c, updatedAt: _u, ...rest } = exam;
  return rest;
}
