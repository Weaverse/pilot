import { ArrowLeftIcon, ArrowRightIcon, XIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useState } from "react";
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
                  className="group/image relative overflow-hidden transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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
                    className="size-32 hover:brightness-75 transition-all brightness-100"
                    sizes="(min-width: 45em) 50vw, 100vw"
                    width={500}
                    height={500}
                  />
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
  let open = selectedImageIndex !== null && images.length > 0;
  let currentImage = open ? images[selectedImageIndex] : null;

  function goTo(index: number) {
    setSelectedImageIndex(index);
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setSelectedImageIndex(null);
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/75 data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center",
            "data-[state=open]:animate-fade-in",
          )}
          aria-describedby={undefined}
        >
          <VisuallyHidden.Root asChild>
            <Dialog.Title>Review image gallery</Dialog.Title>
          </VisuallyHidden.Root>

          {/* Close button */}
          <Dialog.Close className="fixed top-4 right-4 z-10 rounded-md bg-white p-2 text-gray-900 transition-colors hover:bg-gray-100">
            <XIcon className="h-5 w-5" />
          </Dialog.Close>

          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous button */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  goTo((selectedImageIndex - 1 + images.length) % images.length)
                }
                className="-translate-y-1/2 absolute top-1/2 left-4 z-1 rounded-md bg-white/90 p-2 transition-colors hover:bg-white"
                aria-label="Previous image"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            )}

            {/* Image */}
            {currentImage && (
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
                sizes="85vw"
              />
            )}

            {/* Next button */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => goTo((selectedImageIndex + 1) % images.length)}
                className="-translate-y-1/2 absolute top-1/2 right-4 z-1 rounded-md bg-white/90 p-2 transition-colors hover:bg-white"
                aria-label="Next image"
              >
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <div className="-translate-x-1/2 absolute bottom-4 left-1/2 rounded-full bg-black/50 px-3 py-1 text-white text-sm">
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
