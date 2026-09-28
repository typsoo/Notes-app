"use client";

import { useState, type KeyboardEvent, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Folder, ArrowRight, Loader2, Pencil, Trash2 } from "lucide-react";
import { NavLink } from "@/components/ui/nav-link";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import type { Route } from "next";

interface WorkspaceCardProps {
  id: string;
  name: string;
}

export function WorkspaceCard({ id, name }: WorkspaceCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);

  const router = useRouter();

  const deleteWorkspace = api.workspaces.delete.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const updateWorkspace = api.workspaces.update.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      router.refresh();
    },
  });

  const handleSaveRename = () => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === name) {
      setEditName(name);
      setIsEditing(false);
      return;
    }
    updateWorkspace.mutate({ id, name: trimmed });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveRename();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditName(name);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="border-border bg-card/60 flex items-center justify-between rounded-lg border p-3.5">
        <div className="flex w-full items-center gap-3">
          <Folder className="text-muted-foreground h-5 w-5 shrink-0" />
          <input
            type="text"
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveRename}
            onKeyDown={handleKeyDown}
            disabled={updateWorkspace.isPending}
            className="border-input focus-visible:ring-ring w-full rounded border bg-transparent px-2 py-1 text-sm outline-none focus-visible:ring-1"
          />
        </div>
        {updateWorkspace.isPending && (
          <Loader2 className="text-muted-foreground ml-2 h-4 w-4 shrink-0 animate-spin" />
        )}
      </div>
    );
  }

  const href = `/workspaces/${id}` as Route;

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <NavLink
            href={href}
            className={({ isPending }) =>
              cn(
                "flex items-center justify-between rounded-lg border p-4 transition-all duration-150 ease-out select-none",
                "hover:bg-muted/50 hover:-translate-y-0.5 hover:border-blue-500",
                (isPending || deleteWorkspace.isPending) &&
                  "pointer-events-none opacity-60",
              )
            }
          >
            {({ isPending }) => (
              <>
                <div className="flex items-center gap-3 truncate">
                  <Folder className="text-muted-foreground h-5 w-5 shrink-0" />
                  <span className="truncate text-sm font-medium">{name}</span>
                </div>
                {isPending || deleteWorkspace.isPending ? (
                  <Loader2 className="text-muted-foreground h-4 w-4 shrink-0 animate-spin" />
                ) : (
                  <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0" />
                )}
              </>
            )}
          </NavLink>
        }
      />

      <ContextMenuContent>
        <ContextMenuItem
          disabled={deleteWorkspace.isPending || updateWorkspace.isPending}
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            setEditName(name);
            setIsEditing(true);
          }}
        >
          <Pencil className="size-3.5" />
          Rename
        </ContextMenuItem>
        <ContextMenuItem
          variant="destructive"
          disabled={deleteWorkspace.isPending || updateWorkspace.isPending}
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            deleteWorkspace.mutate({ id });
          }}
        >
          <Trash2 className="size-3.5" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
