import { create } from "zustand";

type CartDrawerStore = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: (open?: boolean) => void;
};

export const useCartDrawerStore = create<CartDrawerStore>()((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: (open) =>
    set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),
}));
