import { describe, expect, it } from "vitest";

import { makeSnippet } from "./snippet";

const body =
  "The quarterly planning document covers hiring, the search rollout, and the budget for next year.";

describe("makeSnippet", () => {
  it("centers the window on the first body match", () => {
    const longBody = `${"intro ".repeat(30)}search rollout${" outro".repeat(30)}`;
    const snippet = makeSnippet(longBody, ["search"], 100);

    expect(snippet).toContain("search");
    expect(snippet?.startsWith("…")).toBe(true);
    expect(snippet?.endsWith("…")).toBe(true);
    expect((snippet ?? "").length).toBeLessThanOrEqual(102);
  });

  it("does not add a leading ellipsis for a match at the start", () => {
    const snippet = makeSnippet(
      "Quarterly planning starts now.",
      ["Quarterly"],
      100,
    );

    expect(snippet).toBe("Quarterly planning starts now.");
  });

  it("returns null when only the title or folder matched", () => {
    expect(makeSnippet(body, ["unrelated"], 100)).toBeNull();
  });

  it("returns null for an empty body", () => {
    expect(makeSnippet("", ["search"], 100)).toBeNull();
  });

  it("handles a token longer than the window", () => {
    const snippet = makeSnippet("a".repeat(200), ["a".repeat(150)], 100);

    expect(snippet).not.toBeNull();
    expect((snippet ?? "").length).toBeLessThanOrEqual(102);
  });

  it("normalizes whitespace inside the excerpt", () => {
    const snippet = makeSnippet(
      "before   search\n\nfeature after",
      ["search"],
      100,
    );

    expect(snippet).toContain("search feature");
  });
});
