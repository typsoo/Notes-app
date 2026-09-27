"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Folder, ArrowRight, Plus, Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";

export default function WorkspacesPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const utils = api.useUtils();
  const workspacesQuery = api.workspaces.getAll.useQuery();

  const createWorkspace = api.workspaces.create.useMutation({
    onSuccess: async (newWorkspace) => {
      setName("");
      setIsCreating(false);
      await utils.workspaces.getAll.invalidate();
      router.push(`/workspaces/${newWorkspace.id}`);
    },
  });

  const handleStartCreate = () => {
    setIsCreating(true);
    setName("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setName("");
    createWorkspace.reset();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || createWorkspace.isPending) return;
    createWorkspace.mutate({ name: trimmed });
  };

  if (workspacesQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
            <p className="text-muted-foreground text-sm">
              Загрузка рабочих пространств...
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border-border bg-card/50 h-20 animate-pulse rounded-lg border"
            />
          ))}
        </div>
      </div>
    );
  }

  const workspaces = workspacesQuery.data ?? [];

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
          <p className="text-muted-foreground text-sm">
            Выберите или создайте рабочее пространство
          </p>
        </div>

        {!isCreating && (
          <Button onClick={handleStartCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Добавить новый workspace
          </Button>
        )}
      </div>

      {isCreating && (
        <form
          onSubmit={handleSubmit}
          className="border-sidebar-ring bg-card flex max-w-lg flex-col gap-3 rounded-lg border-2 p-4 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Folder className="text-primary h-5 w-5 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название воркспейса"
              maxLength={256}
              disabled={createWorkspace.isPending}
              className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-2"
              autoFocus
            />
          </div>

          {createWorkspace.error && (
            <p className="text-destructive text-xs font-medium">
              {createWorkspace.error.message}
            </p>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancelCreate}
              disabled={createWorkspace.isPending}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!name.trim() || createWorkspace.isPending}
            >
              {createWorkspace.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Создать"
              )}
            </Button>
          </div>
        </form>
      )}

      {workspaces.length === 0 && !isCreating ? (
        <div className="border-border text-muted-foreground flex h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center">
          <Folder className="h-8 w-8 stroke-1 opacity-50" />
          <p className="text-sm">Нет доступных воркспейсов</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartCreate}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Создать первый workspace
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {workspaces.map((ws) => (
            <Link
              key={ws.id}
              href={`/workspaces/${ws.id}`}
              className="border-border bg-card text-card-foreground hover:border-sidebar-ring hover:bg-accent/40 flex items-center justify-between rounded-lg border p-5 transition-colors"
            >
              <div className="flex items-center gap-3 truncate">
                <Folder className="text-muted-foreground h-5 w-5 shrink-0" />
                <span className="truncate text-base font-medium">
                  {ws.name}
                </span>
              </div>
              <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
