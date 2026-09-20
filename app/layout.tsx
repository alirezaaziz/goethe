import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Goethe-Zertifikat C1 – Prüfungstrainer",
  description:
    "Modellsätze für das Goethe-Zertifikat C1 (modular) online bearbeiten: Lesen, Schreiben und Sprechen – mit Zeitvorgabe oder ohne.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="min-h-dvh flex flex-col">
          <header className="no-print border-b bg-[var(--surface)]">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
              <Link href="/" className="flex items-baseline gap-2">
                <span className="text-base font-bold tracking-tight">Goethe-Zertifikat C1</span>
                <span className="hidden text-xs text-[var(--muted)] sm:inline">Prüfungstrainer</span>
              </Link>
              <nav className="flex items-center gap-1 text-sm">
                <Link className="rounded-md px-2.5 py-1.5 hover:bg-[var(--surface-2)]" href="/">
                  Modellsätze
                </Link>
                <Link
                  className="rounded-md px-2.5 py-1.5 hover:bg-[var(--surface-2)]"
                  href="/einstellungen"
                >
                  Einstellungen
                </Link>
                {/* Der Adminbereich ist bewusst nicht verlinkt – er wird direkt über /admin aufgerufen. */}
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="no-print border-t px-4 py-5 text-center text-xs text-[var(--muted)]">
            Kein Angebot des Goethe-Instituts. Prüfungsmaterial dient allein der privaten Vorbereitung.
          </footer>
        </div>
      </body>
    </html>
  );
}
