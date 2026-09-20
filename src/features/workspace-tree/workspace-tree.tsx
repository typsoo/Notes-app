import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { buildTreeItems } from "./utils/tree-transform";
import { TreeView } from "./components/tree-view";
import { TreeControlPanel } from "./components/tree-control-panel";
import { TreeControlProvider } from "./context/tree-control-context";
import { Suspense } from "react";

export function WorkspaceTree() {
  return (
    <TreeControlProvider>
      <div className="flex h-full flex-col overflow-hidden">
        <TreeControlPanel />

        <div className="min-h-0 flex-1 overflow-y-auto p-2 select-none">
          <Suspense fallback={<WorkspaceTreeSkeleton />}>
            <WorkspaceTreeContent />
          </Suspense>
        </div>
      </div>
    </TreeControlProvider>
  );
}

async function WorkspaceTreeContent() {
  try {
    const workspaces = await api.workspaces.getAll();
    const activeWorkspaceId = workspaces[0]?.id;

    if (!activeWorkspaceId) redirect("/onboarding");

    const [folders, documents] = await Promise.all([
      api.folders.getAll({ workspaceId: activeWorkspaceId }),
      api.documents.getAll({ workspaceId: activeWorkspaceId }),
    ]);

    const items = buildTreeItems(folders, documents);
    return <TreeView items={items} workspaceId={activeWorkspaceId} />;
  } catch (error) {
    if (error instanceof TRPCError && error.code === "UNAUTHORIZED") {
      redirect("/login");
    }
    throw error;
  }
}

const SKELETON_ITEMS = [
  { depth: 0, width: "w-28" },
  { depth: 1, width: "w-36" },
  { depth: 1, width: "w-24" },
  { depth: 2, width: "w-32" },
  { depth: 0, width: "w-24" },
  { depth: 1, width: "w-28" },
  { depth: 1, width: "w-20" },
];

export function WorkspaceTreeSkeleton() {
  return (
    <div className="animate-pulse space-y-0.5 py-1" aria-busy="true">
      {SKELETON_ITEMS.map((item, index) => (
        <div
          key={index}
          style={{ paddingLeft: `${item.depth * 14 + 6}px` }}
          className="flex h-7 items-center gap-1.5 rounded-md pr-2"
        >
          <div className="bg-muted size-4 shrink-0 rounded" />
          <div className={`bg-muted h-3.5 rounded ${item.width}`} />
        </div>
      ))}
    </div>
  );
}
