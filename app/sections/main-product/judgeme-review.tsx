import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { forwardRef, useEffect, useState } from "react";
import { useLoaderData } from "react-router";
import { StarRating } from "~/components/star-rating";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";

type JudgemeReviewsData = {
  rating: number;
  reviewNumber: number;
  error?: string;
};

const JudgemeReview = forwardRef<HTMLDivElement, HydrogenComponentProps>(
  (props, ref) => {
    const [data, setData] = useState<JudgemeReviewsData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { product } = useLoaderData<typeof productRouteLoader>();
    const handle = product?.handle;
    const api = usePrefixPathWithLocale(`/api/review/${handle}`);

    useEffect(() => {
      if (!handle) {
        return;
      }

      const fetchReviews = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(api);
          if (response.ok) {
            const reviewsData = (await response.json()) as JudgemeReviewsData;
            setData(reviewsData);
          }
        } catch (error) {
          // Silently handle errors - component will show skeleton or null
        } finally {
          setIsLoading(false);
        }
      };

      fetchReviews();
    }, [handle, api]);

    if (!handle) {
      return null;
    }

    if (isLoading || !data) {
      return (
        <div {...props} ref={ref}>
          <div className="space-x-2">
            <div className="inline-flex items-center gap-1">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-8 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>
      );
    }

    const rating = Math.round((data.rating || 0) * 100) / 100;
    const reviewNumber = data.reviewNumber || 0;

    return (
      <div {...props} ref={ref}>
        <div className="flex items-center gap-2">
          <StarRating rating={rating} />
          <span>({reviewNumber ? reviewNumber : 'No reviews'})</span>
        </div>
      </div>
    );
  },
);

export default JudgemeReview;

export const schema = createSchema({
  type: "judgeme",
  title: "Judgeme review",
});
