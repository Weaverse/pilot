import {
  createSchema,
  type HydrogenComponentProps,
  useParentInstance,
} from "@weaverse/hydrogen";
import { forwardRef, useEffect } from "react";
import { useFetcher, useLoaderData } from "react-router";
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
    const { productReviews } = useLoaderData<typeof productRouteLoader>();
    const { load, data: fetchData } = useFetcher<JudgemeReviewsData>();
    const context = useParentInstance();
    const handle = context?.data?.product?.handle;
    const api = usePrefixPathWithLocale(`/api/review/${handle}`);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation> --- IGNORE ---
    useEffect(() => {
      if (productReviews || !handle) {
        return;
      }
      load(api);
    }, [handle, api]);

    const data = productReviews || fetchData;

    if (!data) {
      return null;
    }

    const rating = Math.round((data.rating || 0) * 100) / 100;
    const reviewNumber = data.reviewNumber || 0;

    return (
      <div {...props} ref={ref}>
        <div className="space-x-2">
          <StarRating rating={rating} />
          <span className="align-top">({reviewNumber})</span>
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
