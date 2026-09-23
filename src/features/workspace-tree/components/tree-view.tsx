"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ControlledTreeEnvironment,
  Tree,
  type TreeItem,
  type TreeItemIndex,
  type DraggingPosition,
} from "react-complex-tree";

import { api } from "@/trpc/react";
import type { TreeItemsMap, TreeItemData } from "../utils/tree-transform";
import { getItemTitle } from "../utils/tree-transform";
import { customTreeRenderers, TreeItemRow } from "./tree-renderers";
import { useTreeDnd } from "../hooks/use-tree-dnd";
import { useTreeCreation } from "../hooks/use-tree-creation";
import { useTreeDeletion } from "../hooks/use-tree-deletion";
import { CreationInputBar } from "./creation-input-bar";

interface TreeViewProps {
  items: TreeItemsMap;
  workspaceId: string;
  onSelectDocument?: (docId: string) => void;
  onDrop?: (items: TreeItem<TreeItemData>[], target: DraggingPosition) => void;
}

export function TreeView({
  items,
  workspaceId,
  onSelectDocument,
  onDrop,
}: TreeViewProps) {
  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>([
    "workspace",
    "root",
  ]);
  const [selectedItems, setSelectedItems] = useState<TreeItemIndex[]>([]);

  const router = useRouter();

  const handleSelectDocument = (docId: string) => {
    onSelectDocument?.(docId);
    router.push(`/editor/${docId}`);
  };

  const handleExpandFolder = (folderId: TreeItemIndex) => {
    setExpandedItems((prev) =>
      prev.includes(folderId) ? prev : [...prev, folderId],
    );
  };

  const { treeItems, setTreeItems, canDrag, canDropAt, handleDrop } =
    useTreeDnd({
      items,
      workspaceId,
      onDrop,
      onExpandFolder: handleExpandFolder,
    });

  const {
    errorMessage: creationErrorMessage,
    clearError: clearCreationError,
    creationType,
    isCreating,
    resetCreation,
    handleConfirmCreation,
  } = useTreeCreation({
    workspaceId,
    treeItems,
    setTreeItems,
    setSelectedItems,
    onSelectDocument: handleSelectDocument,
  });

  const {
    handleDelete,
    errorMessage: deletionErrorMessage,
    clearError: clearDeletionError,
  } = useTreeDeletion({
    workspaceId,
    treeItems,
    setTreeItems,
    setSelectedItems,
    onDeleteSuccess: (removedIds) => {
      if (typeof window === "undefined") return;
      const currentDocId = window.location.pathname.split("/editor/")[1];
      if (currentDocId && removedIds.has(currentDocId)) {
        router.push("/editor");
      }
    },
  });

  const updateFolder = api.folders.update.useMutation();
  const updateDocument = api.documents.update.useMutation();

  const handleRenameItem = async (
    item: TreeItem<TreeItemData>,
    newName: string,
  ) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    const previousTreeItems = treeItems;
    const isFolder = Boolean(item.isFolder);

    setTreeItems((prev) => {
      const current = prev[item.index];
      if (!current) return prev;
      return {
        ...prev,
        [item.index]: {
          ...current,
          data: isFolder
            ? { ...current.data, name: trimmed }
            : { ...current.data, title: trimmed },
        },
      };
    });

    try {
      if (isFolder) {
        await updateFolder.mutateAsync({
          workspaceId,
          id: String(item.index),
          name: trimmed,
        });
      } else {
        await updateDocument.mutateAsync({
          workspaceId,
          id: String(item.index),
          title: trimmed,
        });
      }
    } catch {
      setTreeItems(previousTreeItems);
    }
  };

  const activeErrorMessage = creationErrorMessage ?? deletionErrorMessage;
  const handleClearError = () => {
    clearCreationError();
    clearDeletionError();
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {activeErrorMessage && (
        <div className="border-destructive/20 bg-destructive/10 text-destructive flex items-center justify-between border-b px-3 py-1.5 text-xs select-none">
          <span>{activeErrorMessage}</span>
          <button
            type="button"
            onClick={handleClearError}
            className="text-destructive/80 hover:text-destructive cursor-pointer leading-none font-bold"
            title="Close"
          >
            x
          </button>
        </div>
      )}

      {isCreating && creationType && (
        <CreationInputBar
          type={creationType}
          onConfirm={handleConfirmCreation}
          onCancel={resetCreation}
        />
      )}

      <div className="min-h-0 flex-1 overflow-hidden">
        <ControlledTreeEnvironment<TreeItemData>
          items={treeItems}
          getItemTitle={getItemTitle}
          viewState={{
            "workspace-tree": {
              expandedItems,
              selectedItems,
            },
          }}
          canDragAndDrop={true}
          canDropOnFolder={true}
          canDropOnNonFolder={false}
          canReorderItems={true}
          canRename={true}
          onRenameItem={handleRenameItem}
          canDrag={canDrag}
          canDropAt={canDropAt}
          onExpandItem={(item) => {
            setExpandedItems((prev) =>
              prev.includes(item.index) ? prev : [...prev, item.index],
            );
          }}
          onCollapseItem={(item) => {
            if (item.index === "root" || item.index === "workspace") return;
            setExpandedItems((prev) => prev.filter((id) => id !== item.index));
          }}
          onSelectItems={(itemIds) => {
            setSelectedItems(itemIds);
            const firstId = itemIds[0];
            if (firstId && !treeItems[firstId]?.isFolder) {
              handleSelectDocument(String(firstId));
            }
          }}
          onPrimaryAction={(item) => {
            if (item.index === "root" || item.index === "workspace") return;
            if (item.isFolder) {
              setExpandedItems((prev) =>
                prev.includes(item.index)
                  ? prev.filter((id) => id !== item.index)
                  : [...prev, item.index],
              );
            } else {
              handleSelectDocument(String(item.index));
            }
          }}
          onDrop={handleDrop}
          {...customTreeRenderers}
          renderItem={(props) => (
            <TreeItemRow {...props} onDelete={handleDelete} />
          )}
        >
          <Tree
            treeId="workspace-tree"
            rootItem="workspace"
            treeLabel="Files"
          />
        </ControlledTreeEnvironment>
      </div>
    </div>
  );
}
