"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Plus, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

function getErrorMessage(error: { message: string }) {
  try {
    const parsed: unknown = JSON.parse(error.message);

    if (Array.isArray(parsed)) {
      const messages = parsed.flatMap((item) => {
        if (typeof item !== "object" || item === null) return [];

        const message = (item as Record<string, unknown>).message;
        return typeof message === "string" ? [message] : [];
      });

      if (messages.length > 0) return messages.join(" ");
    }

    if (typeof parsed === "object" && parsed !== null) {
      const message = (parsed as Record<string, unknown>).message;
      if (typeof message === "string") return message;
    }

    return "We couldn't create your workspace. Please try again later.";
  } catch {
    return error.message;
  }
}

export function CreateWorkspaceDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const utils = api.useUtils();

  const createWorkspace = api.workspaces.create.useMutation({
    onSuccess: async (ws) => {
      setOpen(false);
      await utils.workspaces.getAll.invalidate();
      router.push(`/workspaces/${ws.id}`);
      router.refresh();
    },
  });

  const handleSubmit = (formData: FormData) => {
    const raw = formData.get("name");
    if (typeof raw !== "string") return;
    const name = raw.trim();
    if (!name || createWorkspace.isPending) return;

    createWorkspace.mutate({ name });
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) createWorkspace.reset();
      }}
    >
      <Dialog.Trigger
        render={
          <Button className="gap-2">
            <Plus className="size-4" />
            Create Workspace
          </Button>
        }
      />

      <Dialog.Portal>
        <Dialog.Backdrop className="glass-backdrop data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 z-50 duration-300" />

        <Dialog.Popup className="glass-panel data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-1/2 rounded-2xl p-6 duration-300 ease-out">
          <Dialog.Title className="text-lg font-semibold">
            Create Workspace
          </Dialog.Title>
          <Dialog.Description className="text-muted-foreground mt-1 text-sm">
            Enter a name for your new workspace.
          </Dialog.Description>

          {createWorkspace.error && (
            <div className="bg-destructive/10 text-destructive mt-3 flex items-center justify-between rounded-lg p-2.5 text-sm">
              <span>{getErrorMessage(createWorkspace.error)}</span>
              <button
                type="button"
                onClick={() => createWorkspace.reset()}
                className="hover:opacity-70"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          <form action={handleSubmit} className="mt-4 flex flex-col gap-4">
            <input
              name="name"
              type="text"
              required
              autoFocus
              placeholder="Workspace name"
              disabled={createWorkspace.isPending}
              className="border-input bg-background/50 focus-visible:ring-ring w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-2 disabled:opacity-50"
            />

            <div className="flex justify-end gap-2">
              <Dialog.Close
                render={
                  <Button
                    type="button"
                    variant="outline"
                    disabled={createWorkspace.isPending}
                  >
                    Cancel
                  </Button>
                }
              />
              <Button type="submit" disabled={createWorkspace.isPending}>
                {createWorkspace.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Create
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
