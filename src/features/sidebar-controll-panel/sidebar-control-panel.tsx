"use client";

import { FilePlus, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarControl } from "./context";

export function SidebarControlPanel() {
  const { startCreateDocument, startCreateFolder, isCreating } =
    useSidebarControl();

  return (
    <div
      className="border-sidebar-border/40 flex items-center justify-center gap-2 border-b px-2 py-1.5 select-none"
      role="toolbar"
      aria-label="Sidebar controls"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={startCreateDocument}
        disabled={isCreating}
        title="Create document"
        aria-label="Create document"
        className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <FilePlus className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={startCreateFolder}
        disabled={isCreating}
        title="Create folder"
        aria-label="Create folder"
        className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <FolderPlus className="size-4" />
      </Button>
    </div>
  );
}
