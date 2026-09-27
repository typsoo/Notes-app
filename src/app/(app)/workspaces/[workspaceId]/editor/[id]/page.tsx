"use client";

import { use, useEffect, useRef, useState } from "react";
import { Editor } from "@/features/editor/dynamicEditor";

import { api } from "@/trpc/react";

interface EditorDocPageProps {
  params: Promise<{ workspaceId: string; id: string }>;
}

export default function EditorDocPage({ params }: EditorDocPageProps) {
  const { workspaceId, id } = use(params);
  const documentQuery = api.documents.getById.useQuery({
    workspaceId,
    id,
  });

  if (documentQuery.isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!documentQuery.data) {
    return <div className="p-8">Document not found.</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-8">
      <h1 className="text-3xl font-bold tracking-tight">
        {documentQuery.data.title}
      </h1>
      <div className="text-muted-foreground text-base whitespace-pre-wrap">
        <DocumentEditor
          documentId={documentQuery.data.id}
          workspaceId={workspaceId}
          initialContent={documentQuery.data.content}
        />
      </div>
      <Editor />
    </div>
  );
}

interface DocumentEditorProps {
  documentId: string;
  workspaceId: string;
  initialContent: string;
}

function DocumentEditor({
  documentId,
  workspaceId,
  initialContent,
}: DocumentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateDocument = api.documents.update.useMutation();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function handleChange(value: string) {
    setContent(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      console.log("Updating document with content:", value);
      updateDocument.mutate({
        id: documentId,
        workspaceId,
        content: value,
      });
    }, 400);
  }

  return (
    <textarea
      className="h-64 w-full resize-none rounded-md border p-2"
      value={content}
      onChange={(event) => handleChange(event.target.value)}
    />
  );
}
