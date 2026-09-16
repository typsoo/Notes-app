"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export const CreationType = {
  DOCUMENT: "document",
  FOLDER: "folder",
} as const;

export type CreationType = (typeof CreationType)[keyof typeof CreationType];

interface SidebarControlContextValue {
  creationType: CreationType | null;
  isCreating: boolean;
  startCreateDocument: () => void;
  startCreateFolder: () => void;
  cancelCreation: () => void;
  resetCreation: () => void;
}

const SidebarControlContext = createContext<SidebarControlContextValue | null>(
  null,
);

export function SidebarControlProvider({ children }: { children: ReactNode }) {
  const [creationType, setCreationType] = useState<CreationType | null>(null);

  const startCreateDocument = () => setCreationType(CreationType.DOCUMENT);
  const startCreateFolder = () => setCreationType(CreationType.FOLDER);
  const cancelCreation = () => setCreationType(null);
  const resetCreation = () => setCreationType(null);

  return (
    <SidebarControlContext.Provider
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
    </SidebarControlContext.Provider>
  );
}

export function useSidebarControl() {
  const context = useContext(SidebarControlContext);
  if (!context) {
    throw new Error(
      "useSidebarControl must be used within a SidebarControlProvider",
    );
  }
  return context;
}
