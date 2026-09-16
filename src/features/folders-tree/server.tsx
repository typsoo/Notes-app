import { api } from "@/trpc/server";
import { buildTreeItems } from "./transform";
import { TreeView } from "./view/view";
import { redirect } from "next/navigation";
import { TRPCError } from "@trpc/server";

export async function FoldersTreeServer() {
  try {
    const workspaces = await api.workspaces.getAll();
    const activeWorkspaceId = workspaces[0]?.id;

    if (!activeWorkspaceId) {
      redirect("/onboarding");
    }

    const [folders, documents] = await Promise.all([
      api.folders.getAll({ workspaceId: activeWorkspaceId }),
      api.documents.getAll({ workspaceId: activeWorkspaceId }),
    ]);

    const items = buildTreeItems(folders, documents);

    return (
      <div className="flex h-full flex-col p-2 select-none">
        <TreeView items={items} workspaceId={activeWorkspaceId} />
      </div>
    );
  } catch (error) {
    if (error instanceof TRPCError && error.code === "UNAUTHORIZED") {
      redirect("/login");
    }
    throw error;
  }
}
