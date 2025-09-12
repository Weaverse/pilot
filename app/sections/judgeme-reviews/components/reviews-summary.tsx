import { forwardRef } from "react";
import { Button } from "~/components/button";
import { StarRating } from "~/components/star-rating";
import type { ReviewsSummaryProps } from "~/types/judgeme-redesigned";
import { RatingProgressBar } from "./rating-progress-bar";

export const ReviewsSummary = forwardRef<HTMLDivElement, ReviewsSummaryProps>(
  ({ summary, onToggleForm, showForm, enableReviewForm }, ref) => {
    if (!summary || summary.totalReviews === 0) {
      return (
        <div
          ref={ref}
          data-testid="reviews-summary"
          className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800/50"
        >
          <div data-testid="empty-reviews-state">
            <h3 className="mb-2 font-semibold text-gray-900 text-lg dark:text-gray-100">
              No reviews yet
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Be the first to write a review!
            </p>
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
      <div
        ref={ref}
        data-testid="reviews-summary"
        className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="space-y-6">
          {/* Header with total and average */}
          <div className="space-y-2 text-center">
            <div
              data-testid="total-reviews"
              className="text-gray-600 text-sm dark:text-gray-400"
            >
              {summary.totalReviews}{" "}
              {summary.totalReviews === 1 ? "review" : "reviews"}
            </div>

            <div className="flex items-center justify-center gap-2">
              <StarRating rating={summary.averageRating} />
              <span
                data-testid="average-rating"
                className="font-semibold text-gray-900 text-lg dark:text-gray-100"
              >
                {summary.averageRating.toFixed(2)} out of 5
              </span>
            </div>
          </div>

          {/* Ratings breakdown */}
          <div data-testid="ratings-breakdown" className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <RatingProgressBar
                key={rating}
                rating={rating}
                count={
                  summary.ratingDistribution[
                    rating as keyof typeof summary.ratingDistribution
                  ]
                }
                totalReviews={summary.totalReviews}
              />
            ))}
          </div>

          {/* Write review button */}
          {enableReviewForm && (
            <div className="border-gray-200 border-t pt-4 dark:border-gray-700">
              <Button
                data-testid="write-review-button"
                variant="primary"
                onClick={onToggleForm}
                aria-expanded={showForm}
                aria-controls="review-form"
                className="w-full"
              >
                {showForm ? "Hide Form" : "Write a Review"}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  },
);

ReviewsSummary.displayName = "ReviewsSummary";
