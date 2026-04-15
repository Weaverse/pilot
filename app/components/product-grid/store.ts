import { create } from "zustand";

interface ProductGridState {
  displayedCount: number;
  setDisplayedCount: (count: number) => void;
}

export let useProductGridStore = create<ProductGridState>((set) => ({
  displayedCount: 0,
  setDisplayedCount: (count) => set({ displayedCount: count }),
}));
