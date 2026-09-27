import { AppLayoutShell } from "@/components/layout/app-layout";
import { LayoutProvider } from "@/components/layout/layout-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <AppLayoutShell>{children}</AppLayoutShell>
    </LayoutProvider>
  );
}
