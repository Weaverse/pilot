import { create } from "zustand";

type CartDrawerStore = {
  isOpen: boolean;
  toggle: (open?: boolean) => void;
};

export const useCartDrawerStore = create<CartDrawerStore>()((set) => ({
  isOpen: false,
  toggle: (open) =>
    set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),
}));
