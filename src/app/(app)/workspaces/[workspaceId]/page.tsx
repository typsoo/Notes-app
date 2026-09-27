import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { notFound, redirect } from "next/navigation";
import { FileEdit } from "lucide-react";
import { Suspense } from "react";

interface WorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <WorkspacePageContent params={params} />
    </Suspense>
  );
}

async function WorkspacePageContent({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;

  try {
    const workspace = await api.workspaces.getById({ id: workspaceId });

    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <div className="border-border bg-muted/40 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border">
          <FileEdit className="text-muted-foreground h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight">
          {workspace.name}
        </h2>
        <p className="text-muted-foreground mt-1 max-w-sm text-sm">
          Choose a document from the sidebar or create a new one to get started.
        </p>
      </div>
    );
  } catch (error) {
    if (error instanceof TRPCError) {
      if (error.code === "UNAUTHORIZED") {
        redirect("/login");
      }
      if (error.code === "NOT_FOUND" || error.code === "BAD_REQUEST") {
        notFound();
      }
    }
    throw error;
  }
}

function WorkspacePageSkeleton() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <div className="bg-muted mb-4 h-14 w-14 animate-pulse rounded-2xl" />
      <div className="bg-muted h-5 w-36 animate-pulse rounded" />
      <div className="bg-muted mt-2 h-4 w-72 max-w-full animate-pulse rounded" />
    </div>
  );
}
