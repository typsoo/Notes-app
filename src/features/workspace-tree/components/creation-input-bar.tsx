"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreationType } from "../context/tree-control-context";

interface CreationInputBarProps {
  type: CreationType;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export function CreationInputBar({
  type,
  onConfirm,
  onCancel,
}: CreationInputBarProps) {
  const [name, setName] = useState(
    type === CreationType.FOLDER ? "Untitled folder" : "Untitled",
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    const handleWindowKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", handleWindowKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleWindowKeyDown, true);
    };
  }, [onCancel]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();

    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = name.trim();
      if (trimmed) {
        onConfirm(trimmed);
      }
    }
  };

  return (
    <div className="bg-sidebar/50 flex items-center gap-2 border-b px-3 py-1.5 select-none">
      {type === CreationType.FOLDER ? (
        <Folder className="text-muted-foreground size-4 shrink-0" />
      ) : (
        <FileText className="text-muted-foreground size-4 shrink-0" />
      )}

      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          "bg-background text-foreground border-input focus:border-ring h-6 flex-1 rounded border px-2 text-xs transition-colors outline-none",
        )}
        placeholder={
          type === CreationType.FOLDER ? "Folder name" : "Document name"
        }
      />
    </div>
  );
}
