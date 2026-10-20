import { describe, expect, it } from "vitest";

import { escapeLikePattern, findMatchRanges, tokenizeQuery } from "./query";

describe("tokenizeQuery", () => {
  it("splits on whitespace and trims", () => {
    expect(tokenizeQuery("  project   alpha ")).toEqual(["project", "alpha"]);
  });

  it("returns no tokens for blank input", () => {
    expect(tokenizeQuery("   ")).toEqual([]);
  });
});

describe("escapeLikePattern", () => {
  it("escapes SQL LIKE wildcards and backslashes", () => {
    expect(escapeLikePattern("100%_done\\")).toBe("100\\%\\_done\\\\");
  });
});

describe("findMatchRanges", () => {
  it("finds every case-insensitive occurrence", () => {
    expect(findMatchRanges("Search and search again", ["search"])).toEqual([
      { start: 0, end: 6 },
      { start: 11, end: 17 },
    ]);
  });

  it("merges overlapping matches", () => {
    expect(findMatchRanges("banana", ["ana", "banana"])).toEqual([
      { start: 0, end: 6 },
    ]);
  });

  it("ignores empty tokens", () => {
    expect(findMatchRanges("text", ["", "  "])).toEqual([]);
  });
});
