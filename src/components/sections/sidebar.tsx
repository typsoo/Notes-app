"use client";

import { Home, Settings } from "lucide-react";
import { type NavItemConfig, NavItem } from "@/components/ui/nav-item";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SidebarToggle } from "@/components/ui/sidebar-toggle";

const mainNavItems: NavItemConfig[] = [
  { href: "/", label: "Home", icon: Home },
];

const bottomNavItems: NavItemConfig[] = [
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SideBar({
  isOpen,
  onToggleFiles,
}: {
  isOpen: boolean;
  onToggleFiles: () => void;
}) {
  return (
    <aside
      className="border-sidebar-border bg-sidebar sticky top-0 flex h-screen w-14 shrink-0 flex-col items-center justify-between border-r px-2 py-3 select-none"
      aria-label="Sidebar navigation"
    >
      <nav className="flex flex-col items-center gap-2" aria-label="Main">
        <SidebarToggle isOpen={isOpen} onToggle={onToggleFiles} />
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
