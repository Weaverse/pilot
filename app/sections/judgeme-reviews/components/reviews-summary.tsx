import { Button } from "~/components/button";
import { StarRating } from "~/components/star-rating";
import type { ReviewsSummaryProps } from "~/types/judgeme-redesigned";
import { RatingProgressBar } from "./rating-progress-bar";

export function ReviewsSummary({
  summary,
  onToggleForm,
  showForm,
  enableReviewForm,
}: ReviewsSummaryProps) {

  if (!summary || summary.totalReviews === 0) {
    return (
      <div data-testid="reviews-summary" className="p-6 text-center">
        <div data-testid="empty-reviews-state">
          <h3 className="mb-2 font-semibold text-gray-900 text-lg">
            No reviews yet
          </h3>
          <p className="mb-4 text-gray-600">Be the first to write a review!</p>
          {enableReviewForm && (
            <Button
              data-testid="write-review-button"
              variant="primary"
              onClick={onToggleForm}
              aria-expanded={showForm}
              aria-controls="review-form"
            >
              Write a Review
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="reviews-summary" className="p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_3fr_2fr]">
        {/* Column 1 - Main Summary */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="flex flex-col items-center gap-2">
            <StarRating rating={summary.averageRating} className="[&>svg]:size-10" />
            <span
              data-testid="average-rating"
              className="font-semibold text-gray-900 text-xl"
            >
              {summary.averageRating.toFixed(2)} out of 5
            </span>
          </div>
          <div data-testid="total-reviews" className="text-gray-600 text-sm">
            Based on {summary.totalReviews}{" "}
            {summary.totalReviews === 1 ? "review" : "reviews"}
          </div>
        </div>

        {/* Column 2 - Ratings Breakdown */}
        <div
          data-testid="ratings-breakdown"
          className="border-gray-200 border-r border-l px-8 py-6"
        >
          <div className="w-full space-y-1">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="w-full">
                <RatingProgressBar
                  rating={rating}
                  count={
                    summary.ratingDistribution[
                    rating as keyof typeof summary.ratingDistribution
                    ]
                  }
                  totalReviews={summary.totalReviews}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Column 3 - Write Review Button */}
        <div className="flex items-center justify-center px-6">
          {enableReviewForm && (
            <Button
              data-testid="write-review-button"
              variant={showForm ? "outline" : "primary"}
              onClick={onToggleForm}
              aria-expanded={showForm}
              aria-controls="review-form"
              className="w-full"
            >
              {showForm ? "Hide Form" : "Write a Review"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
