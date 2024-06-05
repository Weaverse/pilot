import clsx from "clsx";
import { IconStar, IconStarHalf } from "~/modules";

export function Rating({ rating }: { rating: number }) {
  return (
    <div className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        if (rating >= i + 1) return <FilledStar key={i} />;
        if (rating >= i + 0.5) return <HalfFilledStar key={i} />;
        return <EmptyStar key={i} />;
      })}
    </div>
  );
}

function EmptyStar() {
  return <IconStar className="w-4 h-4 text-gray-300" />;
}

function FilledStar({ className }: { className?: string }) {
  return <IconStar className={clsx("w-4 h-4", className)} />;
}

function HalfFilledStar() {
  return (
    <div className="relative">
      <IconStarHalf className="w-4 h-4 absolute top-0 left-0" />
      <EmptyStar />
    </div>
  );
}
