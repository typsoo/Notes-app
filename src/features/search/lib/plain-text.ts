import type { Block } from "@blocknote/core";

/**
 * Flattens a BlockNote document into searchable text.
 *
 * Only user-authored strings are collected: block `props` are skipped so URLs,
 * colors, and other metadata do not produce matches.
 */
export function blocksToPlainText(blocks: Block[]): string {
  const parts: string[] = [];
  collectText(blocks, parts);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function collectText(value: unknown, parts: string[]): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectText(item, parts);
    }
    return;
  }

  if (value === null || typeof value !== "object") {
    return;
  }

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (key === "props") {
      continue;
    }

    if ((key === "text" || key === "content") && typeof child === "string") {
      parts.push(child);
      continue;
    }

    collectText(child, parts);
  }
}
