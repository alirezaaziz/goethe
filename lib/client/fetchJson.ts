"use client";

/**
 * Liest eine Antwort als JSON und liefert bei leerem oder kaputtem Body eine
 * verständliche Meldung statt eines „Unexpected end of JSON input“.
 * Eine abgestürzte Serverless-Funktion antwortet mit leerem Rumpf – genau
 * dieser Fall soll in der Oberfläche lesbar ankommen.
 */
export async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();

  if (text.trim() === "") {
    throw new Error(
      res.ok
        ? "Der Server hat eine leere Antwort geschickt."
        : `Der Server hat mit Fehler ${res.status} geantwortet und keine Begründung mitgeliefert. ` +
          "Häufigste Ursache auf Vercel: Es ist kein Blob-Store mit dem Projekt verbunden.",
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Unerwartete Antwort des Servers (Status ${res.status}): ${text.slice(0, 200)}`,
    );
  }
}
