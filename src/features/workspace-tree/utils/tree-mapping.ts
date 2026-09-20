import type { TreeItem, TreeItemIndex } from "react-complex-tree";
import type { TreeItemsMap, TreeItemData } from "./tree-transform";

export function getDatabaseId(item: TreeItem<TreeItemData>): string | null {
  return "id" in item.data ? item.data.id : null;
}

export function getDatabaseParentId(
  targetTreeId: TreeItemIndex,
  treeItems: TreeItemsMap,
): string | null {
  if (targetTreeId === "root") return null;

  const parentItem = treeItems[targetTreeId];

  if (!parentItem) {
    throw new Error(`Tree item "${targetTreeId}" not found`);
  }

  return getDatabaseId(parentItem);
}
