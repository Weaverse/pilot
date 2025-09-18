import { StarIcon } from "@phosphor-icons/react";
import type { JudgemeRatingDistribution } from "~/types/judgeme";

export function RatingProgressBar({
  rating,
  frequency,
  percentage,
}: JudgemeRatingDistribution) {
  return (
    <div className="grid grid-cols-[35px_1fr_70px] gap-4 py-1 transition-colors">
      {/* Star icon */}
      <div className="flex items-center flex-shrink-0 gap-1">
        <span className="ml-1 text-gray-700">{rating}</span>
        <StarIcon
          weight="fill"
          className="h-4 w-4 text-(--color-star-rating)"
        />
      </div>

      {/* Progress bar */}
      <div className="flex items-center">
        <div className="h-2 w-full overflow-hidden bg-gray-200">
          <div
            className="h-full bg-(--color-star-rating) transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Count */}
      <div className="min-w-[3rem] flex-shrink-0 text-gray-600">
        {frequency} {frequency === 1 ? "review" : "reviews"}
      </div>
    </div>
  );
}
