import { ArrowLeftIcon, ArrowRightIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "~/components/button";
import { Image } from "~/components/image";
import { StarRating } from "~/components/star-rating";
import type { JudgeMeReviewType, JudgemeReviewImage } from "~/types/judgeme";
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

export type ReviewItemProps = {
  review: JudgeMeReviewType;
  className?: string;
  showReviewerName?: boolean;
  showReviewerEmail?: boolean;
  reviewerEmailFormat?: "full" | "partial";
  showReviewTitle?: boolean;
  showReviewDate?: boolean;
};

export function ReviewItem({
  review,
  className,
  showReviewerName = true,
  showReviewerEmail = true,
  reviewerEmailFormat = "partial",
  showReviewTitle = true,
  showReviewDate = true,
}: ReviewItemProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );

  return (
    <div
      className={cn(
        "group flex flex-col gap-4 md:flex-row md:gap-6",
        className,
      )}
    >
      {/* Left column - Reviewer info */}
      <div className="w-full shrink-0 space-y-3 md:w-1/4">
        <StarRating rating={review.rating} className="[&>svg]:size-4.5" />
        <div className="space-y-1">
          {showReviewerName && (
            <div className="font-semibold text-gray-900 text-lg/none">
              {review.reviewer.name}
            </div>
          )}
          {showReviewerEmail && (
            <div className="font-medium text-gray-500">
              {reviewerEmailFormat === "full"
                ? review.reviewer.email
                : truncateEmail(review.reviewer.email)}
            </div>
          )}
        </div>
      </div>

      {/* Right column - Review content */}
      <div className="grow space-y-4">
        {showReviewTitle && review.title && (
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
              {review.pictures.map((image, ind) => (
                <button
                  type="button"
                  key={image.urls.small}
                  className="group/image relative overflow-hidden border border-gray-200 transition-all duration-200 hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  onClick={() => {
                    setSelectedImageIndex(ind);
                  }}
                >
                  <Image
                    src={
                      image.urls.small ||
                      image.urls.compact ||
                      image.urls.original
                    }
                    alt={`Review image ${ind + 1}`}
                    className="h-16 w-16 object-cover transition-transform duration-200"
                    sizes="(min-width: 45em) 50vw, 100vw"
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
        {showReviewDate && (
          <p className="shrink-0 truncate text-gray-500 text-sm">
            {formatDate(review.created_at)}
          </p>
        )}
      </div>
      <ReviewImagesModal
        selectedImageIndex={selectedImageIndex}
        setSelectedImageIndex={setSelectedImageIndex}
        images={review.pictures || []}
      />
    </div>
  );
}

export function ReviewImagesModal({
  selectedImageIndex,
  setSelectedImageIndex,
  images,
}: {
  selectedImageIndex: number | null;
  setSelectedImageIndex: (index: number | null) => void;
  images: JudgemeReviewImage[];
}) {
  if (selectedImageIndex === null || !images.length) {
    return null;
  }

  const currentImage = images[selectedImageIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75"
      onClick={() => setSelectedImageIndex(null)}
      role="dialog"
      aria-modal="true"
      aria-label="Review image gallery"
    >
      <div className="relative flex h-full w-full items-center justify-center">
        <div
          className="max-h-[90vh] max-w-[90vw]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <Button
            variant="outline"
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-6 right-6 border-white p-2 text-white"
            aria-label="Close image"
          >
            <XIcon className="h-5 w-5" />
          </Button>

          {/* Previous button */}
          {images.length > 1 && (
            <Button
              variant="secondary"
              onClick={() => {
                const prevIndex =
                  (selectedImageIndex - 1 + images.length) % images.length;
                setSelectedImageIndex(prevIndex);
              }}
              className="-translate-y-1/2 absolute top-1/2 left-4 p-2"
              aria-label="Previous image"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          )}

          {/* Image */}
          <Image
            src={
              currentImage.urls.huge ||
              currentImage.urls.original ||
              currentImage.urls.small
            }
            alt="Review image"
            className="max-h-[85vh] max-w-[85vw] object-contain"
            width="auto"
            height="auto"
            sizes="(min-width: 45em) 50vw, 100vw"
          />

          {/* Next button */}
          {images.length > 1 && (
            <Button
              variant="secondary"
              onClick={() => {
                const nextIndex = (selectedImageIndex + 1) % images.length;
                setSelectedImageIndex(nextIndex);
              }}
              className="-translate-y-1/2 absolute top-1/2 right-4 p-2"
              aria-label="Next image"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </Button>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="-translate-x-1/2 absolute bottom-4 left-1/2 rounded-full bg-black bg-opacity-50 px-3 py-1 text-white">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
