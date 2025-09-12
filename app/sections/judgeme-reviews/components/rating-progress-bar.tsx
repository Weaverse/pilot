import { StarIcon } from "@phosphor-icons/react";
import { forwardRef } from "react";
import type { RatingProgressBarProps } from "~/types/judgeme-redesigned";
import { cn } from "~/utils/cn";

export const RatingProgressBar = forwardRef<
  HTMLDivElement,
  RatingProgressBarProps
>(({ rating, count, totalReviews, onClick }, ref) => {
  const percentage =
    totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

  return (
    <div
      ref={ref}
      data-testid={`rating-${rating}-stars`}
      className={cn(
        "flex items-center gap-3 rounded-md p-2 transition-colors",
        onClick && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700",
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {/* Star icon */}
      <div data-testid="star-icon" className="flex-shrink-0">
        <StarIcon
          weight="fill"
          className="h-4 w-4 text-(--color-star-rating)"
        />
        <span className="ml-1 text-gray-700 text-sm dark:text-gray-300">
          {rating}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          data-testid="progress-bar"
          className="h-full bg-(--color-star-rating) transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${rating} star reviews: ${count} of ${totalReviews} (${percentage}%)`}
        />
      </div>

      {/* Count */}
      <div
        data-testid="review-count"
        className="min-w-[3rem] flex-shrink-0 text-right text-gray-600 text-sm dark:text-gray-400"
      >
        {count} {count === 1 ? "review" : "reviews"}
      </div>
    </div>
  );
});

RatingProgressBar.displayName = "RatingProgressBar";
