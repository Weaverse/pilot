import { create } from "zustand";

export const useATCVisibilityStore = create<{
  inView: boolean;
  setInView: (value: boolean) => void;
  scrolledPast: boolean;
  setScrolledPast: (value: boolean) => void;
}>()((set) => ({
  inView: true,
  setInView: (value: boolean) => set({ inView: value }),
  scrolledPast: false,
  setScrolledPast: (value: boolean) => set({ scrolledPast: value }),
}));
