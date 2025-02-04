import { useFetcher, useLoaderData } from "@remix-run/react";
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from "@weaverse/hydrogen";
import { useParentInstance } from "@weaverse/hydrogen";
import { forwardRef, useEffect } from "react";
import { StarRating } from "~/components/star-rating";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";

type JudgemeReviewsData = {
  rating: number;
  reviewNumber: number;
  error?: string;
};

let JudgemeReview = forwardRef<HTMLDivElement, HydrogenComponentProps>(
  (props, ref) => {
    let { productReviews } = useLoaderData<typeof productRouteLoader>();
    let { load, data: fetchData } = useFetcher<JudgemeReviewsData>();
    let context = useParentInstance();
    let handle = context?.data?.product?.handle;
    let api = usePrefixPathWithLocale(`/api/review/${handle}`);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
      if (productReviews || !handle) return;
      load(api);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handle, api]);

    let data = productReviews || fetchData;

    if (!data) return null;

    let rating = Math.round((data.rating || 0) * 100) / 100;
    let reviewNumber = data.reviewNumber || 0;

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

export let schema: HydrogenComponentSchema = {
  type: "judgeme",
  title: "Judgeme review",
  inspector: [
    {
      group: "Judgeme",
      inputs: [],
    },
  ],
};
