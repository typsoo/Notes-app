import { AppLayoutShell } from "@/components/layout/app-layout";
import { Sidebar } from "@/components/layout/sidebar";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayoutShell sidebar={<Sidebar />}>{children}</AppLayoutShell>;
}
