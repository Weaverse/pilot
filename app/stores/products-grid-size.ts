import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORAGE_KEY = "collection-grid-size";

interface GridSizeStore {
  gridSizeDesktop: number;
  gridSizeMobile: number;
  /** Whether the user has explicitly changed the grid size */
  userOverride: boolean;
  /** Number of currently visible products (updates as pages load) */
  visibleCount: number;
  setGridSize: (size: number) => void;
  setVisibleCount: (count: number) => void;
  initialize: (desktop: number, mobile: number) => void;
}

export const useProductsGridSizeStore = create<GridSizeStore>()(
  persist(
    (set, get) => ({
      gridSizeDesktop: 3,
      gridSizeMobile: 1,
      userOverride: false,
      visibleCount: 0,
      setGridSize: (size) =>
        set((state) => ({
          userOverride: true,
          gridSizeDesktop: size > 2 ? size : state.gridSizeDesktop,
          gridSizeMobile: size <= 2 ? size : state.gridSizeMobile,
        })),
      setVisibleCount: (count) => set({ visibleCount: count }),
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
      partialize: (state) => ({
        gridSizeDesktop: state.gridSizeDesktop,
        gridSizeMobile: state.gridSizeMobile,
        userOverride: state.userOverride,
      }),
    },
  ),
);
