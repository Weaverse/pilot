import { create } from "zustand";

interface GridSizeStore {
  gridSizeDesktop: number;
  gridSizeMobile: number;
  setGridSizeDesktop: (size: number) => void;
  setGridSizeMobile: (size: number) => void;
  setGridSize: (size: number) => void;
  initialize: (desktop: number, mobile: number) => void;
}

export const useGridSizeStore = create<GridSizeStore>()((set) => ({
  gridSizeDesktop: 3,
  gridSizeMobile: 1,
  setGridSizeDesktop: (size) => set({ gridSizeDesktop: size }),
  setGridSizeMobile: (size) => set({ gridSizeMobile: size }),
  setGridSize: (size) =>
    set((state) => ({
      gridSizeDesktop: size > 2 ? size : state.gridSizeDesktop,
      gridSizeMobile: size <= 2 ? size : state.gridSizeMobile,
    })),
  initialize: (desktop, mobile) =>
    set({
      gridSizeDesktop: Number(desktop) || 3,
      gridSizeMobile: Number(mobile) || 1,
    }),
}));
