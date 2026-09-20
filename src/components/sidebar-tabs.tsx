"use client";

import { Files, Search } from "lucide-react";
import { type NavItemConfig, NavItem } from "./ui/nav-item";
import { cn } from "@/lib/utils";

const tabItems: NavItemConfig[] = [
  { href: "/", label: "Files", icon: Files, borderLine: false },
  { href: "/search", label: "Search", icon: Search, borderLine: false },
];

export function SidebarTabs({ className }: { className?: string }) {
  return (
    <nav
      className={cn(
        "border-sidebar-border flex items-center justify-center gap-2 border-b p-1",
        className,
      )}
      aria-label="Sidebar tabs"
    >
      {tabItems.map((item) => (
        <NavItem key={item.href} item={item} />
      ))}
    </nav>
  );
}
