"use client";

import { Home, Settings } from "lucide-react";
import { type NavItemConfig, NavItem } from "./ui/nav-item";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SidebarToggle } from "./sidebar-toggle";

const mainNavItems: NavItemConfig[] = [
  { href: "/workspaces", label: "Home", icon: Home, borderLine: true },
];

const bottomNavItems: NavItemConfig[] = [
  { href: "/settings", label: "Settings", icon: Settings, borderLine: true },
];

export function NavigationRail({
  isOpen,
  onToggleSidebar,
}: {
  isOpen: boolean;
  onToggleSidebar: () => void;
}) {
  return (
    <aside
      className="border-sidebar-border bg-sidebar sticky top-0 flex h-screen w-14 shrink-0 flex-col items-center justify-between border-r px-2 py-3 select-none"
      aria-label="Navigation rail"
    >
      <nav className="flex flex-col items-center gap-2" aria-label="Main">
        <SidebarToggle isOpen={isOpen} onToggle={onToggleSidebar} />
        {mainNavItems.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </nav>

      <nav className="flex flex-col items-center gap-2" aria-label="Settings">
        <ThemeToggle />
        {bottomNavItems.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </nav>
    </aside>
  );
}
