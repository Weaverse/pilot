import {
  type HydrogenComponentProps,
  type HydrogenComponentSchema,
  useParentInstance,
} from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { StarRating } from "~/components/star-rating";
import type { AliReviewsLoaderData } from ".";
import { ReviewBar } from "./review-bar";
import type { AliReview, ReviewItemData } from "./review-item";
import { ReviewItem } from "./review-item";

type AliReviewsProps = ReviewItemData & {
  showAvgRating: boolean;
  showReviewsCount: boolean;
  showReviewsProgressBar: boolean;
  reviewsToShow: number;
  showReviewWithMediaOnly: boolean;
};

let ReviewList = forwardRef<
  HTMLDivElement,
  AliReviewsProps & HydrogenComponentProps
>((props, ref) => {
  let {
    children,
    showAvgRating,
    showReviewsCount,
    showReviewsProgressBar,
    reviewsToShow,
    showReviewWithMediaOnly,
    showCountry,
    showDate,
    showVerifiedBadge,
    verifiedBadgeText,
    showStar,
    ...rest
  } = props;
  let parent = useParentInstance();
  let allReviews: AliReviewsLoaderData = parent.data.loaderData;
  if (allReviews?.length) {
    let { totalReviews, avgRating, reviewsByRating } =
      getReviewsSummary(allReviews);
    let reviewsToRender = Array.from(allReviews);
    if (showReviewWithMediaOnly) {
      reviewsToRender = reviewsToRender.filter((rv) => rv.media.length > 0);
    }
    reviewsToRender = reviewsToRender.slice(0, reviewsToShow);

    return (
      <div
        ref={ref}
        {...rest}
        className="md:flex md:gap-16 space-y-8 md:space-y-0"
      >
        <div className="my-6 space-y-6 md:my-8 shrink-0" data-motion="slide-in">
          <div className="shrink-0 flex gap-4">
            {showAvgRating && (
              <div className="text-6xl font-bold leading-none">
                {avgRating.toFixed(1)}
              </div>
            )}
            <div className="flex flex-col gap-1.5 justify-center">
              <StarRating rating={avgRating} />
              {showReviewsCount && (
                <div className="text-sm font-medium leading-none text-gray-500">
                  {totalReviews} reviews
                </div>
              )}
            </div>
          </div>
          {showReviewsProgressBar && (
            <div className="mt-6 min-w-0 flex-1 space-y-3 sm:mt-0">
              {Object.entries(reviewsByRating)
                .sort((a, b) => Number(b[0]) - Number(a[0]))
                .map(([rating, ratingData]) => (
                  <ReviewBar
                    key={rating}
                    rating={Number(rating)}
                    {...ratingData}
                  />
                ))}
            </div>
          )}
        </div>
        <div
          className="mt-6 divide-y divide-gray-200 grow"
          data-motion="slide-in"
        >
          {reviewsToRender.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              showCountry={showCountry}
              showDate={showDate}
              showVerifiedBadge={showVerifiedBadge}
              verifiedBadgeText={verifiedBadgeText}
              showStar={showStar}
            />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div ref={ref} {...rest}>
      <div className="p-8 text-center">No reviews available</div>
    </div>
  );
});

export default ReviewList;

export let schema: HydrogenComponentSchema = {
  type: "ali-reviews--list",
  title: "Reviews list",
  inspector: [
    {
      group: "Summary section",
      inputs: [
        {
          type: "switch",
          name: "showAvgRating",
          label: "Show average rating",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "showReviewsCount",
          label: "Show reviews count",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "showReviewsProgressBar",
          label: "Show reviews progress bars",
          defaultValue: true,
        },
      ],
    },
    {
      group: "Review list",
      inputs: [
        {
          type: "range",
          name: "reviewsToShow",
          label: "Reviews to show",
          defaultValue: 5,
          configs: {
            min: 1,
            max: 20,
            step: 1,
          },
        },
        {
          type: "switch",
          name: "showReviewWithMediaOnly",
          label: "Show review with media only",
          defaultValue: false,
        },
      ],
    },
    {
      group: "Review item",
      inputs: [
        {
          type: "switch",
          name: "showCountry",
          label: "Show country",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "showDate",
          label: "Show date",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "showVerifiedBadge",
          label: "Show verified badge",
          defaultValue: true,
        },
        {
          type: "text",
          name: "verifiedBadgeText",
          label: "Verified badge text",
          defaultValue: "Verified purchase",
          condition: "showVerifiedBadge.eq.true",
        },
        {
          type: "switch",
          name: "showStar",
          label: "Show star",
          defaultValue: true,
        },
      ],
    },
  ],
};

function getReviewsSummary(allReviews: AliReview[]) {
  let totalReviews = allReviews.length;
  let avgRating =
    totalReviews > 0
      ? allReviews.reduce((acc, curr) => acc + curr.star, 0) / totalReviews
      : 0;
  let reviewsByRating = allReviews.reduce(
    (acc, curr) => {
      if (curr.star) {
        acc[curr.star].count += 1;
        acc[curr.star].avg = acc[curr.star].count / totalReviews;
      }
      return acc;
    },
    {
      5: { count: 0, avg: 0 },
      4: { count: 0, avg: 0 },
      3: { count: 0, avg: 0 },
      2: { count: 0, avg: 0 },
      1: { count: 0, avg: 0 },
    } as {
      [rating: number]: {
        count: number;
        avg: number;
      };
    }
  );
  return {
    totalReviews,
    avgRating,
    reviewsByRating,
  };
}
