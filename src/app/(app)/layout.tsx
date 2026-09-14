import { AppLayoutShell } from "@/components/layout/app-layout";
import { WorkspaceSidebar } from "@/components/layout/workspace-sidebar";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayoutShell tree={<WorkspaceSidebar />}>{children}</AppLayoutShell>
  );
}
