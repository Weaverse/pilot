import { Star, StarHalf } from "@phosphor-icons/react";

export function StarRating({ rating }: { rating: number }) {
  return (
    <div className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        if (rating >= i + 1) {
          return <Star weight="fill" className="w-4 h-4" key={i} />;
        }
        if (rating >= i + 0.5) {
          return <StarHalf weight="fill" className="w-4 h-4" key={i} />;
        }
        return <Star className="w-4 h-4" key={i} />;
      })}
    </div>
  );
}
