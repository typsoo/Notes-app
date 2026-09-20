import { NavLink } from "@/components/ui/nav-link";
import { cn } from "@/lib/utils";

export type NavItemConfig = {
  href: string;
  label: string;
  borderLine: boolean;
  icon: React.ComponentType<{
    className?: string;
  }>;
};

export function NavItem({ item }: { item: NavItemConfig }) {
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
          {item.borderLine && (
            <span
              className={cn(
                "bg-primary absolute top-2.5 bottom-2.5 -left-2 w-0.5 rounded-r transition-all duration-150",
                isActive ? "scale-y-100 opacity-100" : "scale-y-50 opacity-0",
              )}
              aria-hidden="true"
            />
          )}
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
