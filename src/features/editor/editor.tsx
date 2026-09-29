"use client";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

import { useTheme } from "next-themes";

import type { Block } from "@blocknote/core";

export interface EditorProps {
  initialContent?: Block[];
  onChange: (blocks: Block[]) => void;
}

export default function Editor({ initialContent, onChange }: EditorProps) {
  const { resolvedTheme } = useTheme();

  const editor = useCreateBlockNote({
    initialContent:
      initialContent && initialContent.length > 0 ? initialContent : undefined,
  });

  return (
    <BlockNoteView
      editor={editor}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      onChange={() => onChange(editor.document)}
      className="min-h-full"
    />
  );
}
