import { FileIcon, SearchIcon, type LucideIcon } from "lucide-react";

export const SidebarTab = {
  Files: "files",
  Search: "search",
} as const;

export type SidebarTabId = (typeof SidebarTab)[keyof typeof SidebarTab];

export interface SidebarTabItem {
  id: SidebarTabId;
  label: string;
  icon: LucideIcon;
}

export const SIDEBAR_TABS: readonly SidebarTabItem[] = [
  { id: SidebarTab.Files, label: "Files", icon: FileIcon },
  { id: SidebarTab.Search, label: "Search", icon: SearchIcon },
];
