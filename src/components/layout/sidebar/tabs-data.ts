import { FileIcon, SearchIcon, type LucideIcon } from "lucide-react";

export const SidebarTab = {
  Documents: "documents",
  Search: "search",
} as const;

export type SidebarTabId = (typeof SidebarTab)[keyof typeof SidebarTab];

export interface SidebarTabItem {
  id: SidebarTabId;
  label: string;
  icon: LucideIcon;
}

export const SIDEBAR_TABS: readonly SidebarTabItem[] = [
  { id: SidebarTab.Documents, label: "Documents", icon: FileIcon },
  { id: SidebarTab.Search, label: "Search", icon: SearchIcon },
];
