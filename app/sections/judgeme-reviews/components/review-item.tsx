import { ShieldCheckIcon } from "@phosphor-icons/react";
import { forwardRef, useState } from "react";
import { StarRating } from "~/components/star-rating";
import type { ReviewItemProps } from "~/types/judgeme-redesigned";

export const ReviewItem = forwardRef<HTMLDivElement, ReviewItemProps>(
  (
    {
      review,
      onImageClick,
      showReviewerEmail,
      showReviewDate,
      showVerificationBadge,
      maxReviewLength,
    },
    ref,
  ) => {
    const [showFullReview, setShowFullReview] = useState(false);

    const shouldTruncate = review.body.length > maxReviewLength;
    const displayedBody =
      shouldTruncate && !showFullReview
        ? `${review.body.slice(0, maxReviewLength)}...`
        : review.body;

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const truncateEmail = (email: string) => {
      const [username, domain] = email.split("@");
      if (username.length <= 3) {
        return email;
      }

      const visibleChars = Math.min(3, username.length - 1);
      const masked = `${username.slice(0, visibleChars)}***`;
      return `${masked}@${domain}`;
    };

    return (
      <div
        ref={ref}
        data-testid={`review-item-${review.id}`}
        className="group flex gap-4 rounded-lg border border-gray-100 bg-white p-4 transition-all duration-200 hover:border-gray-200 hover:shadow-sm md:gap-6 md:p-6 dark:border-gray-800 dark:bg-gray-800 dark:hover:border-gray-700"
      >
        {/* Left column - Reviewer info */}
        <div className="w-full flex-shrink-0 md:w-1/4">
          <div data-testid="reviewer-info" className="space-y-3">
            {/* Rating */}
            <div
              data-testid="review-rating"
              className="flex items-center gap-0.5"
            >
              <StarRating rating={review.rating} />
            </div>

            {/* Reviewer name */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <p
                  data-testid="reviewer-name"
                  className="font-semibold text-gray-900 text-sm dark:text-gray-100"
                >
                  {review.reviewer.name}
                </p>
                {showVerificationBadge && review.verified_buyer && (
                  <div
                    data-testid="verification-badge"
                    className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 font-medium text-green-700 text-xs transition-colors group-hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30"
                    title="Verified buyer"
                  >
                    <ShieldCheckIcon className="h-3 w-3" />
                    <span>Verified</span>
                  </div>
                )}
              </div>

              {showReviewerEmail && (
                <p
                  data-testid="reviewer-email"
                  className="font-medium text-gray-500 text-sm dark:text-gray-400"
                >
                  {truncateEmail(review.reviewer.email)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Review content */}
        <div className="flex-1">
          <div data-testid="review-content" className="space-y-4">
            {/* Header with title and date */}
            <div className="flex items-start justify-between gap-4">
              {review.title && (
                <h4 className="font-semibold text-gray-900 text-lg leading-tight dark:text-gray-100">
                  {review.title}
                </h4>
              )}
              {showReviewDate && (
                <p
                  data-testid="review-date"
                  className="flex-shrink-0 text-gray-500 text-sm dark:text-gray-400"
                >
                  {formatDate(review.created_at)}
                </p>
              )}
            </div>

            {/* Review body */}
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-base text-gray-700 leading-relaxed dark:text-gray-300">
                {displayedBody}
              </p>

              {shouldTruncate && (
                <button
                  onClick={() => setShowFullReview(!showFullReview)}
                  className="mt-3 inline-flex items-center gap-1 font-medium text-blue-600 text-sm transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {showFullReview ? "Read less" : "Read more"}
                </button>
              )}
            </div>

            {/* Review images */}
            {review.pictures && review.pictures.length > 0 && (
              <div data-testid="review-images" className="space-y-3">
                <p className="font-medium text-gray-700 text-sm dark:text-gray-300">
                  {review.pictures.length}{" "}
                  {review.pictures.length === 1 ? "photo" : "photos"}
                </p>
                <div className="flex flex-wrap gap-3">
                  {review.pictures.map((image, index) => (
                    <button
                      key={image.id}
                      data-testid={`review-thumbnail-${image.id}`}
                      className="group/image relative overflow-hidden rounded-lg border border-gray-200 transition-all duration-200 hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:hover:border-blue-500"
                      onClick={() => onImageClick(image, review.pictures)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onImageClick(image, review.pictures);
                        }
                      }}
                    >
                      <img
                        src={image.urls.small || image.urls.compact || image.urls.original}
                        alt={image.alt_text || `Review image ${index + 1}`}
                        className="h-16 w-16 object-cover transition-transform duration-200 group-hover/image:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          // Log failed image loads for debugging
                          console.warn("Failed to load image:", image.urls.small);
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all duration-200 group-hover/image:bg-opacity-20">
                        <span className="font-medium text-white text-xs opacity-0 transition-opacity duration-200 group-hover/image:opacity-100">
                          View
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Featured badge */}
            {review.featured && (
              <div className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 font-medium text-xs text-yellow-800 transition-colors dark:bg-yellow-900/20 dark:text-yellow-300">
                ⭐ Featured Review
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

ReviewItem.displayName = "ReviewItem";
