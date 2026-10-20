import { describe, expect, it } from "vitest";

import { buildFolderPaths, type FolderPathRow } from "./folder-paths";

const folders: FolderPathRow[] = [
  { id: "projects", parentId: null, name: "Projects" },
  { id: "client-a", parentId: "projects", name: "Client A" },
  { id: "q3", parentId: "client-a", name: "Q3" },
  { id: "inbox", parentId: null, name: "Inbox" },
];

describe("buildFolderPaths", () => {
  it("builds full paths from the root", () => {
    const paths = buildFolderPaths(folders);

    expect(paths.get("projects")).toBe("Projects");
    expect(paths.get("client-a")).toBe("Projects / Client A");
    expect(paths.get("q3")).toBe("Projects / Client A / Q3");
    expect(paths.get("inbox")).toBe("Inbox");
  });

  it("ignores an unknown parent", () => {
    const paths = buildFolderPaths([
      { id: "orphan", parentId: "missing", name: "Orphan" },
    ]);

    expect(paths.get("orphan")).toBe("Orphan");
  });

  it("terminates on a parent cycle", () => {
    const paths = buildFolderPaths([
      { id: "a", parentId: "b", name: "A" },
      { id: "b", parentId: "a", name: "B" },
    ]);

    expect(paths.has("a")).toBe(true);
    expect(paths.has("b")).toBe(true);
  });
});
