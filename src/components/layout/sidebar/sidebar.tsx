import { WorkspaceTree } from "@/features/workspace-tree";
import Search from "@/features/search/search";
import { SidebarTab, type SidebarTabId } from "./tabs-data";

import { SidebarContent } from "@/components/layout/sidebar/sidebar-content";

export function Sidebar() {
  const panelMap: Record<SidebarTabId, React.ReactNode> = {
    [SidebarTab.Files]: <WorkspaceTree />,
    [SidebarTab.Search]: <Search />,
  };

  return <SidebarContent panelMap={panelMap} defaultTab={SidebarTab.Files} />;
}
