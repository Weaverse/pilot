import {
  IconStar,
  IconStarFilled,
  IconStarHalfFilled,
} from "~/components/icons";

export function Rating({ rating }: { rating: number }) {
  return (
    <div className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        if (rating >= i + 1) {
          return <IconStarFilled className="w-4 h-4" key={i} />;
        }
        if (rating >= i + 0.5) {
          return <IconStarHalfFilled className="w-4 h-4" key={i} />;
        }
        return <IconStar className="w-4 h-4" key={i} />;
      })}
    </div>
  );
}
