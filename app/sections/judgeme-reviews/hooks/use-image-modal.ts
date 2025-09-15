import { useState } from "react";
import type { ReviewImage } from "~/types/judgeme-redesigned";

interface SelectedImageState {
  image: ReviewImage;
  allImages: ReviewImage[];
  currentIndex: number;
}

export function useImageModal() {
  const [selectedImage, setSelectedImage] = useState<SelectedImageState | null>(null);

  const handleImageClick = (image: ReviewImage, allImages: ReviewImage[]) => {
    const currentIndex = allImages.findIndex(img => img.id === image.id);
    setSelectedImage({
      image,
      allImages,
      currentIndex: currentIndex >= 0 ? currentIndex : 0
    });
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  const handleNext = () => {
    if (selectedImage) {
      const nextIndex = (selectedImage.currentIndex + 1) % selectedImage.allImages.length;
      setSelectedImage({
        ...selectedImage,
        image: selectedImage.allImages[nextIndex],
        currentIndex: nextIndex
      });
    }
  };

  const handlePrevious = () => {
    if (selectedImage) {
      const prevIndex = (selectedImage.currentIndex - 1 + selectedImage.allImages.length) % selectedImage.allImages.length;
      setSelectedImage({
        ...selectedImage,
        image: selectedImage.allImages[prevIndex],
        currentIndex: prevIndex
      });
    }
  };

  return {
    selectedImage,
    handleImageClick,
    handleClose,
    handleNext,
    handlePrevious,
  };
}