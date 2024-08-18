import { useFetcher, useLoaderData } from "@remix-run/react";
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from "@weaverse/hydrogen";
import { useParentInstance } from "@weaverse/hydrogen";
import { forwardRef, useEffect } from "react";
import { usePrefixPathWithLocale } from "~/lib/utils";
import { StarRating } from "../star-rating";

type JudgemeReviewsData = {
  rating: number;
  reviewNumber: number;
  error?: string;
};

let JudgemeReview = forwardRef<HTMLDivElement, HydrogenComponentProps>(
  (props, ref) => {
    let loaderData = useLoaderData<{
      judgemeReviews: JudgemeReviewsData;
    }>();
    let judgemeReviews = loaderData?.judgemeReviews;
    let { load, data: fetchData } = useFetcher<JudgemeReviewsData>();
    let context = useParentInstance();
    let handle = context?.data?.product?.handle!;
    let api = usePrefixPathWithLocale(`/api/review/${handle}`);

    useEffect(() => {
      if (judgemeReviews || !handle) return;
      load(api);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handle, api]);
    let data = judgemeReviews || fetchData;
    if (!data) return null;
    if (data.error) {
      return (
        <div {...props} ref={ref}>
          {data.error}
        </div>
      );
    }

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
