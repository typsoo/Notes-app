import { useState, type Dispatch, type SetStateAction } from "react";
import type { TreeItemIndex } from "react-complex-tree";

import {
  useSidebarControl,
  CreationType,
} from "@/features/sidebar-controll-panel";
import { api } from "@/trpc/react";
import type { TreeItemsMap, AppTreeItem } from "../transform";
import { TRPCClientError } from "@trpc/client";

export type CreationResult =
  | { success: true; id: string; isFolder: boolean }
  | { success: false; error: string };

interface UseTreeCreationOptions {
  workspaceId: string;
  treeItems: TreeItemsMap;
  setTreeItems: Dispatch<SetStateAction<TreeItemsMap>>;
  setSelectedItems: Dispatch<SetStateAction<TreeItemIndex[]>>;
  onSelectDocument?: (docId: string) => void;
}

function replaceTempItem(
  prev: TreeItemsMap,
  tempId: string,
  newItem: AppTreeItem,
): TreeItemsMap {
  if (!prev[tempId]) return prev;
  const next = { ...prev };
  delete next[tempId];
  next[newItem.index] = newItem;
  if (next.root) {
    next.root = {
      ...next.root,
      children:
        next.root.children?.map((id) => (id === tempId ? newItem.index : id)) ??
        [],
    };
  }
  return next;
}

export function useTreeCreation({
  workspaceId,
  treeItems,
  setTreeItems,
  setSelectedItems,
  onSelectDocument,
}: UseTreeCreationOptions) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { creationType, isCreating, resetCreation } = useSidebarControl();

  const createFolder = api.folders.create.useMutation();
  const createDocument = api.documents.create.useMutation();

  const clearError = () => setErrorMessage(null);

  const handleConfirmCreation = async (
    name: string,
  ): Promise<CreationResult> => {
    if (!creationType) {
      return { success: false, error: "Creation type is not selected" };
    }
    const isFolder = creationType === CreationType.FOLDER;
    const trimmedName = name.trim();
    if (!trimmedName) {
      return { success: false, error: "Name cannot be empty" };
    }

    const previousTreeItems = treeItems;
    const tempId = crypto.randomUUID();

    const tempItem: AppTreeItem = {
      index: tempId,
      isFolder,
      data: isFolder
        ? { id: tempId, name: trimmedName }
        : { id: tempId, title: trimmedName },
      children: isFolder ? [] : undefined,
    };

    setTreeItems((prev) => {
      if (!prev.root) return prev;
      return {
        ...prev,
        [tempId]: tempItem,
        root: {
          ...prev.root,
          children: [tempId, ...(prev.root.children ?? [])],
        },
      };
    });

    resetCreation();
    setErrorMessage(null);

    try {
      let createdItem: AppTreeItem;

      if (isFolder) {
        const createdFolder = await createFolder.mutateAsync({
          workspaceId,
          name: trimmedName,
          parentId: null,
        });

        createdItem = {
          index: createdFolder.id,
          isFolder: true,
          data: createdFolder,
          children: [],
        };
      } else {
        const createdDocument = await createDocument.mutateAsync({
          workspaceId,
          title: trimmedName,
          folderId: null,
        });

        createdItem = {
          index: createdDocument.id,
          isFolder: false,
          data: createdDocument,
        };
      }

      setTreeItems((prev) => replaceTempItem(prev, tempId, createdItem));
      setSelectedItems([createdItem.index]);

      if (!isFolder) {
        onSelectDocument?.(String(createdItem.index));
      }

      return {
        success: true,
        id: String(createdItem.index),
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
    creationType,
    isCreating,
    resetCreation,
    handleConfirmCreation,
  };
}
