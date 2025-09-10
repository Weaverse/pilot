import { createSchema } from "@weaverse/hydrogen";
import { forwardRef, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useLoaderData } from "react-router";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import { layoutInputs, Section, type SectionProps } from "~/components/section";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";
import type { JudgemeReviewsData } from "~/utils/judgeme";
import ReviewForm from "./review-form";
import { ReviewList } from "./review-list";

interface JudgemeReviewSectionProps extends SectionProps {
  sectionId?: string;
}

const JudgemeReviewSection = forwardRef<HTMLElement, JudgemeReviewSectionProps>(
  (props, ref) => {
    const { children, loaderData, sectionId, ...rest } = props;
    const { product } = useLoaderData<typeof productRouteLoader>();
    const [reviewsData, setReviewsData] = useState<JudgemeReviewsData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentProductHandle, setCurrentProductHandle] = useState<string | null>(null);
    const reviewsAPI = usePrefixPathWithLocale(`/api/reviews/${product?.handle}`);

    const { ref: inViewRef, inView } = useInView({
      triggerOnce: true,
    });

    const setRefs = (node: HTMLDivElement) => {
      if (ref && typeof ref === 'object') {
        ref.current = node;
      } else if (typeof ref === 'function') {
        ref(node);
      }
      inViewRef(node);
    };

    useEffect(() => {
      if (!product?.handle || !inView || isLoading) {
        return;
      }

      // Check if we need to fetch data for a new product
      if (currentProductHandle === product.handle && reviewsData) {
        return;
      }

      setIsLoading(true);
      setError(null);
      setCurrentProductHandle(product.handle);

      fetch(reviewsAPI)
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw new Error(`Failed to fetch reviews: ${res.status}`);
        })
        .then((data: JudgemeReviewsData) => {
          setReviewsData(data);
        })
        .catch((error) => {
          console.error("Error fetching Judge.me reviews:", error);
          setError("Failed to load reviews");
          setReviewsData({ rating: 0, totalReviews: 0, reviews: [] });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, [product?.handle, inView, isLoading, currentProductHandle, reviewsData]);

    if (!product) {
      return null;
    }

    return (
      <Section ref={ref} {...rest} overflow="unset" id={sectionId}>
        {children}
        <div
          ref={setRefs}
          className="grid grid-cols-1 gap-5 md:gap-10 md:grid-cols-3"
        >
          {isLoading ? (
            <>
              <div className="space-y-4">
                <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
                <div className="h-20 w-full animate-pulse rounded bg-gray-200" />
              </div>
              <div className="space-y-4 md:col-span-2">
                <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                      <div className="h-16 w-full animate-pulse rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : error ? (
            <div className="col-span-3 text-center text-gray-500">
              <p>{error}</p>
            </div>
          ) : !reviewsData ? (
            <div className="col-span-3 text-center text-gray-500">
              <p>Loading reviews...</p>
            </div>
          ) : (
            <>
              <ReviewForm reviews={reviewsData} />
              {reviewsData.reviews.length > 0 ? (
                <ReviewList reviews={reviewsData} />
              ) : (
                <div className="text-center text-gray-500 md:col-span-2 pt-10">
                  <p>No reviews yet. Be the first to write a review!</p>
                </div>
              )}
            </>
          )}
        </div>
      </Section>
    );
  },
);

export default JudgemeReviewSection;

export const schema = createSchema({
  type: "judgeme-reviews",
  title: "Judgeme reviews widget",
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
          defaultValue: 'judgeme-reviews-widget',
          helpText: "This ID can be used to scroll to this section from other components",
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
    ],
  },
});
