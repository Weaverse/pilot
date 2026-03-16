import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORAGE_KEY = "collection-grid-size";

interface GridSizeStore {
  gridSizeDesktop: number;
  gridSizeMobile: number;
  /** Whether the user has explicitly changed the grid size */
  userOverride: boolean;
  setGridSize: (size: number) => void;
  initialize: (desktop: number, mobile: number) => void;
}

export const useGridSizeStore = create<GridSizeStore>()(
  persist(
    (set, get) => ({
      gridSizeDesktop: 3,
      gridSizeMobile: 1,
      userOverride: false,
      setGridSize: (size) =>
        set((state) => ({
          userOverride: true,
          gridSizeDesktop: size > 2 ? size : state.gridSizeDesktop,
          gridSizeMobile: size <= 2 ? size : state.gridSizeMobile,
        })),
      initialize: (desktop, mobile) => {
        // Only apply defaults if the user hasn't made a choice
        if (!get().userOverride) {
          set({
            gridSizeDesktop: Number(desktop) || 3,
            gridSizeMobile: Number(mobile) || 1,
          });
        }
      },
    }),
    {
      name: STORAGE_KEY,
    },
  ),
);
