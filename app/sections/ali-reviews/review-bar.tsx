import { StarIcon } from "@phosphor-icons/react";

export function ReviewBar(review: {
  rating: number;
  count: number;
  avg: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <p className="w-2 shrink-0 text-start font-medium text-gray-900 text-sm leading-none">
        {review.rating}
      </p>
      <StarIcon className="h-4 w-4 shrink-0" />
      <div className="h-1.5 w-72 max-w-80 rounded-full bg-gray-200">
        <div
          className="h-1.5 rounded-full bg-gray-800"
          style={{ width: `${review.avg * 100}%` }}
        />
      </div>
      <div className="w-8 shrink-0 text-right font-medium text-body-700 text-sm leading-none sm:w-auto sm:text-left">
        {review.count} <span className="hidden sm:inline">reviews</span>
      </div>
    </div>
  );
}
