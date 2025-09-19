import { Image } from "~/components/image";
import { StarRating } from "~/components/star-rating";
import type { JudgeMeReviewType } from "~/types/judgeme";
import { cn } from "~/utils/cn";
import { formatDate } from "~/utils/misc";

function truncateEmail(email: string) {
  const [username, domain] = email.split("@");
  if (username.length <= 3) {
    return email;
  }

  const visibleChars = Math.min(3, username.length - 1);
  const masked = `${username.slice(0, visibleChars)}***`;
  return `${masked}@${domain}`;
}

export function ReviewItem({
  review,
  className,
}: {
  review: JudgeMeReviewType;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group flex flex-col md:flex-row gap-4 md:gap-6",
        className,
      )}
    >
      {/* Left column - Reviewer info */}
      <div className="space-y-3 w-full flex-shrink-0 md:w-1/4">
        <StarRating rating={review.rating} className="[&>svg]:size-4.5" />
        <div className="space-y-1">
          <div className="font-semibold text-gray-900 text-lg/none">
            {review.reviewer.name}
          </div>
          <div className="font-medium text-gray-500">
            {truncateEmail(review.reviewer.email)}
          </div>
        </div>
      </div>

      {/* Right column - Review content */}
      <div className="grow space-y-4">
        {review.title && (
          <h4 className="font-semibold text-gray-900 text-lg leading-none">
            {review.title}
          </h4>
        )}
        {/* Review body */}
        {review.body && (
          <p className="whitespace-pre-wrap text-base text-gray-700 leading-relaxed">
            {review.body}
          </p>
        )}
        {/* Review images */}
        {review.pictures && review.pictures.length > 0 && (
          <div data-testid="review-images" className="space-y-3">
            <div className="flex flex-wrap gap-3">
              {review.pictures.map((image, index) => (
                <button
                  type="button"
                  key={image.urls.original}
                  className="group/image relative overflow-hidden border border-gray-200 transition-all duration-200 hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  // onClick={() => onImageClick(image, review.pictures)}
                >
                  <Image
                    src={
                      image.urls.small ||
                      image.urls.compact ||
                      image.urls.original
                    }
                    alt={`Review image ${index + 1}`}
                    className="h-16 w-16 object-cover transition-transform duration-200"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover/image:bg-black/50">
                    <span className="font-medium text-white text-xs opacity-0 transition-opacity duration-200 group-hover/image:opacity-100">
                      View
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        <p className="flex-shrink-0 text-gray-500 text-sm truncate">
          {formatDate(review.created_at)}
        </p>
      </div>
    </div>
  );
}
