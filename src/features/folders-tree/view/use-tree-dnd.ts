import { useEffect, useState } from "react";

import type {
  DraggingPosition,
  TreeItem,
  TreeItemIndex,
} from "react-complex-tree";

import type { TreeItemsMap, TreeItemData } from "../transform";

import { isSelfOrDescendant, moveTreeItem } from "./tree-utils";
import { useTreePersistence } from "./use-tree-persistance";

interface UseTreeDndOptions {
  items: TreeItemsMap;
  workspaceId: string;
  onDrop?: (items: TreeItem<TreeItemData>[], target: DraggingPosition) => void;
  onExpandFolder?: (folderId: TreeItemIndex) => void;
}

import { getCurrentParentId } from "./tree-utils";

export function useTreeDnd({
  items,
  workspaceId,
  onDrop: onDropProp,
  onExpandFolder,
}: UseTreeDndOptions) {
  const [treeItems, setTreeItems] = useState<TreeItemsMap>(items);

  const { persistDrop } = useTreePersistence(workspaceId);

  useEffect(() => {
    setTreeItems(items);
  }, [items]);

  const canDrag = (dragged: TreeItem<TreeItemData>[]) => {
    return dragged.length === 1 && dragged[0]?.index !== "root";
  };

  const canDropAt = (
    dragged: TreeItem<TreeItemData>[],
    target: DraggingPosition,
  ) => {
    if (dragged.length !== 1) {
      return false;
    }

    const draggedItem = dragged[0];

    if (!draggedItem) {
      return false;
    }

    switch (target.targetType) {
      case "root": {
        const currentParentId = getCurrentParentId(
          treeItems,
          draggedItem.index,
        );

        return currentParentId !== "root";
      }

      case "item": {
        const targetItem = treeItems[target.targetItem];

        if (!targetItem?.isFolder) {
          return false;
        }

        if (
          isSelfOrDescendant(treeItems, draggedItem.index, target.targetItem)
        ) {
          return false;
        }

        const currentParentId = getCurrentParentId(
          treeItems,
          draggedItem.index,
        );

        return currentParentId !== target.targetItem;
      }

      case "between-items": {
        return target.parentItem === "root";
      }

      default:
        return false;
    }
  };
  const handleDrop = async (
    draggedItems: TreeItem<TreeItemData>[],
    target: DraggingPosition,
  ) => {
    if (draggedItems.length !== 1) {
      throw new Error("Only one item can be dragged at a time");
    }

    const draggedItem = draggedItems[0];

    if (!draggedItem) {
      throw new Error("Dragged item is missing");
    }

    let targetParentId: TreeItemIndex;

    switch (target.targetType) {
      case "root":
        targetParentId = "root";
        break;

      case "item":
        targetParentId = target.targetItem;
        break;

      case "between-items":
        if (target.parentItem !== "root") {
          throw new Error("Reordering inside folders is not supported");
        }

        targetParentId = "root";
        break;

      default:
        throw new Error("Invalid drop target");
    }

    const previousItems = treeItems;

    const nextItems = moveTreeItem(
      treeItems,
      draggedItem.index,
      targetParentId,
    );

    setTreeItems(nextItems);

    if (targetParentId !== "root") {
      onExpandFolder?.(targetParentId);
    }

    try {
      await persistDrop(draggedItem, targetParentId, treeItems);

      onDropProp?.([draggedItem], target);
    } catch (error) {
      console.error("Failed to persist tree drop:", error);
      setTreeItems(previousItems);
    }
  };

  return {
    treeItems,
    canDrag,
    canDropAt,
    handleDrop,
  };
}
