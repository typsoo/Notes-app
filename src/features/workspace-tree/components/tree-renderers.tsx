"use client";

import type {
  TreeRenderProps,
  TreeItemIndex,
  TreeItemRenderContext,
} from "react-complex-tree";
import { ChevronRight, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TreeItemData, AppTreeItem } from "../utils/tree-transform";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";

export interface TreeItemRowProps {
  depth: number;
  children: React.ReactNode;
  title: React.ReactNode;
  arrow: React.ReactNode;
  context: TreeItemRenderContext;
  item: AppTreeItem;
  onDelete?: (itemId: TreeItemIndex) => void;
}

export function TreeItemRow({
  depth,
  children,
  title,
  arrow,
  context,
  item,
  onDelete,
}: TreeItemRowProps) {
  const isRoot = item.index === "root";
  const isWorkspace = item.index === "workspace";
  const visualDepth = isRoot ? 0 : Math.max(0, depth - 1);
  const isSystemItem = isRoot || isWorkspace;

  const itemContent = (
    <div
      {...context.itemContainerWithoutChildrenProps}
      style={{
        paddingLeft: `${visualDepth * 14 + 6}px`,
      }}
      className={cn(
        "group relative flex h-7 items-center rounded-md pr-2 text-xs transition-colors select-none",
        context.isSelected && !isRoot
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
        context.isFocused && !isRoot && "ring-sidebar-ring/50 ring-1",
        context.isDraggingOver &&
          "bg-sidebar-accent/80 ring-sidebar-ring ring-2 ring-inset",
        isRoot && "text-muted-foreground cursor-default font-medium",
      )}
    >
      {arrow}

      {context.isRenaming ? (
        <div
          {...context.interactiveElementProps}
          className="flex min-w-0 flex-1 items-center overflow-hidden text-left text-xs outline-none"
        >
          {title}
        </div>
      ) : (
        <button
          {...context.interactiveElementProps}
          type="button"
          className={cn(
            "flex min-w-0 flex-1 items-center overflow-hidden text-left text-xs outline-none",
            isRoot ? "cursor-default" : "cursor-pointer",
          )}
        >
          {title}
        </button>
      )}
    </div>
  );

  return (
    <li
      {...context.itemContainerWithChildrenProps}
      className="list-none outline-none"
    >
      {!isSystemItem ? (
        <ContextMenu>
          <ContextMenuTrigger render={itemContent} />
          <ContextMenuContent>
            <ContextMenuItem onClick={() => context.startRenamingItem()}>
              <Pencil />
              <span>Rename</span>
            </ContextMenuItem>
            <ContextMenuItem
              variant="destructive"
              onClick={() => onDelete?.(item.index)}
            >
              <Trash2 />
              <span>{item.isFolder ? "Delete Folder" : "Delete Document"}</span>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ) : (
        itemContent
      )}

      {children}
    </li>
  );
}

export const customTreeRenderers: TreeRenderProps<TreeItemData> = {
  renderTreeContainer: ({ children, containerProps }) => (
    <div
      {...containerProps}
      className="h-full w-full overflow-y-auto outline-none select-none"
    >
      <div className="space-y-0.5 py-1">{children}</div>
    </div>
  ),

  renderItemsContainer: ({ children, containerProps }) => (
    <ul {...containerProps} className={cn("m-0 list-none p-0")}>
      {children}
    </ul>
  ),

  renderDragBetweenLine: ({ draggingPosition, lineProps }) => (
    <div
      {...lineProps}
      className="bg-sidebar-ring pointer-events-none absolute -top-0.5 right-2 z-20 h-0.5 rounded-full"
      style={{
        left: `${draggingPosition.depth * 14 + 6}px`,
      }}
    />
  ),

  renderItemArrow: ({ item, context }) => {
    if (item.index === "root") {
      return null;
    }

    if (!item.isFolder) {
      return <span className="size-5 shrink-0" />;
    }

    return (
      <button
        {...context.arrowProps}
        type="button"
        className="text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-foreground flex size-5 shrink-0 items-center justify-center rounded transition-colors"
      >
        <ChevronRight
          className={cn(
            "size-3.5 transition-transform duration-150",
            context.isExpanded && "rotate-90",
          )}
        />
      </button>
    );
  },

  renderItemTitle: ({ title }) => {
    return <span className="truncate">{title}</span>;
  },

  renderRenameInput: ({ inputProps, inputRef, formProps }) => (
    <form {...formProps} className="flex min-w-0 flex-1 items-center">
      <input
        {...inputProps}
        ref={inputRef}
        className="bg-background text-foreground ring-sidebar-ring h-5 w-full rounded border px-1.5 text-xs ring-1 outline-none"
      />
    </form>
  ),
};
