import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { forwardRef, useEffect, useState } from "react";
import { useLoaderData } from "react-router";
import { StarRating } from "~/components/star-rating";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";
import type { JudgemeBadgeApiResponse, JudgemeBadgeData } from "~/types/judgeme";

const JudgemeReviewsBadge = forwardRef<HTMLDivElement, HydrogenComponentProps>(
  (props, ref) => {
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<JudgemeBadgeData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { product } = useLoaderData<typeof productRouteLoader>();
    const handle = product?.handle;
    const api = usePrefixPathWithLocale(`/api/review/${handle}?type=badge`);

    useEffect(() => {
      if (!handle) {
        return;
      }

      setIsLoading(true);
      fetch(api)
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw new Error("Response not ok");
        })
        .then((response: JudgemeBadgeApiResponse) => {
          if (response.ok) {
            setData(response.data);
          } else {
            const errorResponse = response as { ok: false; error: string };
            setError(errorResponse.error);
          }
        })
        .catch((error) => {
          console.error("Error fetching Judge.me badge data:", error);
          setError("Failed to fetch Judge.me badge data");
        })
        .finally(() => {
          setIsLoading(false);
        });
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

    if (error) {
      return (
        <div {...props} ref={ref}>
          <div className="text-gray-500">
            Unable to load reviews
          </div>
        </div>
      );
    }

    return (
      <div {...props} ref={ref}>
        <div className="flex items-center gap-2">
          <StarRating rating={data?.averageRating} />
          <span>({data?.totalReviews ? data.totalReviews : 'No reviews'})</span>
        </div>
      </div>
    );
  },
);

export default JudgemeReviewsBadge;

export const schema = createSchema({
  type: "judgeme-reviews-badge",
  title: "Judgeme review",
});
