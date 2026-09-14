"use client";

import React, { useState } from "react";
import {
  ControlledTreeEnvironment,
  Tree,
  type TreeItemIndex,
} from "react-complex-tree";
import type { TreeItemsMap, TreeItemData } from "./transform";
import { getItemTitle } from "./transform";
import { customTreeRenderers } from "./renderers";

interface TreeViewProps {
  items: TreeItemsMap;
  onSelectDocument?: (docId: string) => void;
}

export function TreeView({ items, onSelectDocument }: TreeViewProps) {
  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>(["root"]);
  const [selectedItems, setSelectedItems] = useState<TreeItemIndex[]>([]);

  return (
    <div className="h-full w-full overflow-hidden">
      <ControlledTreeEnvironment<TreeItemData>
        items={items}
        getItemTitle={getItemTitle}
        viewState={{
          "folders-tree": {
            expandedItems,
            selectedItems,
          },
        }}
        canDragAndDrop={false}
        canDropOnFolder={false}
        canReorderItems={false}
        onExpandItem={(item) => {
          setExpandedItems((prev) => [...prev, item.index]);
        }}
        onCollapseItem={(item) => {
          setExpandedItems((prev) => prev.filter((id) => id !== item.index));
        }}
        onSelectItems={(itemIds) => {
          setSelectedItems(itemIds);
          const firstId = itemIds[0];
          if (firstId && !items[firstId]?.isFolder) {
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

        {...customTreeRenderers}
      >
        <Tree treeId="folders-tree" rootItem="root" treeLabel="Files" />
      </ControlledTreeEnvironment>
    </div>
  );
}
