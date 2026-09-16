import type { folders, documents } from "@/server/db/schema";
import type { TreeItem, TreeItemIndex } from "react-complex-tree";

export type DbFolder = typeof folders.$inferSelect;
export type DbDocument = typeof documents.$inferSelect;

export type TreeItemData = DbFolder | DbDocument | { name: string };
export type AppTreeItem = TreeItem<TreeItemData>;
export type TreeItemsMap = Record<TreeItemIndex, AppTreeItem>;

export function getItemTitle(item: AppTreeItem): string {
  return "title" in item.data ? item.data.title : item.data.name;
}

export function buildTreeItems(
  folders: DbFolder[],
  documents: DbDocument[],
): TreeItemsMap {
  const workspaceContainer: AppTreeItem = {
    index: "workspace",
    isFolder: true,
    data: { name: "Workspace" },
    children: ["root"],
  };

  const rootItem: AppTreeItem = {
    index: "root",
    isFolder: true,
    data: { name: "Root" },
    children: [],
  };

  const items: TreeItemsMap = {
    workspace: workspaceContainer,
    root: rootItem,
  };

  for (const folder of folders) {
    items[folder.id] = {
      index: folder.id,
      isFolder: true,
      data: folder,
      children: [],
    };
  }

  for (const doc of documents) {
    items[doc.id] = {
      index: doc.id,
      isFolder: false,
      data: doc,
    };
  }

  for (const folder of folders) {
    const parent =
      (folder.parentId ? items[folder.parentId] : null) ?? rootItem;
    parent.children?.push(folder.id);
  }

  for (const doc of documents) {
    const parent = (doc.folderId ? items[doc.folderId] : null) ?? rootItem;
    parent.children?.push(doc.id);
  }

  for (const key of Object.keys(items)) {
    const item = items[key];
    if (item?.children && item.children.length > 0) {
      item.children.sort((a, b) => {
        const itemA = items[a];
        const itemB = items[b];
        if (!itemA || !itemB) return 0;

        if (itemA.isFolder && !itemB.isFolder) return -1;
        if (!itemA.isFolder && itemB.isFolder) return 1;

        if (!itemA.isFolder && !itemB.isFolder) {
          const pinnedA =
            "isPinned" in itemA.data && itemA.data.isPinned ? 1 : 0;
          const pinnedB =
            "isPinned" in itemB.data && itemB.data.isPinned ? 1 : 0;
          if (pinnedA !== pinnedB) return pinnedB - pinnedA;
        }

        return getItemTitle(itemA).localeCompare(
          getItemTitle(itemB),
          undefined,
          {
            numeric: true,
            sensitivity: "base",
          },
        );
      });
    }
  }

  return items;
}
