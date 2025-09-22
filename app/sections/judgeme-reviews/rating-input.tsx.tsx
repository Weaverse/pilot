import { StarIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { cn } from "~/utils/cn";

interface RatingInputProps {
  label: string;
  required?: boolean;
  name?: string;
  rating: number;
  onRatingChange: (rating: number) => void;
}

export function RatingInput({
  label,
  required,
  name = "rating",
  rating,
  onRatingChange,
}: RatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="space-y-2">
      <label
        htmlFor="judgeme-rating"
        className="block font-medium text-gray-700 text-sm"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input id="judgeme-rating" type="hidden" name={name} value={rating} />
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            id={`judgeme-rating-${value}`}
            onClick={() => onRatingChange(value)}
            onMouseEnter={() => setHoverRating(value)}
            onMouseLeave={() => setHoverRating(0)}
            className={cn(
              "p-1 transition-all duration-200",
              value <= (hoverRating || rating)
                ? "scale-110 text-(--color-product-reviews)"
                : "text-gray-300 hover:scale-105 hover:text-(--color-product-reviews)",
            )}
            aria-label={`Rate ${value} star${value !== 1 ? "s" : ""}`}
            aria-pressed={value === rating}
          >
            <StarIcon
              weight={value <= (hoverRating || rating) ? "fill" : "regular"}
              className="h-8 w-8"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
