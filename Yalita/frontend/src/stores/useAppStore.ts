import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UiMode } from "@/lib/copy";

interface AppState {
  // Mobile sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // UI mode (Modo Doña vs técnico)
  uiMode: UiMode;
  setUiMode: (mode: UiMode) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      uiMode: "simple",
      setUiMode: (uiMode) => set({ uiMode }),
    }),
    { name: "quipu-app" }
  )
);
