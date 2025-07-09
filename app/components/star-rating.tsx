import { StarHalfIcon, StarIcon } from "@phosphor-icons/react";

export function StarRating({ rating }: { rating: number }) {
  return (
    <div className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        if (rating >= i + 1) {
          return <StarIcon weight="fill" className="h-4 w-4" key={i} />;
        }
        if (rating >= i + 0.5) {
          return <StarHalfIcon weight="fill" className="h-4 w-4" key={i} />;
        }
        return <StarIcon className="h-4 w-4" key={i} />;
      })}
    </div>
  );
}
