import { Suspense } from "react";
import {
  DocumentServer,
  DocumentEditorSkeleton,
} from "@/features/editor/server-editor";

interface PageProps {
  params: Promise<{ workspaceId: string; id: string }>;
}

export default function EditorDocPage({ params }: PageProps) {
  return (
    <Suspense fallback={<DocumentEditorSkeleton />}>
      {params.then(({ workspaceId, id }) => (
        <DocumentServer id={id} workspaceId={workspaceId} />
      ))}
    </Suspense>
  );
}
