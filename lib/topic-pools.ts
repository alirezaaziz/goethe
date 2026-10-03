/**
 * Bausteine für die Themenauslosung.
 *
 * Warum nicht einfach eine Liste fertiger Themen? Weil jede feste Liste ein
 * geschlossener Vorrat ist: Nach zwanzig Modellsätzen wiederholt sie sich.
 * Stattdessen werden zwei Achsen gezogen – ein **Bereich** (worum geht es) und
 * ein **Zugriff** (was ist daran interessant). Die konkrete Idee erfindet das
 * Sprachmodell daraus selbst. Aus 60 Bereichen und gut 20 Zugriffen je
 * Aufgabentyp entstehen über tausend Rahmen pro Prüfungsteil, und innerhalb
 * jedes Rahmens ist die Ausgestaltung offen.
 *
 * Die Zufälligkeit muss aus dem Code kommen: Ein gleichbleibender Prompt führt
 * bei Sprachmodellen verlässlich zu denselben naheliegenden Themen.
 */

/**
 * Fachliche Sachgebiete. Bewusst konkret und wenig abgegriffen.
 *
 * Nur für das Modul Lesen und für Schreiben Teil 2 – also dort, wo der Text
 * oder die Situation mitgeliefert wird. Für Aufgaben, bei denen Prüflinge aus
 * eigenem Wissen sprechen oder argumentieren müssen, siehe ALLTAGSBEREICHE.
 */
export const BEREICHE: string[] = [
  "Instrumentenbau",
  "Uhrmacherei",
  "Buchbinderei",
  "Glasherstellung",
  "Keramik und Töpferei",
  "Textilherstellung",
  "Schneiderhandwerk",
  "Schmiedehandwerk",
  "Tischlerei",
  "Restaurierung und Denkmalpflege",
  "Druckerei und Satz",
  "Verlagswesen",
  "Bibliothekswesen",
  "Archivwesen",
  "Museumsarbeit",
  "Theater und Bühnentechnik",
  "Filmproduktion",
  "Musikleben",
  "Fotografie",
  "Grafik und Gestaltung",
  "Journalismus",
  "Rundfunk",
  "Bäckerei und Müllerei",
  "Käserei und Molkerei",
  "Obst- und Gemüsebau",
  "Weinbau",
  "Imkerei",
  "Fischerei und Teichwirtschaft",
  "Viehhaltung",
  "Forstwirtschaft",
  "Gartenbau und Landschaftspflege",
  "Naturschutz",
  "Meteorologie",
  "Geologie",
  "Archäologie",
  "Vermessung und Kartografie",
  "Astronomie",
  "Tiermedizin",
  "Pflege und Betreuung",
  "Physiotherapie",
  "Apothekenwesen",
  "Rettungsdienst",
  "Feuerwehr",
  "Wasserwirtschaft",
  "Abfallwirtschaft und Recycling",
  "Energieversorgung",
  "Bauwesen",
  "Architektur",
  "Stadtplanung",
  "Wohnungswirtschaft",
  "Schienenverkehr",
  "Binnenschifffahrt",
  "Nahverkehr",
  "Logistik und Zustellung",
  "Maschinenbau",
  "Elektronik und Reparatur",
  "Metallverarbeitung",
  "Schulwesen",
  "Berufsausbildung",
  "Erwachsenenbildung",
  "Sprachunterricht",
  "Hochschulbetrieb",
  "Sozialarbeit",
  "Kinderbetreuung",
  "Altenhilfe",
  "Vereinswesen",
  "Ehrenamt und Nachbarschaftshilfe",
  "Rechtsberatung",
  "öffentliche Verwaltung",
  "Verbraucherschutz",
  "Arbeitsschutz",
  "Statistik und Demografie",
  "Einzelhandel",
  "Wochenmärkte",
  "Gastronomie",
  "Beherbergung",
  "Tourismus",
  "Breitensport",
  "Spielzeug- und Spieleherstellung",
  "Papierherstellung",
  "Kosmetik- und Seifenherstellung",
  "Bestattungswesen",
  "Friedhofs- und Grünflächenpflege",
];

/**
 * Lesen Teil 1 – Porträt einer Organisation. Der Zugriff beschreibt, was an
 * ihr bemerkenswert ist; das konkrete Unternehmen erfindet das Modell.
 */
export const ZUGRIFF_LESEN_1: string[] = [
  "ein Betrieb, der eine fast ausgestorbene Arbeitsweise wiederbelebt hat",
  "ein Zusammenschluss, der gemeinsam Geräte anschafft, die für Einzelne unbezahlbar wären",
  "eine Einrichtung, die ihre Kundschaft an Entscheidungen beteiligt",
  "ein Unternehmen, das seine Fachkräfte selbst ausbildet, weil es keine findet",
  "ein Betrieb, der an einem ungewöhnlichen Ort arbeitet",
  "eine Initiative, die ein leerstehendes Gebäude neu nutzt",
  "ein Betrieb, der ausschließlich auf Bestellung und mit langen Wartezeiten fertigt",
  "eine Einrichtung, die ihr gesamtes Wissen öffentlich dokumentiert",
  "ein Betrieb, der nur wenige Monate im Jahr arbeitet",
  "ein Unternehmen, das bewusst klein bleibt und Wachstum ablehnt",
  "eine Organisation, die eng mit einer Hochschule zusammenarbeitet",
  "ein Betrieb, der aus einem Nebenprodukt sein Hauptgeschäft gemacht hat",
  "eine Einrichtung, die der Abwanderung aus einer ländlichen Region entgegenwirkt",
  "ein Betrieb, der seine Werkstatt stundenweise für Fremde öffnet",
  "ein Unternehmen, das seinen Beschäftigten gehört",
  "ein Betrieb, der seinen Rohstoff aus Abfällen gewinnt",
  "eine Organisation ohne festen Sitz, die mobil zu den Menschen fährt",
  "ein Betrieb, der gezielt Menschen ohne formale Qualifikation einstellt",
  "eine Einrichtung, die ihre Kalkulation vollständig offenlegt",
  "ein Betrieb, der zwei Generationen gemeinsam arbeiten lässt",
  "ein Unternehmen, das sein Verfahren bewusst nicht schützen lässt",
  "eine Einrichtung, die im Ausland begonnen hat und zurückgekehrt ist",
  "ein Betrieb, der eine Aufgabe übernimmt, die vorher die Gemeinde erledigt hat",
  "ein Zusammenschluss, der einen aufgegebenen Betrieb übernommen hat",
  "eine Organisation, die ihre Arbeit vollständig über Spenden ihrer Nutzenden trägt",
];

/**
 * Allgemein zugängliche Themenfelder.
 *
 * Für Sprechen (beide Teile) und Schreiben Teil 1: Dort gibt es keinen
 * Inputtext, aus dem sich Inhalte ziehen ließen – die Prüflinge müssen aus
 * eigener Erfahrung argumentieren. Ein Fachgebiet wie Teichwirtschaft wäre
 * hier unfair, weil es Vorwissen voraussetzt, das mit Sprachkompetenz nichts
 * zu tun hat.
 */
export const ALLTAGSBEREICHE: string[] = [
  "Schule und Unterricht",
  "Prüfungen und Noten",
  "Berufsausbildung",
  "Studium",
  "Weiterbildung im Erwachsenenalter",
  "Fremdsprachen lernen",
  "Bewerbung und Berufseinstieg",
  "Arbeitszeit und Urlaub",
  "Ehrenamt",
  "Vereinsleben",
  "Nachbarschaft",
  "Wohnungssuche und Miete",
  "Zusammenleben in der Stadt",
  "Leben auf dem Land",
  "Nahverkehr",
  "Radverkehr",
  "Führerschein und Autofahren",
  "Reisen und Urlaub",
  "Museen und Ausstellungen",
  "Theater und Konzerte",
  "Bibliotheken",
  "Lesen und Bücher",
  "Musik im Alltag",
  "Sport und Bewegung",
  "Vereinssport für Kinder",
  "Ernährung und Kochen",
  "Essen außer Haus",
  "Wochenmärkte und Einkaufen",
  "Reparieren statt Wegwerfen",
  "Werbung im Alltag",
  "Haustiere",
  "Gärten und Parks",
  "Müll und Wertstoffe",
  "Wasserverbrauch im Haushalt",
  "Lärm in Wohngebieten",
  "Feste und Feiertage",
  "Sonntagsruhe",
  "Gesundheitsvorsorge",
  "Arztbesuche und Wartezeiten",
  "Pflege älterer Angehöriger",
  "Kinderbetreuung",
  "Familienalltag",
  "Umgang mit Geld und Sparen",
  "Behördengänge",
  "Nachbarschaftshilfe",
  "Wohnen im Alter",
  "Freiwilligendienste",
  "Umgang mit Fehlern im Beruf",
];

/**
 * Lesen Teil 2 – Sachtext über eine Untersuchung.
 *
 * Eine Studienfrage zerfällt sauber in „was wirkt" und „worauf wirkt es".
 * Als zwei Achsen ergeben sich daraus über 900 Fragestellungen statt der
 * gut zwanzig, die eine fertige Liste hergäbe.
 */
export const FAKTOREN: string[] = [
  "ständige Unterbrechungen",
  "anhaltender Zeitdruck",
  "eine Belohnung für etwas, das vorher freiwillig geschah",
  "der Wegfall einer festen Routine",
  "die Zusammensetzung einer Gruppe",
  "die Entfernung zwischen Wohnort und Tätigkeit",
  "frühe Erfahrungen in der Kindheit",
  "das Vorbild der Eltern",
  "die Anzahl der Wahlmöglichkeiten",
  "Geräusche im Hintergrund",
  "die Tageszeit, zu der gearbeitet wird",
  "die Größe und Höhe des Raums",
  "der Anteil an Tageslicht",
  "unbezahlte Wartezeiten",
  "wiederkehrende Rituale",
  "ein häufiger Wechsel der Bezugsperson",
  "Lob vor anderen",
  "die Anwesenheit fremder Beobachtender",
  "schriftliche statt mündlicher Absprachen",
  "die Dauer der Einarbeitung",
  "regelmäßige kurze Pausen",
  "die Reihenfolge, in der Aufgaben bearbeitet werden",
  "eine eindeutig geregelte Zuständigkeit",
  "gemeinsame Mahlzeiten",
  "Bewegung während der Arbeit",
  "der Verzicht auf ein gewohntes Hilfsmittel",
  "das Gefühl, beobachtet zu werden",
  "kurzfristige Planänderungen",
  "die Möglichkeit, Fehler folgenlos zu melden",
  "das Einholen einer zweiten Meinung",
  "ein Wechsel des Wohnorts",
  "die Erwartung, jederzeit erreichbar zu sein",
];

export const WIRKUNGEN: string[] = [
  "die Konzentrationsfähigkeit",
  "die Hilfsbereitschaft",
  "das Erinnerungsvermögen",
  "die Zufriedenheit mit der eigenen Arbeit",
  "das Durchhaltevermögen",
  "die Risikobereitschaft",
  "die Sorgfalt bei Routineaufgaben",
  "die Bereitschaft, Wissen weiterzugeben",
  "das Zeitgefühl",
  "die Qualität von Entscheidungen",
  "die Zahl vermeidbarer Fehler",
  "die Sprachentwicklung",
  "das Vertrauen untereinander",
  "die Bereitschaft zur Weiterbildung",
  "die körperliche Erschöpfung am Abend",
  "die Verbundenheit mit dem Betrieb",
  "die Genauigkeit von Schätzungen",
  "die Bereitschaft, um Hilfe zu bitten",
  "den Einfallsreichtum bei Problemen",
  "das Sicherheitsempfinden",
  "die Fähigkeit, sich räumlich zu orientieren",
  "die Freude an der Tätigkeit selbst",
  "die Bereitschaft, Verantwortung zu übernehmen",
  "das Durchsetzungsvermögen",
  "die Geduld im Umgang mit anderen",
  "die Bereitschaft, Neues auszuprobieren",
  "die Einschätzung der eigenen Fähigkeiten",
  "die Weitergabe von Erfahrungswissen",
  "die Verweildauer im Beruf",
  "die Bereitschaft, Kritik zu äußern",
];

/** Lesen Teil 3 – meinungsbetonter Kommentar. */
export const ZUGRIFF_LESEN_3: string[] = [
  "etwas Bewährtes verschwindet, ohne dass es jemand entschieden hätte",
  "eine Maßnahme bewirkt genau das Gegenteil dessen, was beabsichtigt war",
  "eine Zuständigkeit wird zwischen mehreren Stellen hin- und hergeschoben",
  "eine Entwicklung wird gefeiert, deren Kosten erst Jahre später sichtbar werden",
  "eine Tätigkeit verliert an Ansehen, obwohl sie gebraucht wird wie nie",
  "der Nachwuchs bleibt aus, und niemand fragt nach den Gründen",
  "ein Beruf erstickt an Nachweispflichten statt an der eigentlichen Arbeit",
  "etwas wird abgeschafft, weil es sich nicht beziffern lässt",
  "aus einem Angebot ist unbemerkt eine Pflicht geworden",
  "eine Lösung wird gesucht, obwohl das Problem gar nicht verstanden ist",
  "ein Mangel wird verwaltet, statt ihn zu beheben",
  "die Verantwortung wird auf Einzelne abgewälzt, obwohl sie strukturell ist",
  "eine Fähigkeit geht verloren, weil niemand sie mehr weitergibt",
  "zwei Generationen reden über dasselbe Problem völlig aneinander vorbei",
  "Geschwindigkeit wird mit Fortschritt verwechselt",
  "eine Entscheidung wird immer weiter aufgeschoben, und das Aufschieben ist die Entscheidung",
  "ein Ehrenamt ersetzt stillschweigend eine bezahlte Stelle",
  "eine Ausnahme ist zur Regel geworden, ohne dass die Regel geändert wurde",
  "der Erhalt wäre billiger als der Neubau, und trotzdem wird neu gebaut",
  "eine Statistik wird verbessert, nicht die Lage",
  "ein gemeinsames Gut wird einzeln genutzt und gemeinsam aufgebraucht",
  "etwas wird im Namen der Sicherheit eingeschränkt, ohne dass Sicherheit entsteht",
];

/** Lesen Teil 4 – Streitfrage, zu der sich drei Fachleute äußern. */
export const ZUGRIFF_LESEN_4: string[] = [
  "Wem gehört etwas, das alle brauchen?",
  "Wer trägt die Kosten einer Entscheidung, die anderen nützt?",
  "Wie weit darf Kontrolle gehen, wenn sie Sicherheit verspricht?",
  "Soll dieser Bereich dem Markt überlassen werden?",
  "Wer darf mitentscheiden, wenn alle betroffen sind?",
  "Was schulden wir denen, die nach uns kommen?",
  "Soll der Staat eingreifen oder sich heraushalten?",
  "Wie viel Ungleichheit ist hier hinnehmbar?",
  "Wer haftet, wenn niemand den Schaden verursacht hat?",
  "Darf man zu etwas verpflichten, das vernünftig ist?",
  "Woran soll der Erfolg in diesem Bereich gemessen werden?",
  "Soll Wissen hier frei zugänglich sein?",
  "Wie viel Aufwand ist Erhaltung wert?",
  "Wer entscheidet, was bewahrt und was aufgegeben wird?",
  "Soll Leistung oder Bedarf den Zugang bestimmen?",
  "Wie viel Eigenverantwortung darf vorausgesetzt werden?",
  "Braucht dieser Bereich mehr Regeln oder weniger?",
  "Wie geht man mit Wissen um, dessen Herkunft fragwürdig ist?",
  "Soll kurzfristiger Nutzen hinter langfristiger Sicherheit zurückstehen?",
  "Wer spricht für diejenigen, die sich nicht äußern können?",
  "Ist Zentralisierung hier ein Gewinn oder ein Verlust?",
  "Was darf Forschung in diesem Bereich?",
];

/** Schreiben Teil 1 – kontroverse Frage für einen Forumsbeitrag. */
export const ZUGRIFF_SCHREIBEN_1: string[] = [
  "Lohnt sich das in diesem Bereich überhaupt noch?",
  "Soll das verpflichtend werden?",
  "Wer trägt dafür die Verantwortung?",
  "Ist das ein Auslaufmodell?",
  "Braucht man dafür eine Ausbildung?",
  "Soll der Staat das bezahlen?",
  "Ist das eine Aufgabe für Ehrenamtliche?",
  "Soll man das früher lernen?",
  "Gehört das in die Schule?",
  "Ist das Privatsache?",
  "Soll man dafür Gebühren verlangen?",
  "Muss das in jeder Stadt vorhanden sein?",
  "Soll man darin eine Prüfung ablegen müssen?",
  "Ist das eher Beruf oder eher Berufung?",
  "Soll man das dem Zufall überlassen?",
  "Wie früh soll man sich dafür entscheiden?",
  "Darf man damit Geld verdienen?",
  "Soll das für alle gleich sein?",
  "Ist weniger davon manchmal besser?",
  "Soll man dafür Arbeitszeit bekommen?",
  "Braucht es dafür feste Regeln?",
  "Soll man das im Alter noch anfangen?",
];

/** Schreiben Teil 2 – was im beruflichen Umfeld schiefgelaufen ist. */
export const ANLASS_SCHREIBEN_2: string[] = [
  "Eine fest zugesagte Leistung wurde ohne Rücksprache zurückgenommen",
  "Eine Umstellung wurde ohne Ankündigung eingeführt",
  "Ein gemeinsam genutzter Raum wird dauerhaft von einer Seite belegt",
  "Die Öffnungs- oder Erreichbarkeitszeiten wurden stark verkürzt",
  "Eine Anschaffung ist seit Monaten nicht eingetroffen",
  "Termine liegen regelmäßig außerhalb der vereinbarten Zeiten",
  "Eine Zuständigkeit wurde geändert, ohne jemanden zu informieren",
  "Eine Abrechnung ist seit Monaten offen",
  "Eine zusätzliche Aufgabe wurde übertragen, ohne dass eine andere wegfällt",
  "Ein Angebot findet plötzlich nur noch in anderer Form statt",
  "Ein Zugang wurde durch eine neue Regelung erheblich erschwert",
  "Lärm aus der Nachbarschaft macht die eigentliche Arbeit unmöglich",
  "Eine Veranstaltung wurde an einen weit entfernten Ort verlegt",
  "Unterlagen sind nach einer Umstellung nicht mehr auffindbar",
  "Eine Einarbeitung wurde zugesagt, findet aber nicht statt",
  "Eine Gebühr wurde ohne vorherige Ankündigung erhöht",
  "Die Zahl der Plätze wurde reduziert, die Nachfrage aber nicht",
  "Eine Vertretung wurde dauerhaft übertragen, obwohl sie befristet war",
  "Eine Zusage wurde mündlich gegeben und wird nun bestritten",
  "Sicherheitsvorgaben lassen sich mit den Arbeitsabläufen nicht vereinbaren",
  "Eine Anlage ist seit Wochen defekt und wird nicht repariert",
  "Mehrere Anfragen blieben unbeantwortet",
];

/** Schreiben Teil 2 – an wen die Mitteilung geht. */
export const ADRESSAT_SCHREIBEN_2: string[] = [
  "die Personalleitung",
  "die Teamleitung",
  "die Abteilungsleitung",
  "die Standortleitung",
  "die Hausverwaltung",
  "die Kurs- oder Seminarleitung",
  "die Geschäftsführung eines Nachbarbetriebs",
  "die zuständige Fachabteilung",
  "die Buchhaltung",
  "die Projektleitung",
  "den Vorstand des Vereins",
  "die Leitung der Einrichtung",
  "die Sicherheitsbeauftragte",
  "die Institutsleitung",
  "die Betriebsleitung",
  "die Ausbildungsleitung",
];

/** Sprechen Teil 1 – Vortragsthemen (zwei verschiedene werden gezogen). */
export const ZUGRIFF_SPRECHEN_1: string[] = [
  "Soll das verpflichtend sein?",
  "Soll das kostenlos sein?",
  "Braucht es das heute noch?",
  "Soll es dafür eine Altersgrenze geben?",
  "Soll man das regelmäßig überprüfen müssen?",
  "Soll das in der Schule unterrichtet werden?",
  "Wem nützt das wirklich?",
  "Soll man das verbieten dürfen?",
  "Soll man dafür bezahlt werden?",
  "Soll das öffentlich gefördert werden?",
  "Soll jeder Zugang dazu haben?",
  "Ist das Aufgabe des Staates?",
  "Soll man dafür eine Erlaubnis brauchen?",
  "Darf man darauf verzichten?",
  "Soll das für alle Altersgruppen offen sein?",
  "Soll das auf dem Land anders geregelt werden als in der Stadt?",
  "Sollen Unternehmen dazu verpflichtet werden?",
  "Soll man darüber mitbestimmen dürfen?",
  "Ist eine Quote hier sinnvoll?",
  "Soll man das vor dem Beruf ausprobieren müssen?",
  "Soll das dokumentiert und veröffentlicht werden?",
  "Braucht es dafür einen Nachweis?",
];

/** Sprechen Teil 2 – Art der Regelung, über die diskutiert wird. */
export const ZUGRIFF_SPRECHEN_2: string[] = [
  "ein Verbot",
  "eine gesetzliche Pflicht",
  "eine Abgabe oder Gebühr",
  "eine Obergrenze",
  "eine Mindestvorgabe",
  "eine Genehmigungspflicht",
  "ein Nachweis als Zugangsvoraussetzung",
  "eine zeitliche Beschränkung",
  "eine Altersgrenze",
  "eine Meldepflicht",
  "eine Förderung aus öffentlichen Mitteln",
  "eine Quote",
  "eine Kennzeichnungspflicht",
  "ein Pfandsystem",
  "eine Haftungsregel",
  "eine Ausnahme für bestimmte Gruppen",
];

/** Themen, zu denen Sprachmodelle ohne Vorgabe fast immer greifen. */
export const ABGENUTZTE_THEMEN: string[] = [
  "Nachhaltigkeit und Klimaschutz als Hauptthema",
  "Digitalisierung, künstliche Intelligenz, Algorithmen",
  "soziale Netzwerke und Bildschirmzeit",
  "Homeoffice und Work-Life-Balance",
  "Elektromobilität",
  "Fachkräftemangel als Hauptthema",
  "Datenschutz im Internet",
  "Fast Fashion",
  "vegane Ernährung",
  "Achtsamkeit und Entschleunigung",
];

/**
 * Worum innerhalb eines Bereichs gestritten wird. Diese Achse wird mit den
 * Frageformen von Lesen 4, Schreiben 1 und Sprechen kombiniert – aus 22
 * Frageformen und 32 Streitpunkten werden gut 700 Fragen je Bereich.
 */
export const ASPEKTE: string[] = [
  "Zugang für Außenstehende",
  "Kosten und wer sie trägt",
  "Ausbildung des Nachwuchses",
  "Qualitätssicherung",
  "Haftung bei Schäden",
  "Öffnungs- und Erreichbarkeitszeiten",
  "Wahl des Standorts",
  "Erhebung und Weitergabe von Daten",
  "Beschaffung von Material",
  "Verteilung der Arbeitszeit",
  "Anteil ehrenamtlicher Mitarbeit",
  "Nachfolge in der Leitung",
  "Offenlegung von Zahlen",
  "Sicherheitsvorgaben",
  "Preisgestaltung",
  "Zusammenarbeit mit Schulen",
  "Umgang mit Fehlern",
  "Dokumentation der eigenen Arbeit",
  "Weitergabe von Wissen an die nächste Generation",
  "Mitbestimmung der Beschäftigten",
  "verpflichtende Zertifikate und Nachweise",
  "Entsorgung von Rückständen",
  "Lärmschutz für die Nachbarschaft",
  "Barrierefreiheit",
  "Verteilung knapper Plätze",
  "Aufsicht durch eine Behörde",
  "Werbung für die eigene Tätigkeit",
  "Einsatz ungelernter Hilfskräfte",
  "Verwendung öffentlicher Mittel",
  "Auswahl derer, die mitmachen dürfen",
  "Umgang mit Beschwerden",
  "Nutzung von Flächen und Räumen",
];

/**
 * Lesen Teil 1 – was den Betrieb an einen Wendepunkt gebracht hat. Zweite
 * Achse neben dem Merkmal, damit sich das Porträt nicht alle 25 Sätze
 * wiederholt.
 */
export const WENDEPUNKTE: string[] = [
  "nach der Übernahme durch die Belegschaft",
  "seit einem Wechsel in der Leitung",
  "nach dem Umzug in ein ehemaliges Industriegebäude",
  "seit einer Zusammenarbeit mit einer Schule",
  "nach dem Verlust des wichtigsten Auftraggebers",
  "seit der Betrieb nur noch auf Bestellung fertigt",
  "nach der Rückkehr der Gründenden aus dem Ausland",
  "seit einem Brand und dem Wiederaufbau",
  "nachdem die Gemeinde die Aufgabe abgegeben hat",
  "seit die Gründerin in den Ruhestand gegangen ist",
  "nach dem Zusammenschluss mit einem früheren Mitbewerber",
  "seit die Werkstatt öffentlich zugänglich ist",
  "nachdem ein vergessenes Verfahren wiederentdeckt wurde",
  "seit die Arbeit auf wenige Monate im Jahr zusammengelegt wurde",
  "nach einem jahrelangen Streit um das Gelände",
  "seit die Belegschaft über Anschaffungen abstimmt",
  "nachdem die letzte Fachkraft ihres Gebiets aufgehört hat",
  "seit einer Spendenkampagne der eigenen Kundschaft",
  "nach einem Fund alter Unterlagen im Archiv",
  "seit die Nachfrage unerwartet stark gestiegen ist",
];

/**
 * Streitpunkte für die Alltagsthemen. ASPEKTE ist auf Betriebe und
 * Einrichtungen zugeschnitten („Nachfolge in der Leitung") und ergäbe bei
 * einem Thema wie „Wasserverbrauch im Haushalt" Unsinn.
 */
export const ALLTAGSASPEKTE: string[] = [
  "die Kosten für Familien",
  "der Zugang für alle, unabhängig vom Einkommen",
  "Altersgrenzen",
  "Pflicht oder Freiwilligkeit",
  "die Rücksicht auf Nachbarn",
  "der Zeitaufwand",
  "die Verteilung knapper Plätze",
  "die Sicherheit",
  "wie Betroffene informiert werden",
  "wie Betroffene mitreden können",
  "Ausnahmen für bestimmte Gruppen",
  "wer die Einhaltung kontrolliert",
  "der Unterschied zwischen Stadt und Land",
  "die Belastung für Berufstätige",
  "was Kinder davon haben",
  "was ältere Menschen davon haben",
  "die Eigenverantwortung des Einzelnen",
  "die Rolle der Gemeinde",
  "Lärm und Ruhezeiten",
  "die Folgen für kleine Anbieter",
  "wie lange eine Regel gelten soll",
  "ob Ausnahmen begründet werden müssen",
  "die Gerechtigkeit gegenüber denen, die sich daran halten",
  "der Aufwand für die Verwaltung",
  "was passiert, wenn sich niemand daran hält",
  "die Wirkung auf das Zusammenleben im Viertel",
];
