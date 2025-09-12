import { forwardRef } from "react";
import type { ReviewsListProps } from "~/types/judgeme-redesigned";
import { ReviewItem } from "./review-item";
import { ReviewPagination } from "./review-pagination";

export const ReviewsList = forwardRef<HTMLDivElement, ReviewsListProps>(
  (
    {
      reviews,
      isLoading,
      pagination,
      onPageChange,
      onImageClick,
      maxReviewLength,
    },
    ref,
  ) => {
    if (isLoading) {
      return (
        <div ref={ref} data-testid="reviews-loading" className="space-y-6">
          {/* Loading skeletons */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 md:p-6 dark:border-gray-700 dark:bg-gray-800/50"
            >
              <div className="flex gap-4 md:gap-6">
                <div className="w-full flex-shrink-0 md:w-1/4">
                  <div className="h-5 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="mt-2 h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="mt-1 h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="flex-1">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (reviews.length === 0) {
      return (
        <div
          ref={ref}
          data-testid="no-filtered-reviews"
          className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-12 text-center dark:border-gray-700 dark:bg-gray-800/50"
        >
          <svg
            className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="mb-4 font-medium text-gray-600 dark:text-gray-400">
            No reviews match your current filters.
          </p>
          <button
            data-testid="clear-filters"
            className="inline-flex items-center rounded-md border border-transparent bg-blue-50 px-4 py-2 font-medium text-blue-700 text-sm transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
            onClick={() => {
              // This would typically be handled by parent component
              window.location.search = "";
            }}
          >
            Clear all filters
          </button>
        </div>
      );
    }

    return (
      <div ref={ref} data-testid="reviews-list" className="space-y-4">
        {/* Reviews */}
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              onImageClick={onImageClick}
              showReviewerEmail={true}
              showReviewDate={true}
              showVerificationBadge={true}
              maxReviewLength={maxReviewLength}
            />
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 border-gray-200 border-t pt-6 dark:border-gray-700">
            <ReviewPagination
              pagination={pagination}
              onPageChange={onPageChange}
              style="numbered"
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    );
  },
);

ReviewsList.displayName = "ReviewsList";
