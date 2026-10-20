/**
 * Builds the excerpt shown under a Search Result.
 *
 * The window is centered on the first matching token and trims to
 * `maxLength` characters. Returns null when the body did not match, so
 * title- and folder-only results show no snippet.
 */
export function makeSnippet(
  text: string,
  tokens: string[],
  maxLength = 100,
): string | null {
  if (!text) {
    return null;
  }

  const lowerText = text.toLowerCase();
  let matchIndex = -1;
  let matchToken = "";

  for (const token of tokens) {
    if (!token) {
      continue;
    }

    const index = lowerText.indexOf(token.toLowerCase());

    if (index !== -1 && (matchIndex === -1 || index < matchIndex)) {
      matchIndex = index;
      matchToken = token;
    }
  }

  if (matchIndex === -1) {
    return null;
  }

  const windowLength = Math.max(1, maxLength);
  const tokenLength = Math.min(matchToken.length, windowLength);
  const leading = Math.floor((windowLength - tokenLength) / 2);

  let start = Math.max(0, matchIndex - leading);
  const end = Math.min(text.length, start + windowLength);

  if (end - start < windowLength) {
    start = Math.max(0, end - windowLength);
  }

  const excerpt = text.slice(start, end).replace(/\s+/g, " ").trim();
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";

  return `${prefix}${excerpt}${suffix}`;
}
