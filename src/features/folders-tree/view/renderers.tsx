"use client";

import type { TreeRenderProps } from "react-complex-tree";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TreeItemData } from "../transform";

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

  renderItemArrow: ({ item, context }) => {
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

  renderItem: ({ depth, children, title, arrow, context }) => (
    <li
      {...context.itemContainerWithChildrenProps}
      className="list-none outline-none"
    >
      <div
        {...context.itemContainerWithoutChildrenProps}
        style={{
          paddingLeft: `${depth * 14 + 6}px`,
        }}
        className={cn(
          "group relative flex h-7 items-center rounded-md pr-2 text-xs transition-colors select-none",
          context.isSelected
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
          context.isFocused && "ring-sidebar-ring/50 ring-1",
          context.isDraggingOver &&
            "bg-sidebar-accent/80 ring-sidebar-ring ring-2 ring-inset",
        )}
      >
        {arrow}

        <button
          {...context.interactiveElementProps}
          type="button"
          className="flex min-w-0 flex-1 cursor-pointer items-center overflow-hidden text-left text-xs outline-none"
        >
          {title}
        </button>
      </div>

      {children}
    </li>
  ),
};
