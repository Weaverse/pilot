import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useState } from "react";
import { Button } from "~/components/button";
import { StarRating } from "~/components/star-rating";
import { useJudgemeStore } from ".";
import { RatingProgressBar } from "./rating-progress-bar";
import { ReviewForm } from "./review-form";

interface JudgemeReviewSummaryProps extends HydrogenComponentProps {
  ref: React.Ref<HTMLDivElement>;
  averageRatingText?: string;
  totalReviewsText?: string;
  writeReviewText?: string;
  hideFormText?: string;
  noReviewsText?: string;
  errorText?: string;
}

function parseTemplate(
  template: string,
  variables: Record<string, string | number>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key]?.toString() || match;
  });
}

export default function JudgemeReviewSummary(props: JudgemeReviewSummaryProps) {
  const {
    ref,
    averageRatingText = "{{avgRating}} out of 5",
    totalReviewsText = "Based on {{totalReviews}} reviews",
    writeReviewText = "Write a Review",
    hideFormText = "Hide Form",
    noReviewsText = "Be the first to write a review",
    errorText = "Error loading reviews.",
    ...rest
  } = props;
  let { status, data } = useJudgemeStore();
  const [showForm, setShowForm] = useState(false);

  return (
    <div ref={ref} {...rest} className="py-4">
      {status === "initial-loading" || status === "idle" ? (
        // Loading skeleton
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
        <p className="text-center text-red-600">{errorText}</p>
      ) : data && data.totalReviews > 0 ? (
        // Summary with data
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
                  {parseTemplate(averageRatingText, {
                    avgRating: data.averageRating.toFixed(2),
                  })}
                </span>
              </div>
              <div className="text-gray-600 text-sm">
                {parseTemplate(totalReviewsText, {
                  totalReviews: data.totalReviews,
                })}
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
                {showForm ? hideFormText : writeReviewText}
              </Button>
            </div>
          </div>
          <ReviewForm showForm={showForm} setShowForm={setShowForm} />
        </div>
      ) : (
        // No reviews state
        <div className="space-y-12 pt-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 divide-x divide-gray-200">
            {/* Column 1 - Empty Star Rating */}
            <div className="flex items-center justify-end space-y-3 pr-14">
              <div className="flex flex-col gap-2">
                <StarRating rating={0} className="[&>svg]:size-10" />
                <span className="text-gray-500 text-sm">{noReviewsText}</span>
              </div>
            </div>
            {/* Column 3 - Write Review Button */}
            <div className="flex items-center px-8">
              <Button
                variant={showForm ? "outline" : "primary"}
                onClick={() => setShowForm(!showForm)}
                aria-expanded={showForm}
                aria-controls="review-form"
                className="w-64"
              >
                {showForm ? hideFormText : writeReviewText}
              </Button>
            </div>
          </div>
          <ReviewForm showForm={showForm} setShowForm={setShowForm} />
        </div>
      )}
    </div>
  );
}

export const schema = createSchema({
  type: "judgeme-reviews--summary",
  title: "Reviews summary",
  settings: [
    {
      group: "Summary Text Settings",
      inputs: [
        {
          type: "text",
          name: "averageRatingText",
          label: "Average rating text",
          defaultValue: "{{avgRating}} out of 5",
          placeholder: "{{avgRating}} out of 5",
          helpText:
            "Use <strong>{{avgRating}}</strong> to display the average rating value",
        },
        {
          type: "text",
          name: "totalReviewsText",
          label: "Total reviews text",
          defaultValue: "Based on {{totalReviews}} reviews",
          placeholder: "Based on {{totalReviews}} reviews",
          helpText:
            "Use <strong>{{totalReviews}}</strong> to display the total number of reviews",
        },
        {
          type: "text",
          name: "writeReviewText",
          label: "Write review button text",
          defaultValue: "Write a Review",
          placeholder: "Write a Review",
        },
        {
          type: "text",
          name: "hideFormText",
          label: "Hide form button text",
          defaultValue: "Hide Form",
          placeholder: "Hide Form",
        },
        {
          type: "text",
          name: "noReviewsText",
          label: "No reviews message",
          defaultValue: "Be the first to write a review",
          placeholder: "Be the first to write a review",
        },
        {
          type: "text",
          name: "errorText",
          label: "Error message",
          defaultValue: "Error loading reviews.",
          placeholder: "Error loading reviews.",
        },
      ],
    },
  ],
  presets: {},
});
