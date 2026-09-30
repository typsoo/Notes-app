import "server-only";

import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { withTrpcRedirects } from "@/server/api/with-trpc-redirect";

import { DocumentClientEditor } from "./client-editor";

interface Props {
  id: string;
  workspaceId: string;
}

export async function DocumentServer({ id, workspaceId }: Props) {
  const doc = await withTrpcRedirects(() =>
    api.documents.getById({ id, workspaceId }),
  );

  if (!doc) {
    notFound();
  }

  return (
    <DocumentClientEditor
      documentId={doc.id}
      workspaceId={doc.workspaceId}
      title={doc.title}
      initialContent={doc.content}
    />
  );
}

export function DocumentEditorSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4 p-8">
      <div className="bg-muted h-10 w-1/3 rounded-md" />
      <div className="space-y-4 pt-4">
        <div className="bg-muted h-4 w-3/4 rounded" />
        <div className="bg-muted h-4 w-1/2 rounded" />
        <div className="bg-muted h-4 w-5/6 rounded" />
        <div className="bg-muted h-4 w-2/3 rounded" />
      </div>
    </div>
  );
}
