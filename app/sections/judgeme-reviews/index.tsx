import { createSchema } from "@weaverse/hydrogen";
import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useLoaderData } from "react-router";
import { layoutInputs, Section, type SectionProps } from "~/components/section";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { loader as productRouteLoader } from "~/routes/products/product";
import type { JudgemeReviewsData } from "~/types/judgeme";
import { constructURL } from "~/utils/misc";
import { useJudgemeStore } from "./store";

interface JudgemeReviewSectionProps extends SectionProps {
  ref: React.Ref<HTMLElement>;
  sectionId?: string;
}

export default function JudgemeReviewSection(props: JudgemeReviewSectionProps) {
  const { ref, children, sectionId, ...rest } = props;
  const { product } = useLoaderData<typeof productRouteLoader>();
  const { paging, data, setStatus, setData, setPaging } = useJudgemeStore();
  const reviewsAPI = usePrefixPathWithLocale(
    `/api/product/${product?.handle}/reviews`,
  );
  const previousHandleRef = useRef<string | undefined>(product?.handle);

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation> --- IGNORE ---
  useEffect(() => {
    if (product?.handle) {
      // Check if product handle changed
      const handleChanged = previousHandleRef.current !== product.handle;
      if (handleChanged) {
        // Reset pagination and clear data for new product
        previousHandleRef.current = product.handle;
        setPaging({ currentPage: 1, perPage: 5 });
        setData(null);
        setStatus("idle");
        // Don't fetch yet - let the effect run again with reset pagination
        return;
      }

      if (inView) {
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
          .then((d: JudgemeReviewsData | null) => {
            if (d) {
              setData(d);
              setStatus("ok");
            } else {
              setData({
                reviews: [],
                totalPage: 0,
                currentPage: 1,
                perPage: paging.perPage,
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: [],
              });
              setStatus("ok");
            }
          })
          .catch((err) => {
            console.error("Error fetching Judge.me reviews:", err);
            setStatus("error");
            setData(null);
          });
      }
    }
  }, [product?.handle, inView, paging]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset store when component unmounts
  useEffect(() => {
    return () => {
      setStatus("idle");
      setData(null);
      setPaging({ currentPage: 1, perPage: 5 });
    };
  }, []);

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
}

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
        {
          type: "heading",
          label: "Colors",
          helpText:
            "Colors settings for product reviews are global and can be found in <strong>Theme settings > Colors > Others</strong>",
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
