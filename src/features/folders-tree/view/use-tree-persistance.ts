"use client";

import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TreeItem, TreeItemIndex } from "react-complex-tree";

import { api } from "@/trpc/react";

import { getDatabaseId, getDatabaseParentId } from "./tree-mapping";

import type { TreeItemData, TreeItemsMap } from "../transform";

export function useTreePersistence(workspaceId: string) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const updateFolder = api.folders.update.useMutation();
  const updateDocument = api.documents.update.useMutation();

  const persistDrop = useCallback(
    async (
      draggedItem: TreeItem<TreeItemData>,
      targetParentTreeId: TreeItemIndex,
      treeItems: TreeItemsMap,
    ) => {
      const dbId = getDatabaseId(draggedItem);

      if (!dbId) {
        throw new Error(`Tree item "${draggedItem.index}" has no database ID`);
      }

      const newDbParentId = getDatabaseParentId(targetParentTreeId, treeItems);

      const itemData = draggedItem.data;

      if (draggedItem.isFolder && "parentId" in itemData) {
        if (itemData.parentId === newDbParentId) {
          return;
        }

        await updateFolder.mutateAsync({
          workspaceId,
          id: dbId,
          parentId: newDbParentId,
        });
      } else if (!draggedItem.isFolder && "folderId" in itemData) {
        if (itemData.folderId === newDbParentId) {
          return;
        }

        await updateDocument.mutateAsync({
          workspaceId,
          id: dbId,
          folderId: newDbParentId,
        });
      } else {
        throw new Error(`Unsupported tree item "${draggedItem.index}"`);
      }

      startTransition(() => {
        router.refresh();
      });
    },
    [workspaceId, updateFolder, updateDocument, router],
  );

  return { persistDrop };
}
