"use client";

import { useState } from "react";
import {
  ControlledTreeEnvironment,
  Tree,
  type TreeItem,
  type TreeItemIndex,
  type DraggingPosition,
} from "react-complex-tree";

import type { TreeItemsMap, TreeItemData } from "../transform";
import { getItemTitle } from "../transform";
import { customTreeRenderers } from "./renderers";
import { useTreeDnd } from "./use-tree-dnd";
import { useTreeCreation } from "./use-tree-creation";
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
    errorMessage,
    clearError,
    creationType,
    isCreating,
    resetCreation,
    handleConfirmCreation,
  } = useTreeCreation({
    workspaceId,
    treeItems,
    setTreeItems,
    setSelectedItems,
    onSelectDocument,
  });

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {errorMessage && (
        <div className="border-destructive/20 bg-destructive/10 text-destructive flex items-center justify-between border-b px-3 py-1.5 text-xs select-none">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={clearError}
            className="text-destructive/80 hover:text-destructive cursor-pointer leading-none font-bold"
            title="Close"
          >
            ×
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
            "folders-tree": {
              expandedItems,
              selectedItems,
            },
          }}
          canDragAndDrop={true}
          canDropOnFolder={true}
          canDropOnNonFolder={false}
          canReorderItems={true}
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
              onSelectDocument?.(String(firstId));
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
              onSelectDocument?.(String(item.index));
            }
          }}
          onDrop={handleDrop}
          {...customTreeRenderers}
        >
          <Tree treeId="folders-tree" rootItem="workspace" treeLabel="Files" />
        </ControlledTreeEnvironment>
      </div>
    </div>
  );
}
