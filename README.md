# Goethe-Zertifikat C1 – Prüfungstrainer

Eine Next.js-Anwendung, mit der sich Modellsätze für das **Goethe-Zertifikat C1 (modular)**
online bearbeiten lassen – in den Modulen **Lesen**, **Schreiben** und **Sprechen**.
Das Modul **Hören** ist bewusst nicht enthalten.

* **Zeitvorgabe wahlweise** – mit den offiziellen Prüfungszeiten (Lesen 65 Min., Schreiben 75 Min.,
  Sprechen circa 20 Min. plus 20 Min. Vorbereitung) oder ganz ohne Uhr.
* **Lesen** wird sofort ausgewertet: 30 Aufgaben, umgerechnet auf 100 Punkte, Bestehensgrenze 60.
  Die Lösungen liegen auf dem Server und werden erst nach der Abgabe ausgeliefert.
* **Schreiben** kann auf Knopfdruck von Claude oder ChatGPT nach den offiziellen
  Bewertungskriterien korrigiert werden – mit Note A–E je Kriterium, Punkten laut
  Bewertungsbogen und konkreten Sprachkorrekturen. Der API-Schlüssel gehört der Nutzerin
  bzw. dem Nutzer und bleibt im Browser.
* **Sprechen** bietet die Aufgabenblätter, eine Phasenuhr, ein Notizfeld und eine rein lokale
  Tonaufnahme zur Selbstkontrolle.
* **Adminbereich** zum Anlegen, Bearbeiten und Löschen von Modellsätzen als JSON – samt einem
  fertigen Prompt, mit dem eine KI einen neuen Modellsatz im gleichen Stil erzeugt.

---

## Schnellstart (lokal)

```bash
npm install
cp .env.example .env.local     # ADMIN_PASSWORD und ADMIN_SECRET eintragen
npm run seed                   # offiziellen Modellsatz einspielen
npm run dev                    # http://localhost:3000
```

Ohne `BLOB_READ_WRITE_TOKEN` landen die Daten in `.data/exams.json` – für die lokale Arbeit
ist also keinerlei Datenbank nötig.

Einen Wert für `ADMIN_SECRET` erzeugt man mit:

```bash
openssl rand -hex 32
```

---

## Auf Vercel veröffentlichen

1. **Repository anlegen und hochladen**

   ```bash
   git init && git add -A && git commit -m "Goethe C1 Prüfungstrainer"
   git remote add origin <URL des GitHub-Repositorys>
   git push -u origin main
   ```

2. **Projekt importieren** – auf [vercel.com/new](https://vercel.com/new) das Repository
   auswählen. Next.js wird automatisch erkannt, Einstellungen müssen nicht angepasst werden.

3. **Blob-Store verbinden** – im Vercel-Projekt unter **Storage → Create Database → Blob**
   einen Store anlegen und mit dem Projekt verbinden. Der kostenlose Plan reicht bei Weitem:
   alle Modellsätze zusammen liegen in einer einzigen JSON-Datei von wenigen hundert Kilobyte.

   > **Wichtig:** Umgebungsvariablen werden beim Deployment eingesetzt. Ein Store, der nach dem
   > letzten Deployment verbunden wurde, wirkt erst nach einem **Redeploy**
   > (Deployments → neuester Eintrag → Menü „⋯" → Redeploy). Bis dahin meldet der Adminbereich,
   > dass kein Blob-Token angekommen ist.
   >
   > Vercel legt normalerweise `BLOB_READ_WRITE_TOKEN` an. Wird beim Verbinden ein eigenes
   > Präfix vergeben, heißt die Variable zum Beispiel `GOETHE_BLOB_READ_WRITE_TOKEN`.
   > Wird der Store über OIDC angebunden, steht stattdessen nur `BLOB_STORE_ID` in der
   > Umgebung und das SDK holt sich das Token pro Anfrage selbst. Alle drei Fälle werden
   > erkannt; welcher greift, steht im Adminbereich oben unter „Speicherort".
   >
   > Ob der Store **privat** oder **öffentlich** konfiguriert ist, wird beim ersten Zugriff
   > automatisch ermittelt. Ein privater Store ist die bessere Wahl: Die gespeicherte Datei
   > enthält die Lösungen aller Leseaufgaben und sollte nicht unter einer öffentlich
   > abrufbaren URL liegen.

4. **Umgebungsvariablen setzen** – unter **Settings → Environment Variables**:

   | Variable | Wert |
   |---|---|
   | `ADMIN_PASSWORD` | frei wählbares Passwort für `/admin` |
   | `ADMIN_SECRET` | langer Zufallsstring, z. B. aus `openssl rand -hex 32` |

5. **Neu deployen**, damit die Variablen greifen.

6. **Ersten Modellsatz einspielen** – entweder lokal mit dem Token aus dem Vercel-Dashboard:

   ```bash
   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_…" npm run seed
   ```

   oder im Adminbereich der veröffentlichten Seite den Inhalt von
   `data/seed/c1-modellsatz-goethe.json` einfügen.

---

## Neuen Modellsatz erzeugen

1. `/admin` öffnen und anmelden.
2. Reiter **„Prompt für neue Modellsätze"**. Die Themen für alle neun Aufgabenteile werden
   dort **ausgelost** und im Prompt als verbindliche Vorgabe mitgegeben; die Auswahl steht
   sichtbar über dem Prompt. Gefällt sie nicht, genügt ein Klick auf **„Neue Themen auslosen"**.
   Eine eigene Themenvorgabe im Feld daneben schaltet das Auslosen ab.

   > Warum das Auslosen im Code passiert und nicht im Prompt: Ein gleichbleibender Prompt führt
   > bei Sprachmodellen verlässlich zu denselben naheliegenden Themen. Deshalb zieht der Server
   > die Themen aus `lib/topic-pools.ts` und schreibt sie in den Prompt. Aus demselben Grund
   > wird die gewählte Vorlage nur **vermessen** (Textlängen, Absatzzahlen, Machart der Items)
   > statt im Volltext mitgeschickt – ein vollständiger Beispielsatz im Kontext führt dazu, dass
   > Modelle ihn umformulieren, statt etwas Neues zu schreiben. Seine Themen stehen zusätzlich
   > auf einer Sperrliste.

3. **Prompt kopieren**.
4. Den Prompt in Claude, ChatGPT oder ein anderes Modell einfügen. Die Antwort ist ein
   JSON-Objekt mit allen Lesen-Lösungen und je einer Musterlösung für die beiden
   Schreibaufgaben.
5. Zurück im Reiter **„Modellsätze"** auf **„+ Modellsatz hinzufügen"**, das JSON einfügen,
   speichern. Vor dem Speichern wird geprüft:
   * Struktur und Datentypen aller Felder,
   * Aufgabenanzahl je Teil (8 / 7 / 8 / 7) und Nummerierung 1 bis 30,
   * genau zehn Sätze in der Satzbank von Teil 3,
   * dass jede Lücke `[[n]]` genau einmal im zugehörigen Text steht,
   * vier Inhaltspunkte je Schreib- und Sprechaufgabe.

   Fehler werden feldgenau auf Deutsch gemeldet.

---

## Datenformat

Ein Modellsatz ist ein JSON-Objekt mit den Schlüsseln `id`, `title`, `description`, `lesen`,
`schreiben` und `sprechen`. Die maßgebliche Beschreibung steht in [`lib/types.ts`](lib/types.ts),
die Validierung in [`lib/schema.ts`](lib/schema.ts), ein vollständiges Beispiel in
[`data/seed/c1-modellsatz-goethe.json`](data/seed/c1-modellsatz-goethe.json).

Lücken im Fließtext werden als `[[1]]`, `[[2]]` … notiert, die Beispielaufgabe als `[[0]]`.

### Aufgabentypen im Modul Lesen

| Teil | `type` | Aufgabe | Items |
|---|---|---|---|
| 1 | `mc-gap` | Lückentext mit Multiple-Choice, vier Optionen | 8 (1–8) |
| 2 | `mc-questions` | Multiple-Choice zum Text, drei Optionen | 7 (9–15) |
| 3 | `sentence-insert` | Sätze in Lücken einsetzen, zehn Sätze, zwei passen nicht | 8 (16–23) |
| 4 | `match-source` | Aussagen drei Fachleuten zuordnen, `0` = niemand | 7 (24–30) |

---

## Bewertung

**Lesen** – 30 Rohpunkte werden auf 100 Punkte hochgerechnet; bestanden ab 60.

**Schreiben** – Punkte je Kriterium und Note, genau wie im offiziellen Bewertungsbogen:

| Kriterium | Teil 1 (A/B/C/D/E) | Teil 2 (A/B/C/D/E) |
|---|---|---|
| Aufgabenerfüllung | 14 / 10,5 / 7 / 3,5 / 0 | 10 / 7,5 / 5 / 2,5 / 0 |
| Kohärenz | 14 / 10,5 / 7 / 3,5 / 0 | 10 / 7,5 / 5 / 2,5 / 0 |
| Wortschatz | 16 / 12 / 8 / 4 / 0 | 10 / 7,5 / 5 / 2,5 / 0 |
| Strukturen | 16 / 12 / 8 / 4 / 0 | 10 / 7,5 / 5 / 2,5 / 0 |
| **Summe** | **60** | **40** |

Wird die Aufgabenerfüllung mit **E** bewertet, ist die gesamte Aufgabe 0 Punkte wert – diese
Regel ist umgesetzt. Eine Aussage über das Bestehen erscheint nur, wenn beide Aufgaben
bewertet wurden.

Die maschinelle Korrektur ist eine Einschätzung und ersetzt keine Bewertung durch eine
lizenzierte Prüferin bzw. einen lizenzierten Prüfer.

---

## Umgang mit dem API-Schlüssel

Der Schlüssel wird ausschließlich im `localStorage` des Browsers abgelegt. Für eine Korrektur
geht er einmalig an die eigene Route `/api/grade` und von dort an Anthropic bzw. OpenAI.
Er wird serverseitig weder gespeichert noch protokolliert. Ein eigenes Gateway lässt sich über
die Umgebungsvariablen `ANTHROPIC_BASE_URL` bzw. `OPENAI_BASE_URL` vorschalten.

---

## Projektstruktur

```
app/
  page.tsx                     Übersicht der Modellsätze
  pruefung/[id]/               Modulauswahl und Zeitmodus
  pruefung/[id]/lesen|schreiben|sprechen/
  einstellungen/               API-Schlüssel und Modellwahl
  admin/                       Adminbereich
  api/exams/[id]/lesen         Auswertung der Leseaufgaben
  api/exams/[id]/loesungen     Lösungen und Leistungsbeispiele
  api/grade                    KI-Korrektur Schreiben
  api/admin/…                  Anmeldung, CRUD, Prompt
components/                    Prüfungsoberflächen, Uhr, Adminpanel
lib/
  types.ts schema.ts           Datenmodell und Validierung
  store.ts                     Vercel Blob mit Dateisystem-Fallback
  scoring.ts                   Punktetabellen und Auswertung
  grading/                     Prompt, Anthropic- und OpenAI-Anbindung
  generator-prompt.ts          Prompt für neue Modellsätze
  topic-pools.ts               Themenvorrat, aus dem ausgelost wird
data/seed/                     offizieller Modellsatz
```

---

## Hinweis

Dies ist kein Angebot des Goethe-Instituts. Der mitgelieferte Modellsatz stammt aus dem frei
veröffentlichten Übungsmaterial des Goethe-Instituts und dient allein der privaten Vorbereitung.
