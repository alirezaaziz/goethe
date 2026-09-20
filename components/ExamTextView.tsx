"use client";

import { Fragment } from "react";
import type { ExamText } from "@/lib/types";

export type GapState = "correct" | "wrong" | undefined;

interface Props {
  text: ExamText;
  /** Was in der Lücke angezeigt wird: Nummer oder gewählter Buchstabe. */
  gapLabel?: (id: number) => string;
  gapFilled?: (id: number) => boolean;
  gapState?: (id: number) => GapState;
  activeGap?: number | null;
  onGapClick?: (id: number) => void;
}

const GAP = /\[\[(\d+)\]\]/g;

export default function ExamTextView({
  text,
  gapLabel,
  gapFilled,
  gapState,
  activeGap,
  onGapClick,
}: Props) {
  return (
    <article className="exam-text">
      {(text.title || text.subtitle) && (
        <header className="mb-4 border-b pb-3">
          {text.title && (
            <h3 className="text-lg font-semibold leading-snug tracking-tight">{text.title}</h3>
          )}
          {text.subtitle && (
            <p className="mt-1 text-[0.95rem] text-[var(--muted)]">{text.subtitle}</p>
          )}
        </header>
      )}
      {text.intro && (
        <p className="mb-4 border-l-2 border-[var(--accent)] pl-3 italic text-[var(--muted)]">
          {text.intro}
        </p>
      )}
      {text.paragraphs.map((paragraph, index) => (
        <p key={index}>{renderParagraph(paragraph)}</p>
      ))}
    </article>
  );

  function renderParagraph(paragraph: string) {
    const nodes: React.ReactNode[] = [];
    let cursor = 0;
    GAP.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = GAP.exec(paragraph)) !== null) {
      if (match.index > cursor) nodes.push(paragraph.slice(cursor, match.index));
      const id = Number(match[1]);
      nodes.push(
        <Fragment key={`${match.index}-${id}`}>
          <button
            type="button"
            className="gap"
            data-filled={gapFilled?.(id) ? "true" : "false"}
            data-active={activeGap === id ? "true" : "false"}
            data-state={gapState?.(id)}
            onClick={() => onGapClick?.(id)}
            aria-label={id === 0 ? "Beispiel" : `Lücke ${id}`}
          >
            {gapLabel ? gapLabel(id) : id === 0 ? "0" : String(id)}
          </button>
        </Fragment>,
      );
      cursor = match.index + match[0].length;
    }
    if (cursor < paragraph.length) nodes.push(paragraph.slice(cursor));
    return nodes;
  }
}
