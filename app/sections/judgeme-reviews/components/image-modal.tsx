import { ArrowLeftIcon, ArrowRightIcon, XIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { Image } from "~/components/image";
import type { ReviewImage } from "~/types/judgeme-redesigned";

interface ImageModalProps {
  selectedImage: {
    image: ReviewImage;
    allImages: ReviewImage[];
    currentIndex: number;
  } | null;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function ImageModal({
  selectedImage,
  onClose,
  onNext,
  onPrevious,
}: ImageModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (
        e.key === "ArrowRight" &&
        selectedImage?.allImages.length > 1
      ) {
        onNext();
      } else if (e.key === "ArrowLeft" && selectedImage?.allImages.length > 1) {
        onPrevious();
      }
    };

    if (selectedImage) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedImage, onClose, onNext, onPrevious]);

  if (!selectedImage) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Review image gallery"
    >
      <div
        className="relative max-h-[90vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="-top-12 absolute right-0 rounded-full bg-white bg-opacity-20 p-2 text-white hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close image"
        >
          <XIcon className="h-6 w-6" />
        </button>

        {/* Previous button */}
        {selectedImage.allImages.length > 1 && (
          <button
            type="button"
            onClick={onPrevious}
            className="-translate-y-1/2 absolute top-1/2 left-4 rounded-full bg-white bg-opacity-20 p-2 text-white hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Previous image"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
        )}

        {/* Image */}
        <Image
          src={
            selectedImage.image.urls.original ||
            selectedImage.image.urls.huge ||
            selectedImage.image.urls.small
          }
          alt={selectedImage.image.alt_text || "Review image"}
          className="max-h-[85vh] max-w-[85vw] object-contain"
          width="auto"
          height="auto"
        />

        {/* Next button */}
        {selectedImage.allImages.length > 1 && (
          <button
            type="button"
            onClick={onNext}
            className="-translate-y-1/2 absolute top-1/2 right-4 rounded-full bg-white bg-opacity-20 p-2 text-white hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Next image"
          >
            <ArrowRightIcon className="h-6 w-6" />
          </button>
        )}

        {/* Image counter */}
        {selectedImage.allImages.length > 1 && (
          <div className="-translate-x-1/2 absolute bottom-4 left-1/2 rounded-full bg-black bg-opacity-50 px-3 py-1 text-white">
            {selectedImage.currentIndex + 1} / {selectedImage.allImages.length}
          </div>
        )}
      </div>
    </div>
  );
}
