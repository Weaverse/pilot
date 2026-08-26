import { Icon } from "~/components/icon";
import { cn } from "~/utils/cn";

export function StarRating({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex gap-0.5 text-(--color-product-reviews) [&>svg]:size-4",
        className,
      )}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        if (rating >= i + 1) {
          return <Icon name="star-fill" key={i} />;
        }
        if (rating >= i + 0.5) {
          return <Icon name="star-half-fill" key={i} />;
        }
        return <Icon name="star" key={i} />;
      })}
    </div>
  );
}
