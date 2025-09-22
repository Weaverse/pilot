import { createSchema } from "@weaverse/hydrogen";
import { forwardRef, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useLoaderData } from "react-router";
import { create } from "zustand";
import { layoutInputs, Section, type SectionProps } from "~/components/section";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";
import type { JudgemeReviewsData } from "~/types/judgeme";
import { constructURL } from "~/utils/misc";

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

interface JudgemeReviewSectionProps extends SectionProps {
  sectionId?: string;
}

const JudgemeReviewSection = forwardRef<HTMLElement, JudgemeReviewSectionProps>(
  (props, ref) => {
    const { children, sectionId, ...rest } = props;
    const { product } = useLoaderData<typeof productRouteLoader>();
    const { paging, data, setStatus, setData, setPaging } = useJudgemeStore();
    const reviewsAPI = usePrefixPathWithLocale(
      `/api/product/${product?.handle}/reviews`,
    );

    const { ref: inViewRef, inView } = useInView({
      triggerOnce: true,
    });

    const setRefs = (node: HTMLDivElement) => {
      if (ref && typeof ref === "object") {
        ref.current = node;
      } else if (typeof ref === "function") {
        ref(node);
      }
      inViewRef(node);
    };

    // Reset pagination when product handle changes
    useEffect(() => {
      if (product?.handle) {
        setPaging({ currentPage: 1, perPage: 5 });
        setData(null); // Clear previous product's reviews
      }
    }, [product?.handle, setPaging, setData]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation> --- IGNORE ---
    useEffect(() => {
      if (!(product?.handle && inView)) {
        return;
      }

      // If this is the first load (no data yet), show initial loading state
      // If we have data already, show page loading state
      const isFirstLoad = !data;
      setStatus(isFirstLoad ? "initial-loading" : "page-loading");

      fetch(
        constructURL(reviewsAPI, {
          page: paging.currentPage,
          per_page: paging.perPage,
        }),
      )
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw new Error(`Failed to fetch reviews: ${res.status}`);
        })
        .then((d: JudgemeReviewsData) => {
          setData(d);
          setStatus("ok");
        })
        .catch((err) => {
          console.error("Error fetching Judge.me reviews:", err);
          setStatus("error");
          setData(null);
        });
    }, [product?.handle, inView, paging]);

    if (!product) {
      return null;
    }

    return (
      <div ref={setRefs}>
        <Section as="div" ref={ref} {...rest} overflow="unset" id={sectionId}>
          {children}
        </Section>
      </div>
    );
  },
);

export default JudgemeReviewSection;

export const schema = createSchema({
  type: "judgeme-reviews",
  title: "Judgeme reviews widget",
  childTypes: [
    "heading",
    "paragraph",
    "judgeme-reviews--summary",
    "judgeme-reviews--list",
  ],
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [
    {
      group: "General",
      inputs: [
        {
          type: "text",
          name: "sectionId",
          label: "Section ID",
          placeholder: "judgeme-reviews-widget",
          defaultValue: "judgeme-reviews-widget",
          helpText:
            "This ID can be used to scroll to this section from other components",
        },
      ],
    },
    {
      group: "Layout",
      inputs: layoutInputs.filter((inp) => inp.name !== "borderRadius"),
    },
  ],
  presets: {
    children: [
      {
        type: "heading",
        content: "Customer Reviews",
      },
      {
        type: "paragraph",
        content: "Read what our customers are saying about this product.",
      },
      {
        type: "judgeme-reviews--summary",
      },
      {
        type: "judgeme-reviews--list",
      },
    ],
  },
});
