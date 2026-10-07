import Search from "@/features/search/sidebar-search-view";
import { SidebarTab, type SidebarTabId } from "./tabs-data";

import { SidebarContent } from "@/components/layout/sidebar/sidebar-content";
import { TreeControlPanel } from "@/features/workspace-tree/components/tree-control-panel";
import { TreeControlProvider } from "@/features/workspace-tree/context/tree-control-context";

interface SidebarProps {
  workspaceTree: React.ReactNode;
}

export function Sidebar({ workspaceTree }: SidebarProps) {
  const panelMap: Record<SidebarTabId, React.ReactNode> = {
    [SidebarTab.Files]: (
      <TreeControlProvider>
        <TreeControlPanel />
        {workspaceTree}
      </TreeControlProvider>
    ),
    [SidebarTab.Search]: <Search />,
  };

  return <SidebarContent panelMap={panelMap} defaultTab={SidebarTab.Files} />;
}
