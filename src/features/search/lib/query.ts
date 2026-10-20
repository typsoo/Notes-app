export interface MatchRange {
  start: number;
  end: number;
}

/**
 * Returns the spans of `text` that match any token, case-insensitively.
 * Overlapping and adjacent spans are merged.
 */
export function findMatchRanges(text: string, tokens: string[]): MatchRange[] {
  const lowerText = text.toLowerCase();
  const ranges: MatchRange[] = [];

  for (const token of tokens) {
    const needle = token.toLowerCase();

    if (!needle) {
      continue;
    }

    let from = 0;

    while (from <= lowerText.length - needle.length) {
      const index = lowerText.indexOf(needle, from);

      if (index === -1) {
        break;
      }

      ranges.push({ start: index, end: index + needle.length });
      from = index + needle.length;
    }
  }

  ranges.sort((a, b) => a.start - b.start || b.end - a.end);

  const merged: MatchRange[] = [];

  for (const range of ranges) {
    const last = merged[merged.length - 1];

    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }

  return merged;
}

/** Splits a Search Query into the whitespace-delimited terms users typed. */
export function tokenizeQuery(query: string): string[] {
  return query.trim().split(/\s+/).filter(Boolean);
}

/** Escapes LIKE wildcards so user input is matched literally. */
export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}
