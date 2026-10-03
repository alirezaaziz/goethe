import type { Exam, LesenPart } from "./types";
import {
  ABGENUTZTE_THEMEN,
  ADRESSAT_SCHREIBEN_2,
  ANLASS_SCHREIBEN_2,
  ASPEKTE,
  BEREICHE,
  FAKTOREN,
  WENDEPUNKTE,
  WIRKUNGEN,
  ZUGRIFF_LESEN_1,
  ZUGRIFF_LESEN_3,
  ZUGRIFF_LESEN_4,
  ZUGRIFF_SCHREIBEN_1,
  ZUGRIFF_SPRECHEN_1,
  ZUGRIFF_SPRECHEN_2,
} from "./topic-pools";

export interface GeneratorOptions {
  /** Eigene Themenvorgabe. Ersetzt die Zufallsauswahl vollständig. */
  topicHint?: string;
  /** Macht die Auswahl reproduzierbar. Ohne Angabe wird jedes Mal neu gewürfelt. */
  seed?: number;
  /** Alle vorhandenen Modellsätze – ihre Themen landen auf der Sperrliste. */
  existingExams?: Exam[];
}

export interface GeneratedPrompt {
  prompt: string;
  seed: number;
  /** Die gezogenen Themen – damit die Oberfläche zeigen kann, was verlangt wird. */
  themen: { label: string; thema: string }[];
}

/** Kleiner deterministischer Zufallsgenerator, damit ein Seed denselben Satz liefert. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Zieht `count` verschiedene Einträge aus einer Liste. */
function pick<T>(rand: () => number, pool: T[], count = 1, used = new Set<T>()): T[] {
  const gezogen: T[] = [];
  for (let n = 0; n < count; n++) {
    const frei = pool.filter((x) => !used.has(x) && !gezogen.includes(x));
    const auswahl = frei.length > 0 ? frei : pool.filter((x) => !gezogen.includes(x));
    const treffer = auswahl[Math.floor(rand() * auswahl.length)];
    gezogen.push(treffer);
    used.add(treffer);
  }
  return gezogen;
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function partWords(part: LesenPart): number {
  if (part.type === "match-source") {
    return Math.round(part.sources.reduce((sum, s) => sum + countWords(s.text), 0) / part.sources.length);
  }
  return countWords(part.text.paragraphs.join(" "));
}

/**
 * Statt den kompletten Referenzsatz mitzuschicken, wird nur sein *Maß* beschrieben:
 * Textlängen, Absatzzahlen und je ein winziges Beispiel für die Machart der Items.
 * Der vollständige Text als Kontext war der Grund, warum Modelle den Referenzsatz
 * umformuliert statt einen neuen erfunden haben.
 */
function buildStyleProfile(exam: Exam): string {
  const zeilen: string[] = [];

  for (const part of exam.lesen.parts) {
    const woerter = partWords(part);
    switch (part.type) {
      case "mc-gap": {
        const beispiel = part.items[0];
        zeilen.push(
          `- **Teil 1**: Fließtext mit ${woerter} Wörtern in ${part.text.paragraphs.length} Absätzen. ` +
            `Machart der Optionen (nur als Muster für den Schwierigkeitsgrad, Inhalt nicht übernehmen): ` +
            `${Object.values(beispiel.options).join(" / ")}.`,
        );
        break;
      }
      case "mc-questions": {
        const beispiel = part.items[0];
        zeilen.push(
          `- **Teil 2**: Sachtext mit ${woerter} Wörtern in ${part.text.paragraphs.length} Absätzen. ` +
            `Machart eines Aufgabenstamms: „${beispiel.question}" mit drei kurzen, ` +
            `nominal formulierten Optionen.`,
        );
        break;
      }
      case "sentence-insert": {
        const laengen = part.bank.map((b) => countWords(b.text));
        zeilen.push(
          `- **Teil 3**: Kommentar mit ${woerter} Wörtern in ${part.text.paragraphs.length} Absätzen. ` +
            `Die zehn Sätze der Satzbank sind ${Math.min(...laengen)} bis ${Math.max(...laengen)} Wörter lang ` +
            `und enthalten Rückverweise (Pronomen, „diese", „so", „denn"), über die sich die Lücke erschließt.`,
        );
        break;
      }
      case "match-source": {
        const aussagen = part.items.map((i) => countWords(i.statement));
        zeilen.push(
          `- **Teil 4**: drei Beiträge von je etwa ${woerter} Wörtern. ` +
            `Die Aussagen sind ${Math.min(...aussagen)} bis ${Math.max(...aussagen)} Wörter lang und ` +
            `formulieren den Inhalt vollständig um, ohne ein Wort wörtlich zu übernehmen.`,
        );
        break;
      }
    }
  }

  for (const task of exam.schreiben.parts) {
    zeilen.push(
      `- **Schreiben Teil ${task.teil}**: Aufgabenstellung in ${countWords(task.instruction)} Wörtern, ` +
        `vier Inhaltspunkte von je ${Math.min(...task.bullets.map(countWords))} bis ` +
        `${Math.max(...task.bullets.map(countWords))} Wörtern, Zieltext circa ${task.wordCount} Wörter.`,
    );
  }

  const [vortrag, diskussion] = exam.sprechen.parts;
  zeilen.push(
    `- **Sprechen Teil 1**: Einleitungstext je Thema circa ${countWords(vortrag.topics[0].intro)} Wörter.`,
    `- **Sprechen Teil 2**: Inputtext circa ${countWords(diskussion.inputText)} Wörter, ` +
      `im Ton einer knappen Meldung mit einer konkreten Zahl.`,
  );

  return zeilen.join("\n");
}

/** Themen aller vorhandenen Modellsätze – sie sind für den neuen Satz gesperrt. */
function buildBanList(exams: Exam[]): string[] {
  const gesperrt: string[] = [];
  for (const exam of exams) collectTopics(exam, gesperrt);
  return [...new Set(gesperrt.filter(Boolean))];
}

function collectTopics(exam: Exam, gesperrt: string[]) {
  for (const part of exam.lesen.parts) {
    if (part.type === "match-source") {
      if (part.subheading) gesperrt.push(part.subheading);
    } else if (part.text.title) {
      gesperrt.push(part.text.subtitle ? `${part.text.title} – ${part.text.subtitle}` : part.text.title);
    }
  }
  for (const task of exam.schreiben.parts) {
    if (task.topicTitle) gesperrt.push(task.topicTitle);
  }
  const [vortrag, diskussion] = exam.sprechen.parts;
  gesperrt.push(...vortrag.topics.map((t) => t.title), diskussion.inputTitle);
}

/**
 * Baut den Prompt, mit dem eine andere KI einen neuen Modellsatz erzeugt.
 *
 * Zwei Dinge sind hier entscheidend und waren in einer früheren Fassung falsch:
 * Erstens wird der Referenzsatz *nicht* im Volltext mitgeschickt, sondern nur
 * vermessen – sonst schreibt das Modell ihn um, statt etwas Neues zu erfinden.
 * Zweitens kommen die Themen aus dem Code und nicht aus dem Modell, denn ein
 * gleichbleibender Prompt führt sonst immer wieder zu denselben Themen.
 */
export function buildGeneratorPrompt(
  reference: Exam | null,
  options: GeneratorOptions = {},
): GeneratedPrompt {
  const alleSaetze = options.existingExams ?? (reference ? [reference] : []);
  const seed = options.seed ?? Math.floor(Math.random() * 1_000_000);
  const rand = mulberry32(seed);

  // Neun verschiedene Bereiche, damit ein Modellsatz thematisch breit wird.
  const [b1, b2, b3, b4, b5, b6, b7, b8, b9] = pick(rand, BEREICHE, 9);

  // Jede Frage entsteht aus mehreren Achsen. Eine einzelne Liste wäre nach
  // rund zwanzig Modellsätzen aufgebraucht; kombiniert reichen die Bausteine
  // für Zehntausende verschiedener Aufgabenstellungen.
  const aspekte = pick(rand, ASPEKTE, 6);

  const z1 = pick(rand, ZUGRIFF_LESEN_1)[0];
  const wendepunkt = pick(rand, WENDEPUNKTE)[0];
  const faktor = pick(rand, FAKTOREN)[0];
  const wirkung = pick(rand, WIRKUNGEN)[0];
  const z3 = pick(rand, ZUGRIFF_LESEN_3)[0];
  const z4 = pick(rand, ZUGRIFF_LESEN_4)[0];
  const z5 = pick(rand, ZUGRIFF_SCHREIBEN_1)[0];
  const anlass = pick(rand, ANLASS_SCHREIBEN_2)[0];
  const adressat = pick(rand, ADRESSAT_SCHREIBEN_2)[0];
  const [z7, z8] = pick(rand, ZUGRIFF_SPRECHEN_1, 2);
  const z9 = pick(rand, ZUGRIFF_SPRECHEN_2)[0];

  const themen = [
    { label: "Lesen Teil 1", thema: `${b1} – ${z1}, ${wendepunkt}` },
    { label: "Lesen Teil 2", thema: `${b2} – wie sich ${faktor} auf ${wirkung} auswirkt` },
    { label: "Lesen Teil 3", thema: `${b3} – ${z3} (Streitpunkt: ${aspekte[0]})` },
    { label: "Lesen Teil 4", thema: `${b4} – ${z4} (Streitpunkt: ${aspekte[1]})` },
    { label: "Schreiben Teil 1", thema: `${b5} – ${z5} (Streitpunkt: ${aspekte[2]})` },
    { label: "Schreiben Teil 2", thema: `${b6} – ${anlass}; Schreiben an ${adressat}` },
    { label: "Sprechen Thema 1", thema: `${b7} – ${z7} (Streitpunkt: ${aspekte[3]})` },
    { label: "Sprechen Thema 2", thema: `${b8} – ${z8} (Streitpunkt: ${aspekte[4]})` },
    { label: "Sprechen Diskussion", thema: `${b9} – ${z9} (Streitpunkt: ${aspekte[5]})` },
  ];

  const eigeneVorgabe = options.topicHint?.trim();

  const auftrag = eigeneVorgabe
    ? `Alle Texte und Aufgaben dieses Modellsatzes drehen sich um folgende Vorgabe: **${eigeneVorgabe}**

Wähle darin für jeden Prüfungsteil einen eigenen, deutlich unterschiedlichen Ausschnitt, damit sich die Teile nicht ähneln.`
    : `Für jeden Prüfungsteil sind zwei Dinge ausgelost: ein **Bereich** und ein **Zugriff**. Beide sind verbindlich. Das konkrete Thema erfindest **du** daraus – es steht absichtlich nicht hier.

| Prüfungsteil | Bereich | Zugriff |
|---|---|---|
| Lesen Teil 1 | ${b1} | ${z1}. Wendepunkt: ${wendepunkt} |
| Lesen Teil 2 | ${b2} | eine Untersuchung dazu, wie sich **${faktor}** auf **${wirkung}** auswirkt |
| Lesen Teil 3 | ${b3} | ${z3}. Streitpunkt: ${aspekte[0]} |
| Lesen Teil 4 | ${b4} | ${z4} Streitpunkt: ${aspekte[1]} |
| Schreiben Teil 1 | ${b5} | ${z5} Streitpunkt: ${aspekte[2]} |
| Schreiben Teil 2 | ${b6} | ${anlass}; die Mitteilung geht an ${adressat} |
| Sprechen Thema 1 | ${b7} | ${z7} Streitpunkt: ${aspekte[3]} |
| Sprechen Thema 2 | ${b8} | ${z8} Streitpunkt: ${aspekte[4]} |
| Sprechen Teil 2 | ${b9} | es wird über ${z9} gestritten; Streitpunkt: ${aspekte[5]} |

So gehst du vor: Nimm den Bereich, lege den Zugriff darauf und entwickle daraus eine **konkrete** Situation – mit erfundenen Namen, Orten, Einrichtungen und Zahlen. Keine realen Firmen, keine lebenden Personen.

Zwei Dinge sind dabei entscheidend:

- **Nimm nicht die erstbeste Idee.** Denk dir zu jedem Rahmen drei mögliche Themen aus und nimm das dritte – das naheliegendste ist fast immer das langweiligste und steht vermutlich schon in einem anderen Modellsatz.
- **Bleib im Bereich.** Wenn dort „${b1}" steht, spielt der Text in genau diesem Feld und nicht in einem verwandten, das dir vertrauter vorkommt.
- **Wenn ein Paar nicht zusammenpasst**, ist der Bereich bindend und der Zugriff verhandelbar: Verschiebe den Zugriff so weit, dass eine sinnvolle, prüfungstaugliche Frage entsteht – aber wechsle niemals den Bereich. Oft trägt eine Kombination weiter, als sie auf den ersten Blick wirkt; prüfe das erst, bevor du etwas änderst.`;

  const profil = reference
    ? `## 4. Maßvorlage aus einem bestehenden Modellsatz

Die folgenden Angaben beschreiben **ausschließlich Umfang und Machart**, nicht den Inhalt. Triff diese Maße möglichst genau:

${buildStyleProfile(reference)}`
    : "";

  const gesperrt = buildBanList(alleSaetze);
  const banBlock =
    gesperrt.length > 0
      ? `## 5. Gesperrte Inhalte

Diese Themen kommen in einem bereits vorhandenen Modellsatz vor. Sie dürfen **weder verwendet noch abgewandelt** werden – auch nicht mit anderer Branche, anderem Ort oder anderer Wortwahl:

${gesperrt.map((t) => `- ${t}`).join("\n")}

Wenn dir eine Idee einfällt, die einem dieser Punkte ähnelt, verwirf sie und wähle einen anderen Zugang.`
      : "";

  const klischeeBlock = `## ${gesperrt.length > 0 ? "5b" : "5"}. Abgenutzte Themen

Die folgenden Themen wählen Sprachmodelle fast immer, wenn man sie frei entscheiden lässt. Sie sind hier **gesperrt**, auch als Nebenaspekt eines Textes:

${ABGENUTZTE_THEMEN.map((t) => `- ${t}`).join("\n")}

Das heißt nicht, dass die Texte harmlos sein sollen – sie sollen nur nicht auf dieselben vier Schlagworte hinauslaufen.`;

  const prompt = `# Auftrag ${seed}: neuen Modellsatz für das Goethe-Zertifikat C1 (modular) erstellen

Du bist Testautorin bzw. Testautor beim Goethe-Institut. Erstelle einen **vollständig neuen** Modellsatz mit den Modulen **Lesen**, **Schreiben** und **Sprechen**. Das Modul Hören wird bewusst nicht erstellt.

Gib als Antwort **ausschließlich ein einziges gültiges JSON-Objekt** zurück – kein Markdown, keine Code-Fences, keine Erklärungen davor oder danach. Alle Texte sind auf Deutsch.

---

## 1. Die Themen dieses Modellsatzes

${auftrag}

Schreibe alle Texte selbst. Das heißt: eigene Fließtexte, eigene Argumente, eigene Studienergebnisse, eigene Zitate. Ein Text, der einem vorhandenen Modellsatz in Aufbau der Absätze, Abfolge der Argumente oder Wortwahl folgt, ist unbrauchbar – auch dann, wenn das Thema ein anderes ist.

---

## 2. Verbindliche Vorgaben zum Prüfungsformat

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

**Teil 1** (50 Min., circa 230 Wörter, 60 Punkte) – Diskussionsbeitrag für ein Internetforum. Vorgegeben sind ein Thementitel, eine Leitfrage und **genau vier** Inhaltspunkte, die vier verschiedene Sprachfunktionen verlangen, zum Beispiel: etwas erklären, anhand eines Beispiels argumentieren, Gründe nennen, eine Alternative erläutern.

**Teil 2** (25 Min., circa 120 Wörter, 40 Punkte) – (halb-)formelle Mitteilung an eine konkrete Person aus dem beruflichen Umfeld. Die Situation wird in zwei bis drei Sätzen geschildert. **Genau vier** Inhaltspunkte mit vier verschiedenen Sprachfunktionen, zum Beispiel: höflich eröffnen und Verständnis zeigen, ein Problem beschreiben, Wünsche formulieren, einen Kompromiss vorschlagen.

Zu **jeder** der beiden Aufgaben schreibst du eine **Musterlösung auf sicherem C1-Niveau** in das Feld \`sampleAnswer\`. Sie deckt alle vier Inhaltspunkte ab, trifft die geforderte Wortzahl (±10 %), ist klar gegliedert, verwendet ein breites Repertoire (Konnektoren wie *nichtsdestotrotz*, *gleichwohl*, *sofern*; Nominalisierungen; Passiversatzformen; Konjunktiv II) und wählt ein passendes Register. Absätze trennst du mit \`\\n\\n\`. Teil 2 beginnt mit einer Anrede und endet mit einer Grußformel.

### Modul SPRECHEN – circa 20 Minuten, 20 Minuten Vorbereitungszeit

**Teil 1** (circa 7 Min.) – Kurzvortrag. **Zwei** Themen zur Auswahl, jedes mit Titel (als Frage formuliert), einem Einleitungstext von zwei bis vier Sätzen und **genau vier** Inhaltspunkten. Optionale Stichpunkte im Kasten kommen in \`extra\`.

**Teil 2** (circa 5 Min.) – Diskussion zu zweit. Vorgegeben sind ein kurzer Inputtext im Stil einer Meldung (mit einer konkreten Zahl oder einem Gesetzesbezug) und **genau vier** Inhaltspunkte.

---

## 3. JSON-Format

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

${profil}

${banBlock}

${klischeeBlock}

## 6. Harte Regeln – die Datei wird sonst abgelehnt

1. Reines JSON, keine Code-Fences, keine Kommentare, kein Text außerhalb des Objekts.
2. \`id\` besteht nur aus Kleinbuchstaben, Ziffern und Bindestrichen und enthält die Zahl ${seed}.
3. Die Aufgabennummern laufen lückenlos von 1 bis 30 und dürfen nicht doppelt vorkommen.
4. Jede Lücke \`[[n]]\` steht **genau einmal** im jeweiligen Text – inklusive \`[[0]]\` für das Beispiel. In Teil 2 und Teil 4 gibt es keine Lückenmarkierungen.
5. Teil 1 und Teil 3 haben 8 Items, Teil 2 und Teil 4 haben 7 Items. Teil 3 hat 10 Sätze in der Satzbank, Teil 4 genau 3 Beiträge.
6. Die Lösungsbuchstaben verteilen sich einigermaßen gleichmäßig; niemals drei gleiche Lösungen hintereinander.
7. In Teil 4 ist bei genau zwei Aussagen die Lösung \`"0"\`.
8. \`bullets\` hat überall genau vier Einträge.
9. Beide \`sampleAnswer\`-Felder sind ausgefüllt. Für Lesen sind die Lösungen über die \`answer\`-Felder vollständig vorhanden.
10. Absatzumbrüche innerhalb eines Strings als \`\\n\\n\`; Anführungszeichen im Deutschen als „…".
11. Prüfe vor der Ausgabe jede Leseaufgabe noch einmal gegen den Text: Es darf nur genau eine Option richtig sein, und sie muss sich aus dem Text belegen lassen.
12. Halte dich an die vorgegebenen Themen aus Abschnitt 1. Ein Modellsatz mit selbst gewählten Themen ist unbrauchbar.

---

Erstelle jetzt den Modellsatz zu den Themen aus Abschnitt 1. Antworte mit dem JSON-Objekt und sonst nichts.`;

  return { prompt, seed, themen };
}
