"use client";

import { useEffect, useRef } from "react";
import type { Block } from "@blocknote/core";
import { api } from "@/trpc/react";
import { Editor } from "@/features/editor/dynamicEditor";

interface Props {
  documentId: string;
  workspaceId: string;
  title: string;
  initialContent: Block[];
}

export function DocumentClientEditor({
  documentId,
  workspaceId,
  title,
  initialContent,
}: Props) {
  const updateMutation = api.documents.update.useMutation();
  const pendingContentRef = useRef<Block[] | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = (blocks: Block[]) => {
    updateMutation.mutate({
      id: documentId,
      workspaceId,
      content: blocks,
    });
    pendingContentRef.current = null;
  };

  const handleChange = (blocks: Block[]) => {
    pendingContentRef.current = blocks;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      save(blocks);
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (pendingContentRef.current) {
        save(pendingContentRef.current);
      }
    };
  }, [documentId]);

  return (
    <div className="flex flex-col gap-4 p-8">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <Editor
        key={documentId}
        initialContent={initialContent}
        onChange={handleChange}
      />
    </div>
  );
}
