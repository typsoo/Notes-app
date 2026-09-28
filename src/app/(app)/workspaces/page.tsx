import { Suspense } from "react";
import {
  WorkspacesList,
  WorkspacesListSkeleton,
} from "@/features/workspaces/components/workspaces-list";
import { CreateWorkspaceDialog } from "@/features/workspaces/components/create-workspace-dialog";

export default function WorkspacesPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
          <p className="text-muted-foreground text-sm">
            Chose or create a workspace to get started.
          </p>
        </div>
        <CreateWorkspaceDialog />
      </div>

      <Suspense fallback={<WorkspacesListSkeleton />}>
        <WorkspacesList />
      </Suspense>
    </div>
  );
}
