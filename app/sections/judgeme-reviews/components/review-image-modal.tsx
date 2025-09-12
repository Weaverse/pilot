import { CaretLeftIcon, CaretRightIcon, XIcon } from "@phosphor-icons/react";
import { forwardRef, useEffect, useState } from "react";
import { Button } from "~/components/button";
import type { ReviewImageModalProps } from "~/types/judgeme-redesigned";
import { cn } from "~/utils/cn";

export const ReviewImageModal = forwardRef<
  HTMLDivElement,
  ReviewImageModalProps
>(
  (
    {
      isOpen,
      onClose,
      currentImage,
      allImages,
      onNavigate,
      showNavigation = true,
      showCounter = true,
    },
    ref,
  ) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    // Update current index when currentImage changes
    useEffect(() => {
      if (currentImage && allImages) {
        const index = allImages.findIndex((img) => img.id === currentImage.id);
        setCurrentIndex(index !== -1 ? index : 0);
      }
    }, [currentImage, allImages]);

    // Navigation handlers
    const canGoPrev = currentIndex > 0;
    const canGoNext = currentIndex < (allImages?.length || 0) - 1;

    const handlePrev = () => {
      if (canGoPrev) {
        const newIndex = currentIndex - 1;
        setCurrentIndex(newIndex);
        onNavigate("prev");
        setImageLoading(true);
        setImageError(false);
      }
    };

    const handleNext = () => {
      if (canGoNext) {
        const newIndex = currentIndex + 1;
        setCurrentIndex(newIndex);
        onNavigate("next");
        setImageLoading(true);
        setImageError(false);
      }
    };

    // Handle keyboard navigation
    useEffect(() => {
      if (!isOpen) {
        return;
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case "Escape":
            onClose();
            break;
          case "ArrowRight":
            if (showNavigation && canGoNext) {
              handleNext();
            }
            break;
          case "ArrowLeft":
            if (showNavigation && canGoPrev) {
              handlePrev();
            }
            break;
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [
      isOpen,
      canGoNext,
      canGoPrev,
      handleNext,
      handlePrev,
      onClose,
      showNavigation,
    ]);

    // Focus management
    useEffect(() => {
      if (isOpen) {
        // Focus the modal when it opens
        const modal = document.querySelector(
          '[data-testid="review-image-modal"]',
        ) as HTMLElement;
        if (modal) {
          modal.focus();
        }
      }
    }, [isOpen]);

    const handleImageLoad = () => {
      setImageLoading(false);
      setImageError(false);
    };

    const handleImageError = () => {
      setImageLoading(false);
      setImageError(true);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    if (!(isOpen && currentImage && allImages)) {
      return null;
    }

    const displayImage = allImages[currentIndex] || currentImage;

    return (
      <div
        ref={ref}
        data-testid="review-image-modal"
        className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        {/* Backdrop */}
        <div
          data-testid="modal-backdrop"
          className="absolute inset-0 bg-black bg-opacity-75 transition-opacity"
          onClick={handleBackdropClick}
        />

        {/* Modal content */}
        <div className="relative flex h-full max-h-full w-full max-w-4xl items-center justify-center p-4">
          {/* Close button */}
          <Button
            data-testid="close-modal"
            variant="outline"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 border-none bg-white/90 shadow-lg hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
            aria-label="Close image modal"
          >
            <XIcon className="h-5 w-5" />
          </Button>

          {/* Counter */}
          {showCounter && allImages.length > 1 && (
            <div
              data-testid="image-counter"
              className="absolute top-4 left-4 z-10 rounded-full bg-black/75 px-3 py-1 text-sm text-white dark:bg-gray-900/75"
            >
              {currentIndex + 1} of {allImages.length}
            </div>
          )}

          {/* Navigation buttons */}
          {showNavigation && allImages.length > 1 && (
            <>
              <Button
                data-testid="prev-image"
                variant="outline"
                onClick={handlePrev}
                disabled={!canGoPrev}
                className="-translate-y-1/2 absolute top-1/2 left-4 z-10 border-none bg-white/90 shadow-lg hover:bg-white disabled:opacity-50 dark:bg-gray-800/90 dark:hover:bg-gray-800"
                aria-label="Previous image"
              >
                <CaretLeftIcon className="h-6 w-6" />
              </Button>

              <Button
                data-testid="next-image"
                variant="outline"
                onClick={handleNext}
                disabled={!canGoNext}
                className="-translate-y-1/2 absolute top-1/2 right-4 z-10 border-none bg-white/90 shadow-lg hover:bg-white disabled:opacity-50"
                aria-label="Next image"
              >
                <CaretRightIcon className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Image container */}
          <div className="relative flex max-h-full max-w-full items-center justify-center">
            {imageLoading && (
              <div
                data-testid="image-loading"
                className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800"
              >
                <div className="h-12 w-12 animate-spin rounded-full border-gray-900 border-b-2 dark:border-gray-300" />
              </div>
            )}

            {imageError ? (
              <div
                data-testid="image-error"
                className="flex flex-col items-center justify-center rounded-lg bg-gray-100 p-8 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                <p className="mb-2 text-lg">Failed to load image</p>
                <p className="text-sm">Please try again later</p>
              </div>
            ) : (
              <img
                data-testid="modal-image"
                src={displayImage.urls.huge || displayImage.urls.original}
                alt={
                  displayImage.alt_text || `Review image ${currentIndex + 1}`
                }
                className={cn(
                  "max-h-full max-w-full rounded-lg object-contain shadow-2xl transition-opacity",
                  imageLoading ? "opacity-0" : "opacity-100",
                )}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}
          </div>

          {/* Image info (optional) */}
          {displayImage.alt_text && (
            <div
              data-testid="image-info"
              className="-translate-x-1/2 absolute bottom-4 left-1/2 max-w-md rounded-lg bg-black/75 px-4 py-2 text-center text-sm text-white dark:bg-gray-900/75"
            >
              {displayImage.alt_text}
            </div>
          )}
        </div>
      </div>
    );
  },
);

ReviewImageModal.displayName = "ReviewImageModal";
