import { api } from "@/trpc/server";
import { WorkspaceCard } from "./workspace-card";

export async function WorkspacesList() {
  const workspaces = await api.workspaces.getAll();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {workspaces.map((workspace) => (
        <WorkspaceCard key={workspace.id} {...workspace} />
      ))}
    </div>
  );
}

export function WorkspacesListSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <div className="bg-muted h-8 w-44 animate-pulse rounded-lg" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border-border bg-card/60 flex h-16.5 animate-pulse items-center justify-between rounded-lg border p-5"
          >
            <div className="flex items-center gap-3">
              <div className="bg-muted h-5 w-5 rounded" />
              <div className="bg-muted h-4 w-32 rounded" />
            </div>
            <div className="bg-muted h-4 w-4 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
