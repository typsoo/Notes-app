import type { ReactNode } from "react";
import { Fragment } from "react";

import { findMatchRanges } from "../lib/query";

interface HighlightedTextProps {
  text: string;
  tokens: string[];
}

export function HighlightedText({ text, tokens }: HighlightedTextProps) {
  const ranges = findMatchRanges(text, tokens);

  if (ranges.length === 0) {
    return <>{text}</>;
  }

  const nodes: ReactNode[] = [];
  let cursor = 0;

  ranges.forEach((range, index) => {
    if (range.start > cursor) {
      nodes.push(
        <Fragment key={`text-${index}`}>
          {text.slice(cursor, range.start)}
        </Fragment>,
      );
    }

    nodes.push(
      <mark key={`match-${index}`} className="bg-primary/20 rounded-sm">
        {text.slice(range.start, range.end)}
      </mark>,
    );

    cursor = range.end;
  });

  if (cursor < text.length) {
    nodes.push(<Fragment key="text-end">{text.slice(cursor)}</Fragment>);
  }

  return <>{nodes}</>;
}
