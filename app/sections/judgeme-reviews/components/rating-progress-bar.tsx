import { StarIcon } from "@phosphor-icons/react";
import type { RatingProgressBarProps } from "~/types/judgeme-redesigned";

export function RatingProgressBar({ rating, count, totalReviews }: RatingProgressBarProps) {
  const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

  return (
    <div
      data-testid={`rating-${rating}-stars`}
      className="grid grid-cols-[auto_1fr_70px] gap-3 p-2 transition-colors"
    >
      {/* Star icon */}
      <div data-testid="star-icon" className="flex flex-shrink-0 gap-1">
        <span className="ml-1 text-gray-700 text-sm">
          {rating}
        </span>
        <StarIcon
          weight="fill"
          className="h-4 w-4 text-(--color-star-rating)" />
      </div>

      {/* Progress bar */}
      <div className="flex items-center">
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            data-testid="progress-bar"
            className="h-full bg-(--color-star-rating) transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${rating} star reviews: ${count} of ${totalReviews} (${percentage}%)`} />
        </div>
      </div>

      {/* Count */}
      <div
        data-testid="review-count"
        className="min-w-[3rem] flex-shrink-0 text-gray-600 text-sm"
      >
        {count} {count === 1 ? "review" : "reviews"}
      </div>
    </div>
  );
}
