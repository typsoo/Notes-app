import { api } from "@/trpc/server";
import { notFound } from "next/navigation";

interface EditorDocPageProps {
  params: Promise<{ id: string }>;
}

export default function EditorDocPage({ params }: EditorDocPageProps) {
  return <DocContent params={params} />;
}

async function DocContent({ params }: EditorDocPageProps) {
  const { id } = await params;

  const workspaces = await api.workspaces.getAll();
  const activeWorkspaceId = workspaces[0]?.id;

  if (!activeWorkspaceId) {
    notFound();
  }

  try {
    const doc = await api.documents.getById({
      workspaceId: activeWorkspaceId,
      id,
    });

    return (
      <div className="flex flex-col gap-4 p-8">
        <h1 className="text-3xl font-bold tracking-tight">{doc.title}</h1>
        <div className="text-muted-foreground text-base whitespace-pre-wrap">
          {doc.content || "Empty document"}
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
