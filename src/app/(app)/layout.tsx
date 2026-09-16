import { AppLayoutShell } from "@/components/layout/app-layout";
import { WorkspaceSidebar } from "@/components/sections/workspace-sidebar";
import { Suspense } from "react";
import { FoldersTreeSkeleton } from "@/features/folders-tree/server-skeleton";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayoutShell
      tree={
        <Suspense fallback={<FoldersTreeSkeleton />}>
          <WorkspaceSidebar />
        </Suspense>
      }
    >
      {children}
    </AppLayoutShell>
  );
}
