import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIPreferencesState {
  // Drawer preferences
  drawerWidth: number;
  drawerMinWidth: number;
  drawerMaxWidth: number;

  // Actions
  setDrawerWidth: (width: number) => void;
  resetDrawerWidth: () => void;
}

const DEFAULT_DRAWER_WIDTH = 700;
const MIN_DRAWER_WIDTH = 600;
const MAX_DRAWER_WIDTH = 900;

export const useUIPreferencesStore = create<UIPreferencesState>()(
  persist(
    (set) => ({
      // Initial state
      drawerWidth: DEFAULT_DRAWER_WIDTH,
      drawerMinWidth: MIN_DRAWER_WIDTH,
      drawerMaxWidth: MAX_DRAWER_WIDTH,

      // Actions
      setDrawerWidth: (width: number) =>
        set((state) => ({
          drawerWidth: Math.min(Math.max(width, state.drawerMinWidth), state.drawerMaxWidth),
        })),

      resetDrawerWidth: () =>
        set(() => ({
          drawerWidth: DEFAULT_DRAWER_WIDTH,
        })),
    }),
    {
      name: "ui-preferences",
      partialize: (state) => ({
        drawerWidth: state.drawerWidth,
      }),
    },
  ),
);
