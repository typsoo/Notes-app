import { AppLayoutShell } from "@/components/layout/app-layout";
import { Sidebar } from "@/components/layout/sidebar/sidebar";
import {
  WorkspaceTree,
  WorkspaceTreeSkeleton,
} from "@/features/workspace-tree";
import { Suspense } from "react";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}

export default function WorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  return (
    <AppLayoutShell
      sidebar={
        <Sidebar
          workspaceTree={
            <Suspense fallback={<WorkspaceTreeSkeleton />}>
              {params.then(({ workspaceId }) => (
                <WorkspaceTree workspaceId={workspaceId} />
              ))}
            </Suspense>
          }
        />
      }
    >
      {children}
    </AppLayoutShell>
  );
}
