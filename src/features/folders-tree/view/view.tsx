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
  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>(["root"]);
  const [selectedItems, setSelectedItems] = useState<TreeItemIndex[]>([]);

  const handleExpandFolder = (folderId: TreeItemIndex) => {
    setExpandedItems((prev) =>
      prev.includes(folderId) ? prev : [...prev, folderId],
    );
  };

  const { treeItems, canDrag, canDropAt, handleDrop } = useTreeDnd({
    items,
    workspaceId,
    onDrop,
    onExpandFolder: handleExpandFolder,
  });

  return (
    <div className="h-full w-full overflow-hidden">
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
        <Tree treeId="folders-tree" rootItem="root" treeLabel="Files" />
      </ControlledTreeEnvironment>
    </div>
  );
}
