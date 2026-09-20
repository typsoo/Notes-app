import { useState, type Dispatch, type SetStateAction } from "react";
import type { TreeItemIndex } from "react-complex-tree";
import { TRPCClientError } from "@trpc/client";

import { api } from "@/trpc/react";
import type { TreeItemsMap } from "../utils/tree-transform";

export type DeletionResult =
  | { success: true; id: string; isFolder: boolean }
  | { success: false; error: string };

interface UseTreeDeletionOptions {
  workspaceId: string;
  treeItems: TreeItemsMap;
  setTreeItems: Dispatch<SetStateAction<TreeItemsMap>>;
  setSelectedItems?: Dispatch<SetStateAction<TreeItemIndex[]>>;
  onDeleteDocument?: (docId: string) => void;
}

function getDescendantIds(
  items: TreeItemsMap,
  itemId: TreeItemIndex,
): TreeItemIndex[] {
  const item = items[itemId];
  if (!item?.children) return [];
  const result: TreeItemIndex[] = [];
  for (const childId of item.children) {
    result.push(childId);
    result.push(...getDescendantIds(items, childId));
  }
  return result;
}

function removeTreeItem(
  prev: TreeItemsMap,
  targetId: TreeItemIndex,
): TreeItemsMap {
  if (!prev[targetId]) return prev;

  const toRemove = new Set<TreeItemIndex>([
    targetId,
    ...getDescendantIds(prev, targetId),
  ]);

  const next: TreeItemsMap = {};

  for (const [key, item] of Object.entries(prev)) {
    if (toRemove.has(key)) continue;

    if (item.children?.some((childId) => toRemove.has(childId))) {
      next[key] = {
        ...item,
        children: item.children.filter((childId) => !toRemove.has(childId)),
      };
    } else {
      next[key] = item;
    }
  }

  return next;
}

export function useTreeDeletion({
  workspaceId,
  treeItems,
  setTreeItems,
  setSelectedItems,
  onDeleteDocument,
}: UseTreeDeletionOptions) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deleteFolder = api.folders.delete.useMutation();
  const deleteDocument = api.documents.delete.useMutation();

  const isDeleting = deleteFolder.isPending || deleteDocument.isPending;

  const clearError = () => setErrorMessage(null);

  const handleDelete = async (
    itemId: TreeItemIndex,
  ): Promise<DeletionResult> => {
    if (itemId === "root" || itemId === "workspace") {
      return { success: false, error: "Cannot delete system items" };
    }

    const item = treeItems[itemId];
    if (!item) {
      return { success: false, error: "Item not found" };
    }

    const isFolder = Boolean(item.isFolder);
    const previousTreeItems = treeItems;
    const descendantIds = isFolder ? getDescendantIds(treeItems, itemId) : [];
    const allRemovedIds = new Set<TreeItemIndex>([itemId, ...descendantIds]);

    setTreeItems((prev) => removeTreeItem(prev, itemId));

    setSelectedItems?.((prev) =>
      prev.filter((selectedId) => !allRemovedIds.has(selectedId)),
    );

    setErrorMessage(null);

    try {
      if (isFolder) {
        await deleteFolder.mutateAsync({
          workspaceId,
          id: String(itemId),
        });
      } else {
        await deleteDocument.mutateAsync({
          workspaceId,
          id: String(itemId),
        });
        onDeleteDocument?.(String(itemId));
      }

      return {
        success: true,
        id: String(itemId),
        isFolder,
      };
    } catch (error: unknown) {
      setTreeItems(previousTreeItems);

      const message =
        error instanceof TRPCClientError ? error.message : "Internal Error";

      setErrorMessage(message);

      return {
        success: false,
        error: message,
      };
    }
  };

  return {
    errorMessage,
    clearError,
    isDeleting,
    handleDelete,
  };
}
