"use client";

import { Home, FileText, Settings } from "lucide-react";
import { NavLink } from "@/components/ui/nav-link";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface NavItemConfig {
  href: "/" | "/notes" | "/settings";
  label: string;
  icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
    "aria-hidden"?: boolean | "true" | "false";
  }>;
}

const mainNavItems: NavItemConfig[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/notes", label: "Notes", icon: FileText },
];

const bottomNavItems: NavItemConfig[] = [
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavItem({ item }: { item: NavItemConfig }) {
  const Icon = item.icon;

  return (
    <NavLink
      href={item.href}
      title={item.label}
      aria-label={item.label}
      className={({ isActive }) =>
        cn(
          "group relative flex size-10 items-center justify-center rounded-lg transition-all duration-150 outline-none select-none",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border border font-bold shadow-xs"
            : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground border border-transparent",
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "bg-primary absolute top-2.5 bottom-2.5 -left-2 w-0.5 rounded-r transition-all duration-150",
              isActive ? "scale-y-100 opacity-100" : "scale-y-50 opacity-0",
            )}
            aria-hidden="true"
          />

          <Icon
            className={cn(
              "size-5 shrink-0 transition-all duration-150",
              isActive
                ? "text-foreground stroke-2"
                : "text-muted-foreground group-hover:text-sidebar-accent-foreground stroke-[1.25]",
            )}
            aria-hidden="true"
          />

          <span className="sr-only">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export function SideBar() {
  return (
    <aside
      className="border-sidebar-border bg-sidebar sticky top-0 flex h-screen w-14 shrink-0 flex-col items-center justify-between border-r px-2 py-3 select-none"
      aria-label="Sidebar navigation"
    >
      <nav className="flex flex-col items-center gap-2" aria-label="Main">
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
