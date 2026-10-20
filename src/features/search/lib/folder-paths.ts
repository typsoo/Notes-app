export interface FolderPathRow {
  id: string;
  parentId: string | null;
  name: string;
}

/**
 * Builds a display and matching path for every folder, e.g. `Projects / Client A`.
 *
 * Unknown parents and cycles resolve to a best-effort path instead of looping.
 */
export function buildFolderPaths(
  folders: FolderPathRow[],
): Map<string, string> {
  const foldersById = new Map(folders.map((folder) => [folder.id, folder]));
  const paths = new Map<string, string>();

  const resolve = (id: string, seen: Set<string>): string => {
    const cached = paths.get(id);

    if (cached !== undefined) {
      return cached;
    }

    const folder = foldersById.get(id);

    if (!folder) {
      return "";
    }

    if (seen.has(id)) {
      return "";
    }

    seen.add(id);

    const parentPath = folder.parentId ? resolve(folder.parentId, seen) : "";
    const path = parentPath ? `${parentPath} / ${folder.name}` : folder.name;

    paths.set(id, path);
    return path;
  };

  for (const folder of folders) {
    resolve(folder.id, new Set());
  }

  return paths;
}
