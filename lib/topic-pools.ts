/**
 * Themenvorrat für neue Modellsätze.
 *
 * Der Grund für diese Listen: Ein Prompt ist ein fester Text. Wird derselbe
 * Text mehrfach an ein Sprachmodell gegeben, landet es zuverlässig bei
 * denselben Naheliegenden Themen (Nachhaltigkeit, Digitalisierung, KI) oder
 * paraphrasiert den mitgelieferten Referenzsatz. Die Abwechslung muss deshalb
 * aus dem Code kommen: Für jeden Prüfungsteil wird hier ein Thema gezogen und
 * als Vorgabe in den Prompt geschrieben.
 */

export interface Topic {
  /** Sachgebiet – dient dazu, innerhalb eines Modellsatzes Dopplungen zu vermeiden. */
  bereich: string;
  /** Die eigentliche Vorgabe, die im Prompt landet. */
  thema: string;
}

/** Teil 1: Porträt einer Organisation, eines Betriebs oder einer Initiative. */
export const LESEN_1: Topic[] = [
  { bereich: "Handwerk", thema: "eine Genossenschaft, die alte Handwerksbetriebe übernimmt und an junge Meisterinnen und Meister weitergibt" },
  { bereich: "Ernährung", thema: "eine Großbäckerei, die ausschließlich alte, fast vergessene Getreidesorten verarbeitet" },
  { bereich: "Mobilität", thema: "ein Betrieb, der ausrangierte Linienbusse zu mobilen Arztpraxen für den ländlichen Raum umbaut" },
  { bereich: "Kultur", thema: "ein Verlag, der ausschließlich Übersetzungen aus kleinen Sprachen herausbringt" },
  { bereich: "Textil", thema: "eine Weberei, die Arbeitskleidung aus Fasern regionaler Pflanzen herstellt" },
  { bereich: "Wohnen", thema: "eine Baugruppe, die leerstehende Kaufhäuser zu Wohnungen und Werkstätten umbaut" },
  { bereich: "Musik", thema: "eine Werkstatt für historische Tasteninstrumente mit eigener Ausbildungswerkstatt" },
  { bereich: "Landwirtschaft", thema: "ein Hof, der Obstwiesen verpachtet und die Ernte gemeinschaftlich verwertet" },
  { bereich: "Technik", thema: "ein Reparaturbetrieb, der Haushaltsgeräte aus den 1960er- bis 1990er-Jahren wieder instand setzt" },
  { bereich: "Bildung", thema: "eine Schreibwerkstatt, die Menschen mit Migrationsgeschichte zu Autorinnen und Autoren ausbildet" },
  { bereich: "Gesundheit", thema: "eine Kräuterei, die Heilpflanzen für Apotheken anbaut und Führungen anbietet" },
  { bereich: "Medien", thema: "eine Lokalredaktion in Genossenschaftsbesitz, die von ihren Leserinnen und Lesern getragen wird" },
  { bereich: "Sport", thema: "ein Verein, der stillgelegte Industriehallen zu Kletterzentren umbaut" },
  { bereich: "Logistik", thema: "ein Zustelldienst, der Pakete auf dem letzten Kilometer mit Lastenrädern und Booten ausliefert" },
  { bereich: "Wissenschaft", thema: "ein Labor, das Bodenproben von Privatgärten untersucht und die Daten öffentlich sammelt" },
  { bereich: "Gastronomie", thema: "eine Kantine, die ihren Speiseplan täglich aus den Überschüssen des Großmarkts bildet" },
  { bereich: "Architektur", thema: "ein Büro, das ausschließlich mit gebrauchten Bauteilen plant" },
  { bereich: "Tourismus", thema: "eine Herberge in einem ehemaligen Leuchtturm mit eigener Vogelwarte" },
];

/** Teil 2: Sachtext über eine Studie mit gesellschaftlicher Relevanz. */
export const LESEN_2: Topic[] = [
  { bereich: "Schlaf", thema: "eine Studie über die Folgen später Schulanfangszeiten für Jugendliche" },
  { bereich: "Lärm", thema: "eine Untersuchung zum Einfluss von Verkehrslärm auf die Konzentrationsfähigkeit im Büro" },
  { bereich: "Sprache", thema: "eine Langzeitstudie zum Verlust regionaler Dialekte bei Kindern" },
  { bereich: "Ehrenamt", thema: "eine Erhebung darüber, warum sich immer weniger Menschen langfristig ehrenamtlich binden" },
  { bereich: "Wohnen", thema: "eine Studie über Nachbarschaftsbeziehungen in neu gebauten Wohnquartieren" },
  { bereich: "Gedächtnis", thema: "eine Untersuchung dazu, wie sich Navigationsgeräte auf den Orientierungssinn auswirken" },
  { bereich: "Ernährung", thema: "eine Studie über gemeinsames Essen in Familien und seine Wirkung auf das Sozialverhalten" },
  { bereich: "Arbeitswelt", thema: "eine Erhebung zu Großraumbüros und der Bereitschaft, Wissen zu teilen" },
  { bereich: "Bewegung", thema: "eine Untersuchung darüber, wie sich der Schulweg zu Fuß auf die Selbstständigkeit auswirkt" },
  { bereich: "Konsum", thema: "eine Studie über Reparieren statt Neukaufen und die Rolle von Garantiezeiten" },
  { bereich: "Natur", thema: "eine Untersuchung zur Wirkung von Stadtbäumen auf das Wohlbefinden der Anwohnenden" },
  { bereich: "Lesen", thema: "eine Vergleichsstudie zum Textverständnis auf Papier und am Bildschirm" },
  { bereich: "Alter", thema: "eine Studie über Mehrgenerationenprojekte und die Einsamkeit im Alter" },
  { bereich: "Musik", thema: "eine Untersuchung zum Einfluss früher Instrumentalausbildung auf das Hörvermögen" },
  { bereich: "Gesundheit", thema: "eine Studie über die Folgen langer Sitzzeiten und wirksame Gegenmaßnahmen" },
  { bereich: "Geld", thema: "eine Untersuchung darüber, wie Taschengeld den späteren Umgang mit Geld prägt" },
  { bereich: "Freundschaft", thema: "eine Langzeitstudie über Freundschaften nach einem Umzug in eine andere Stadt" },
  { bereich: "Kleidung", thema: "eine Erhebung zur Wirkung von Schuluniformen auf das Klassenklima" },
];

/** Teil 3: meinungsbetonter Kommentar über eine gesellschaftliche Entwicklung. */
export const LESEN_3: Topic[] = [
  { bereich: "Bauen", thema: "der Abriss funktionsfähiger Gebäude und die Frage, warum Erhalten so selten gewählt wird" },
  { bereich: "Bildung", thema: "das Verschwinden praktischer Fächer aus den Lehrplänen" },
  { bereich: "Sprache", thema: "die Verarmung der Behördensprache und ihre Folgen für die Teilhabe" },
  { bereich: "Zeit", thema: "die Beschleunigung von Lieferzeiten und der Preis, den Beschäftigte dafür zahlen" },
  { bereich: "Ehrenamt", thema: "der Rückzug aus Vereinsvorständen und die Zukunft des Vereinswesens" },
  { bereich: "Stadt", thema: "der Verlust von Orten, an denen man sich aufhalten kann, ohne etwas zu kaufen" },
  { bereich: "Handwerk", thema: "der Bedeutungsverlust praktischer Berufe gegenüber akademischen Abschlüssen" },
  { bereich: "Wissenschaft", thema: "der Druck zur schnellen Veröffentlichung und seine Wirkung auf die Gründlichkeit" },
  { bereich: "Kultur", thema: "die Schließung kleiner Bühnen und Kinos in mittelgroßen Städten" },
  { bereich: "Medizin", thema: "die Erwartung ständiger Erreichbarkeit in Pflegeberufen" },
  { bereich: "Natur", thema: "die Pflege von Rasenflächen und der Streit um verwilderte Grünanlagen" },
  { bereich: "Konsum", thema: "die immer kürzere Lebensdauer von Alltagsgegenständen" },
  { bereich: "Verwaltung", thema: "die Zunahme von Nachweispflichten und der Verlust an Vertrauen" },
  { bereich: "Sport", thema: "der Leistungsdruck im Kinder- und Jugendsport" },
  { bereich: "Erinnerung", thema: "der Umgang mit Denkmälern, deren Geschichte umstritten ist" },
  { bereich: "Familie", thema: "die Erwartung, Beruf und Pflege von Angehörigen gleichzeitig zu bewältigen" },
  { bereich: "Land", thema: "die Ausdünnung von Nahverkehr und Nahversorgung in kleinen Gemeinden" },
  { bereich: "Wohnen", thema: "die Umwandlung von Wohnraum in Ferienunterkünfte" },
];

/** Teil 4: Fachleute mit unterschiedlichen Blickwinkeln auf eine Frage. */
export const LESEN_4: Topic[] = [
  { bereich: "Wasser", thema: "Wem gehört das Grundwasser?" },
  { bereich: "Arbeitszeit", thema: "Wie viel Arbeitszeit braucht ein gutes Leben?" },
  { bereich: "Bodennutzung", thema: "Wofür soll knappe Fläche verwendet werden?" },
  { bereich: "Erbe", thema: "Was sollen Museen mit Beständen umstrittener Herkunft tun?" },
  { bereich: "Prüfungen", thema: "Wie sinnvoll sind zentrale Abschlussprüfungen?" },
  { bereich: "Tiere", thema: "Welche Rolle sollen Wildtiere in besiedelten Gebieten haben?" },
  { bereich: "Wohnraum", thema: "Soll Wohnraum dem Markt überlassen werden?" },
  { bereich: "Gedächtnis", thema: "Wie sollen Gesellschaften ihre eigene Geschichte dokumentieren?" },
  { bereich: "Gesundheitsvorsorge", thema: "Wie weit darf Vorsorge in den Alltag eingreifen?" },
  { bereich: "Sprachenpolitik", thema: "Welchen Platz sollen Minderheitensprachen in der Schule haben?" },
  { bereich: "Verkehr", thema: "Wem gehört der öffentliche Straßenraum?" },
  { bereich: "Landwirtschaft", thema: "Wie soll Nahrungsmittelproduktion künftig organisiert sein?" },
  { bereich: "Forschungsethik", thema: "Was darf Forschung am Menschen?" },
  { bereich: "Kulturförderung", thema: "Nach welchen Maßstäben soll Kultur öffentlich gefördert werden?" },
  { bereich: "Lärmschutz", thema: "Wie viel Ruhe schuldet eine Stadt ihren Bewohnerinnen und Bewohnern?" },
  { bereich: "Bildungsweg", thema: "Wann soll über den weiteren Bildungsweg entschieden werden?" },
  { bereich: "Ehrenamt", thema: "Soll bürgerschaftliches Engagement vergütet werden?" },
  { bereich: "Datenerhebung", thema: "Welche Daten darf der Staat über seine Bevölkerung sammeln?" },
];

/** Schreiben Teil 1: kontroverse Frage für einen Forumsbeitrag. */
export const SCHREIBEN_1: Topic[] = [
  { bereich: "Beruf", thema: "Soll man den erlernten Beruf im Lauf des Lebens wechseln?" },
  { bereich: "Wohnen", thema: "Stadt oder Land – wo lässt es sich besser leben?" },
  { bereich: "Erziehung", thema: "Ab welchem Alter sollen Kinder eigenes Geld verwalten?" },
  { bereich: "Freizeit", thema: "Braucht jeder Mensch ein Hobby, das nichts einbringt?" },
  { bereich: "Sprache", thema: "Lohnt es sich noch, eine Fremdsprache gründlich zu lernen?" },
  { bereich: "Arbeit", thema: "Soll die Arbeitswoche kürzer werden?" },
  { bereich: "Konsum", thema: "Reparieren oder neu kaufen – was ist vernünftiger?" },
  { bereich: "Bildung", thema: "Gehören praktische Fächer zurück in den Stundenplan?" },
  { bereich: "Reisen", thema: "Wie viel Fernreisen kann man noch verantworten?" },
  { bereich: "Gemeinschaft", thema: "Soll ein Jahr gemeinnütziger Dienst für alle verpflichtend sein?" },
  { bereich: "Gesundheit", thema: "Wer trägt die Verantwortung für die eigene Gesundheit?" },
  { bereich: "Ruhestand", thema: "Soll man so lange arbeiten, wie man möchte?" },
  { bereich: "Kultur", thema: "Muss jede Stadt ein eigenes Theater haben?" },
  { bereich: "Nachbarschaft", thema: "Wie viel Rücksicht schuldet man seinen Nachbarn?" },
  { bereich: "Ernährung", thema: "Soll in öffentlichen Kantinen vorgeschrieben werden, was auf den Teller kommt?" },
  { bereich: "Wettbewerb", thema: "Schadet Leistungsdruck in der Schule mehr, als er nützt?" },
  { bereich: "Wohnform", thema: "Ist das Leben in Wohngemeinschaften ein Modell für alle Altersgruppen?" },
  { bereich: "Verkehr", thema: "Soll der Führerschein regelmäßig erneuert werden müssen?" },
];

/** Schreiben Teil 2: berufliche Situation für eine (halb-)formelle Mitteilung. */
export const SCHREIBEN_2: Topic[] = [
  { bereich: "Weiterbildung", thema: "Eine zugesagte Weiterbildung wurde ohne Rücksprache gestrichen; Sie schreiben an die Personalleitung." },
  { bereich: "Dienstplan", thema: "Der neue Schichtplan wurde sehr kurzfristig geändert; Sie schreiben an die Teamleitung." },
  { bereich: "Ausstattung", thema: "Die versprochene technische Ausstattung für das Homeoffice ist nach Monaten nicht eingetroffen; Sie schreiben an die Verwaltung." },
  { bereich: "Kantine", thema: "Die Betriebskantine hat ihre Öffnungszeiten stark verkürzt; Sie schreiben an die Betriebsleitung." },
  { bereich: "Lärm", thema: "Eine Baustelle vor Ihrem Büro macht Telefonate unmöglich; Sie schreiben an das Facility-Management." },
  { bereich: "Vertretung", thema: "Sie sollen dauerhaft eine zusätzliche Vertretung übernehmen, ohne dass Aufgaben wegfallen; Sie schreiben an Ihre Vorgesetzte." },
  { bereich: "Fortbildungsort", thema: "Eine Fortbildung wurde an einen weit entfernten Ort verlegt; Sie schreiben an die Organisation." },
  { bereich: "Archiv", thema: "Das gemeinsame Ablagesystem wurde umgestellt und Unterlagen sind nicht mehr auffindbar; Sie schreiben an die IT-Abteilung." },
  { bereich: "Parken", thema: "Die Stellplätze am Betrieb wurden reduziert, Ihre Anfahrt ist dadurch schwierig; Sie schreiben an die Verwaltung." },
  { bereich: "Praktikum", thema: "Die Betreuung Ihrer Praktikantin ist neben Ihren Aufgaben nicht zu leisten; Sie schreiben an die Abteilungsleitung." },
  { bereich: "Bibliothek", thema: "Die Fachbibliothek Ihres Instituts soll aufgelöst werden; Sie schreiben an die Institutsleitung." },
  { bereich: "Reisekosten", thema: "Ihre Reisekostenabrechnung ist seit Monaten offen; Sie schreiben an die Buchhaltung." },
  { bereich: "Termin", thema: "Wichtige Besprechungen liegen regelmäßig außerhalb Ihrer Arbeitszeit; Sie schreiben an die Projektleitung." },
  { bereich: "Werkstatt", thema: "Ein gemeinsam genutzter Werkstattraum wird von einer Abteilung dauerhaft belegt; Sie schreiben an die Standortleitung." },
  { bereich: "Nachbarbetrieb", thema: "Anlieferungen eines Nachbarbetriebs blockieren früh morgens Ihre Zufahrt; Sie schreiben an dessen Geschäftsführung." },
  { bereich: "Kurs", thema: "Ein gebuchter Abendkurs findet plötzlich nur noch online statt; Sie schreiben an die Kursleitung." },
  { bereich: "Wohnheim", thema: "Im Gästehaus Ihres Arbeitgebers wurden die Küchen geschlossen; Sie schreiben an die Hausverwaltung." },
  { bereich: "Sicherheit", thema: "Eine neue Zutrittsregelung erschwert Ihnen den Zugang zum Labor; Sie schreiben an die Sicherheitsbeauftragte." },
];

/** Sprechen Teil 1: Vortragsthemen (es werden zwei verschiedene gezogen). */
export const SPRECHEN_VORTRAG: Topic[] = [
  { bereich: "Schule", thema: "Sollen Noten in den ersten Schuljahren abgeschafft werden?" },
  { bereich: "Stadt", thema: "Sollen Innenstädte autofrei werden?" },
  { bereich: "Arbeit", thema: "Soll Homeoffice ein Recht sein?" },
  { bereich: "Tiere", thema: "Sollen Zoos abgeschafft werden?" },
  { bereich: "Sprache", thema: "Soll Englisch zweite Amtssprache werden?" },
  { bereich: "Medien", thema: "Sollen soziale Netzwerke erst ab 16 Jahren zugänglich sein?" },
  { bereich: "Ernährung", thema: "Soll in Schulen ausschließlich regionales Essen angeboten werden?" },
  { bereich: "Wohnen", thema: "Soll Leerstand von Wohnraum verboten werden?" },
  { bereich: "Kultur", thema: "Soll der Eintritt in Museen grundsätzlich frei sein?" },
  { bereich: "Verkehr", thema: "Soll der Nahverkehr kostenlos sein?" },
  { bereich: "Gesundheit", thema: "Sollen Vorsorgeuntersuchungen verpflichtend sein?" },
  { bereich: "Bildung", thema: "Soll ein Auslandsaufenthalt zum Studium gehören?" },
  { bereich: "Ehrenamt", thema: "Soll ehrenamtliche Arbeit auf die Rente angerechnet werden?" },
  { bereich: "Technik", thema: "Sollen Hersteller zu langlebigen Geräten verpflichtet werden?" },
  { bereich: "Sport", thema: "Soll Schulsport benotet werden?" },
  { bereich: "Natur", thema: "Sollen Privatgärten naturnah gestaltet werden müssen?" },
  { bereich: "Arbeitszeit", thema: "Soll es ein Recht auf Nichterreichbarkeit nach Feierabend geben?" },
  { bereich: "Wissenschaft", thema: "Sollen Forschungsergebnisse immer frei zugänglich sein?" },
  { bereich: "Konsum", thema: "Soll Werbung für Kinder verboten werden?" },
  { bereich: "Stadtgrün", thema: "Sollen Parkplätze zu Grünflächen umgewandelt werden?" },
];

/** Sprechen Teil 2: kontroverse Frage mit kurzem Meldungstext. */
export const SPRECHEN_DISKUSSION: Topic[] = [
  { bereich: "Handy", thema: "ein Handyverbot an Schulen" },
  { bereich: "Tempo", thema: "ein allgemeines Tempolimit auf Autobahnen" },
  { bereich: "Feuerwerk", thema: "ein Verbot von privatem Silvesterfeuerwerk" },
  { bereich: "Hitze", thema: "verpflichtende Hitzefrei-Regelungen am Arbeitsplatz" },
  { bereich: "Haustiere", thema: "eine Pflicht zum Sachkundenachweis vor dem Kauf eines Hundes" },
  { bereich: "Wasser", thema: "ein Verbot, Gärten bei Trockenheit zu bewässern" },
  { bereich: "Verpackung", thema: "ein Pfand auf sämtliche Getränkeverpackungen" },
  { bereich: "Sonntag", thema: "die Öffnung von Geschäften an Sonntagen" },
  { bereich: "Rauchen", thema: "ein Rauchverbot in Außenbereichen von Lokalen" },
  { bereich: "Lebensmittel", thema: "eine Pflicht für Supermärkte, unverkaufte Ware abzugeben" },
  { bereich: "Führerschein", thema: "verpflichtende Fahrtests ab einem bestimmten Alter" },
  { bereich: "Mieten", thema: "eine gesetzliche Obergrenze für Mieten" },
  { bereich: "Werbung", thema: "ein Verbot von Plakatwerbung im Stadtbild" },
  { bereich: "Nebenkosten", thema: "eine Pflicht zur Wärmedämmung bei Altbauten" },
  { bereich: "Flug", thema: "eine Abgabe auf Kurzstreckenflüge" },
  { bereich: "Drohnen", thema: "ein Verbot privater Drohnen über Wohngebieten" },
  { bereich: "Schulweg", thema: "ein Halteverbot vor Schulen für Elterntaxis" },
  { bereich: "Bargeld", thema: "eine Pflicht für Geschäfte, Bargeld anzunehmen" },
];
