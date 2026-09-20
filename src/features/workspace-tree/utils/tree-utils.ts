import type { TreeItemIndex } from "react-complex-tree";
import type { TreeItemsMap } from "./tree-transform";

export function isSelfOrDescendant(
  items: TreeItemsMap,
  ancestorId: TreeItemIndex,
  targetId: TreeItemIndex,
  visited = new Set<TreeItemIndex>(),
): boolean {
  if (ancestorId === targetId) return true;
  if (visited.has(ancestorId)) return false;
  visited.add(ancestorId);

  const ancestor = items[ancestorId];
  if (!ancestor?.children) return false;

  for (const childId of ancestor.children) {
    if (isSelfOrDescendant(items, childId, targetId, visited)) {
      return true;
    }
  }
  return false;
}

export function moveTreeItem(
  currentItems: TreeItemsMap,
  draggedItemId: TreeItemIndex,
  targetParentId: TreeItemIndex,
): TreeItemsMap {
  const targetParent = currentItems[targetParentId];

  if (!targetParent || (targetParentId !== "root" && !targetParent.isFolder)) {
    return currentItems;
  }

  const nextItems = { ...currentItems };

  for (const key of Object.keys(nextItems)) {
    const item = nextItems[key];

    if (!item?.children?.includes(draggedItemId)) {
      continue;
    }

    nextItems[key] = {
      ...item,
      children: item.children.filter((id) => id !== draggedItemId),
    };

    break;
  }

  nextItems[targetParentId] = {
    ...targetParent,
    children: [
      ...(targetParent.children ?? []).filter((id) => id !== draggedItemId),
      draggedItemId,
    ],
  };

  return nextItems;
}

export function getCurrentParentId(
  treeItems: TreeItemsMap,
  itemId: TreeItemIndex,
): TreeItemIndex | null {
  for (const item of Object.values(treeItems)) {
    if (item?.children?.includes(itemId)) {
      return item.index;
    }
  }

  return null;
}
