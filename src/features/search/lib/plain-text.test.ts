import type { Block } from "@blocknote/core";
import { describe, expect, it } from "vitest";

import { blocksToPlainText } from "./plain-text";

function block(content: unknown, children: Block[] = []): Block {
  return {
    id: "block-id",
    type: "paragraph",
    props: {},
    content,
    children,
  } as unknown as Block;
}

function text(value: string) {
  return { type: "text", text: value, styles: {} };
}

describe("blocksToPlainText", () => {
  it("collects inline text across blocks and nested children", () => {
    const blocks = [
      block([text("Roadmap")]),
      block([text("Ship  the")], [block([text("search feature")])]),
    ];

    expect(blocksToPlainText(blocks)).toBe("Roadmap Ship the search feature");
  });

  it("skips props so URLs and metadata do not become matches", () => {
    const blocks = [
      {
        id: "image-id",
        type: "image",
        props: { url: "https://example.com/secret.png", caption: "ignored" },
        content: undefined,
        children: [],
      } as unknown as Block,
      block([text("visible copy")]),
    ];

    const result = blocksToPlainText(blocks);

    expect(result).toBe("visible copy");
    expect(result).not.toContain("example.com");
  });

  it("walks table-like content objects", () => {
    const blocks = [
      block({
        type: "tableContent",
        rows: [
          {
            cells: [[text("Q3")], [text("budget")]],
          },
        ],
      }),
    ];

    expect(blocksToPlainText(blocks)).toBe("Q3 budget");
  });

  it("returns an empty string for an empty document", () => {
    expect(blocksToPlainText([])).toBe("");
  });
});
