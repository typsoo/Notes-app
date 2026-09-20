"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export const CreationType = {
  DOCUMENT: "document",
  FOLDER: "folder",
} as const;

export type CreationType = (typeof CreationType)[keyof typeof CreationType];

interface TreeControlContextValue {
  creationType: CreationType | null;
  isCreating: boolean;
  startCreateDocument: () => void;
  startCreateFolder: () => void;
  cancelCreation: () => void;
  resetCreation: () => void;
}

const TreeControlContext = createContext<TreeControlContextValue | null>(null);

export function TreeControlProvider({ children }: { children: ReactNode }) {
  const [creationType, setCreationType] = useState<CreationType | null>(null);

  const startCreateDocument = () => setCreationType(CreationType.DOCUMENT);
  const startCreateFolder = () => setCreationType(CreationType.FOLDER);
  const cancelCreation = () => setCreationType(null);
  const resetCreation = () => setCreationType(null);

  return (
    <TreeControlContext.Provider
      value={{
        creationType,
        isCreating: creationType !== null,
        startCreateDocument,
        startCreateFolder,
        cancelCreation,
        resetCreation,
      }}
    >
      {children}
    </TreeControlContext.Provider>
  );
}

export function useTreeControl() {
  const context = useContext(TreeControlContext);
  if (!context) {
    throw new Error("useTreeControl must be used within a TreeControlProvider");
  }
  return context;
}
