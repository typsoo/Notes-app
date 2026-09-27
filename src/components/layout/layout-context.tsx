"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface LayoutContextValue {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  setSidebarToggle: (toggle: (() => void) | null) => void;
  toggleSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarToggle, setSidebarToggle] = useState<(() => void) | null>(null);

  return (
    <LayoutContext
      value={{
        isSidebarOpen,

        setSidebarOpen,
        setSidebarToggle,
        toggleSidebar: () => sidebarToggle?.(),
      }}
    >
      {children}
    </LayoutContext>
  );
}

export function useLayoutContext() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayoutContext must be used within a LayoutProvider");
  }
  return context;
}
