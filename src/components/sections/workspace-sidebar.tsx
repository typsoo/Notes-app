import { FoldersTreeServer } from "@/features/folders-tree/server";
import {
  SidebarControlPanel,
  SidebarControlProvider,
} from "@/features/sidebar-controll-panel";

export function WorkspaceSidebar() {
  return (
    <SidebarControlProvider>
      <div className="flex h-full flex-col overflow-hidden">
        <SidebarControlPanel />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <FoldersTreeServer />
        </div>
      </div>
    </SidebarControlProvider>
  );
}
