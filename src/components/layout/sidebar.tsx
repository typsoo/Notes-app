import { WorkspaceTree } from "@/features/workspace-tree";
import { SidebarTabs } from "@/components/sidebar-tabs";

export function Sidebar() {
  return (
    <div className="flex h-full w-full flex-col">
      <SidebarTabs className="" />
      <WorkspaceTree />
    </div>
  );
}
