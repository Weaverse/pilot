import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useState } from "react";
import { Button } from "~/components/button";
import { StarRating } from "~/components/star-rating";
import { useJudgemeStore } from ".";
import { RatingProgressBar } from "./rating-progress-bar";
import { ReviewForm } from "./review-form";

export default function JudgemeReviewSummary(
  props: HydrogenComponentProps & { ref: React.Ref<HTMLDivElement> },
) {
  const { ref, ...rest } = props;
  let { status, data } = useJudgemeStore();
  const [showForm, setShowForm] = useState(false);

  // Only show loading skeleton on initial load
  const showLoadingSkeleton = status === "initial-loading";

  return (
    <div ref={ref} {...rest} className="py-4">
      {(status === "ok" || data) && data ? (
        <div className="space-y-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_2fr_1fr]">
            {/* Column 1 - Main Summary */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="flex flex-col items-center gap-2">
                <StarRating
                  rating={data.averageRating}
                  className="[&>svg]:size-10"
                />
                <span className="font-semibold text-gray-900 text-xl">
                  {data.averageRating.toFixed(2)} out of 5
                </span>
              </div>
              <div className="text-gray-600 text-sm">
                Based on {data.totalReviews}{" "}
                {data.totalReviews === 1 ? "review" : "reviews"}
              </div>
            </div>

            {/* Column 2 - Ratings Breakdown */}
            <div className="border-gray-200 md:border-x px-8 md:px-12 py-2">
              <div className="w-full space-y-0.5">
                {data.ratingDistribution.map(
                  ({ rating, frequency, percentage }) => (
                    <div key={rating} className="w-full">
                      <RatingProgressBar
                        rating={rating}
                        frequency={frequency}
                        percentage={percentage}
                      />
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Column 3 - Write Review Button */}
            <div className="flex items-center justify-center px-8">
              <Button
                variant={showForm ? "outline" : "primary"}
                onClick={() => setShowForm(!showForm)}
                aria-expanded={showForm}
                aria-controls="review-form"
                className="w-full"
              >
                {showForm ? "Hide Form" : "Write a Review"}
              </Button>
            </div>
          </div>
          <ReviewForm showForm={showForm} setShowForm={setShowForm} />
        </div>
      ) : showLoadingSkeleton ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_3fr_2fr]">
            {/* Column 1 - Main Summary Skeleton */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="flex gap-3">
                {[...new Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-200 size-10 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Column 2 - Ratings Breakdown Skeleton */}
            <div className="border-gray-200 border-r border-l px-8 py-2">
              <div className="w-full space-y-4">
                {[...new Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 w-full">
                    <div className="bg-gray-200 size-6 rounded animate-pulse" />
                    <div className="bg-gray-200 h-2.5 flex-1 rounded animate-pulse" />
                    <div className="bg-gray-200 h-4 w-20 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3 - Write Review Button Skeleton */}
            <div className="flex items-center justify-center px-6">
              <div className="bg-gray-200 h-10 w-full rounded animate-pulse" />
            </div>
          </div>
        </div>
      ) : status === "error" ? (
        <p className="text-center text-red-600">Error loading reviews.</p>
      ) : (
        <p className="text-center text-gray-600">No reviews available.</p>
      )}
    </div>
  );
}

export const schema = createSchema({
  type: "judgeme-reviews--summary",
  title: "Reviews summary",
  settings: [],
  presets: {},
});
