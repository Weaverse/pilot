import { create } from "zustand";
import type { JudgemeReviewsData } from "~/types/judgeme";

type JudgemePagination = {
  currentPage: number;
  perPage: number;
};
type JudgemeStatus =
  | "idle"
  | "initial-loading"
  | "page-loading"
  | "error"
  | "ok";

type JudgemeStore = {
  status: JudgemeStatus;
  paging: JudgemePagination;
  data: JudgemeReviewsData | null;
  setStatus: (status: JudgemeStatus) => void;
  setData: (data: JudgemeReviewsData | null) => void;
  setPaging: (newPaging: JudgemePagination) => void;
};

export const useJudgemeStore = create<JudgemeStore>()((set) => ({
  status: "idle",
  paging: { currentPage: 1, perPage: 5 },
  data: null,
  setStatus: (status: JudgemeStatus) => set({ status }),
  setData: (data: JudgemeReviewsData | null) => set({ data }),
  setPaging: (newPaging: JudgemePagination) =>
    set((state) => ({ paging: { ...state.paging, ...newPaging } })),
}));
