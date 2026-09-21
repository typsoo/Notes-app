"use client";

import { useId } from "react";
import type { SidebarTabId, SidebarTabItem } from "./tabs-data";

interface SidebarTabsProps {
  tabs: readonly SidebarTabItem[];
  activeTab: SidebarTabId;
  changeAction: (tabId: SidebarTabId) => void;
}

export function SidebarTabs({
  tabs,
  activeTab,
  changeAction,
}: SidebarTabsProps) {
  const tablistId = useId();

  return (
    <nav
      role="tablist"
      aria-label="Sidebar views"
      id={tablistId}
      className="border-sidebar-border/80 bg-sidebar/60 flex items-center gap-1 border-t p-1.5 backdrop-blur select-none"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={tab.id}
            id={tab.id}
            onClick={() => changeAction(tab.id)}
            className={`focus-visible:ring-ring/70 relative flex flex-1 items-center justify-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150 outline-none focus-visible:ring-2 ${
              isActive
                ? "border-sidebar-border/50 bg-sidebar-accent text-sidebar-accent-foreground border shadow-sm"
                : "text-muted-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground"
            } `}
          >
            <Icon className="h-4 w-4 shrink-0" />

            <span className="hidden truncate sm:inline">{tab.label}</span>

            {isActive && (
              <span className="absolute right-2 bottom-0 left-2 h-0.5 rounded-full bg-blue-500" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
