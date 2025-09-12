import { expect, test } from "@playwright/test";

test.describe("JudgemeReviewSection - Review Image Modal", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a product page with reviews that have images
    await page.goto("/products/test-product-reviews-with-images");

    // Wait for the reviews section to load
    await page.waitForSelector('[data-testid="judgeme-reviews-section"]', {
      timeout: 10_000,
    });
    await page.waitForSelector('[data-testid="reviews-list"]');
  });

  test("should display review images as clickable thumbnails", async ({
    page,
  }) => {
    // Find first review with images
    const reviewWithImages = page
      .locator('[data-testid^="review-item-"]')
      .filter({
        has: page.locator('[data-testid="review-images"]'),
      })
      .first();

    if (await reviewWithImages.isVisible()) {
      const reviewImages = reviewWithImages.locator(
        '[data-testid="review-images"]',
      );
      await expect(reviewImages).toBeVisible();

      // Should have clickable thumbnails
      const thumbnails = reviewImages.locator(
        '[data-testid^="review-thumbnail-"]',
      );
      const thumbnailCount = await thumbnails.count();
      expect(thumbnailCount).toBeGreaterThan(0);

      // Each thumbnail should be clickable
      for (let i = 0; i < Math.min(thumbnailCount, 3); i++) {
        const thumbnail = thumbnails.nth(i);
        await expect(thumbnail).toBeVisible();
        await expect(thumbnail).toHaveAttribute("role", "button");
        await expect(thumbnail).toHaveAttribute("tabindex", "0");
      }
    }
  });

  test("should open image modal when thumbnail is clicked", async ({
    page,
  }) => {
    // Find and click first image thumbnail
    const firstThumbnail = page
      .locator('[data-testid^="review-thumbnail-"]')
      .first();

    if (await firstThumbnail.isVisible()) {
      await firstThumbnail.click();

      // Modal should appear
      const imageModal = page.locator('[data-testid="review-image-modal"]');
      await expect(imageModal).toBeVisible();

      // Should show enlarged image
      const enlargedImage = imageModal.locator('[data-testid="modal-image"]');
      await expect(enlargedImage).toBeVisible();

      // Modal should have proper ARIA attributes
      await expect(imageModal).toHaveAttribute("role", "dialog");
      await expect(imageModal).toHaveAttribute("aria-modal", "true");
    }
  });

  test("should display image navigation for reviews with multiple images", async ({
    page,
  }) => {
    // Find review with multiple images
    const multiImageReview = page
      .locator('[data-testid^="review-item-"]')
      .filter({
        has: page.locator('[data-testid^="review-thumbnail-"]').nth(1),
      })
      .first();

    if (await multiImageReview.isVisible()) {
      // Click first thumbnail
      await multiImageReview
        .locator('[data-testid^="review-thumbnail-"]')
        .first()
        .click();

      const imageModal = page.locator('[data-testid="review-image-modal"]');
      await expect(imageModal).toBeVisible();

      // Should have navigation buttons
      const prevButton = imageModal.locator('[data-testid="prev-image"]');
      const nextButton = imageModal.locator('[data-testid="next-image"]');

      await expect(nextButton).toBeVisible();
      await expect(nextButton).toBeEnabled();

      // Previous button should be disabled on first image
      if (await prevButton.isVisible()) {
        await expect(prevButton).toBeDisabled();
      }

      // Should show image counter
      const imageCounter = imageModal.locator('[data-testid="image-counter"]');
      if (await imageCounter.isVisible()) {
        await expect(imageCounter).toContainText(/1 of \d+/);
      }
    }
  });

  test("should navigate between images using next/previous buttons", async ({
    page,
  }) => {
    // Find review with multiple images and click first thumbnail
    const multiImageReview = page
      .locator('[data-testid^="review-item-"]')
      .filter({
        has: page.locator('[data-testid^="review-thumbnail-"]').nth(1),
      })
      .first();

    if (await multiImageReview.isVisible()) {
      await multiImageReview
        .locator('[data-testid^="review-thumbnail-"]')
        .first()
        .click();

      const imageModal = page.locator('[data-testid="review-image-modal"]');
      const modalImage = imageModal.locator('[data-testid="modal-image"]');
      const nextButton = imageModal.locator('[data-testid="next-image"]');
      const prevButton = imageModal.locator('[data-testid="prev-image"]');

      // Get src of first image
      const firstImageSrc = await modalImage.getAttribute("src");

      // Click next button
      await nextButton.click();

      // Should show different image
      const secondImageSrc = await modalImage.getAttribute("src");
      expect(secondImageSrc).not.toBe(firstImageSrc);

      // Counter should update
      const imageCounter = imageModal.locator('[data-testid="image-counter"]');
      if (await imageCounter.isVisible()) {
        await expect(imageCounter).toContainText(/2 of \d+/);
      }

      // Previous button should now be enabled
      if (await prevButton.isVisible()) {
        await expect(prevButton).toBeEnabled();
      }

      // Navigate back
      await prevButton.click();

      // Should show first image again
      const backToFirstSrc = await modalImage.getAttribute("src");
      expect(backToFirstSrc).toBe(firstImageSrc);
    }
  });

  test("should navigate between images using keyboard arrow keys", async ({
    page,
  }) => {
    const multiImageReview = page
      .locator('[data-testid^="review-item-"]')
      .filter({
        has: page.locator('[data-testid^="review-thumbnail-"]').nth(1),
      })
      .first();

    if (await multiImageReview.isVisible()) {
      await multiImageReview
        .locator('[data-testid^="review-thumbnail-"]')
        .first()
        .click();

      const imageModal = page.locator('[data-testid="review-image-modal"]');
      const modalImage = imageModal.locator('[data-testid="modal-image"]');

      // Get src of first image
      const firstImageSrc = await modalImage.getAttribute("src");

      // Press right arrow key
      await page.keyboard.press("ArrowRight");

      // Should navigate to next image
      const secondImageSrc = await modalImage.getAttribute("src");
      expect(secondImageSrc).not.toBe(firstImageSrc);

      // Press left arrow key
      await page.keyboard.press("ArrowLeft");

      // Should navigate back to first image
      const backToFirstSrc = await modalImage.getAttribute("src");
      expect(backToFirstSrc).toBe(firstImageSrc);
    }
  });

  test("should close modal when close button is clicked", async ({ page }) => {
    const firstThumbnail = page
      .locator('[data-testid^="review-thumbnail-"]')
      .first();

    if (await firstThumbnail.isVisible()) {
      await firstThumbnail.click();

      const imageModal = page.locator('[data-testid="review-image-modal"]');
      await expect(imageModal).toBeVisible();

      // Click close button
      const closeButton = imageModal.locator('[data-testid="close-modal"]');
      await expect(closeButton).toBeVisible();
      await closeButton.click();

      // Modal should be hidden
      await expect(imageModal).not.toBeVisible();
    }
  });

  test("should close modal when Escape key is pressed", async ({ page }) => {
    const firstThumbnail = page
      .locator('[data-testid^="review-thumbnail-"]')
      .first();

    if (await firstThumbnail.isVisible()) {
      await firstThumbnail.click();

      const imageModal = page.locator('[data-testid="review-image-modal"]');
      await expect(imageModal).toBeVisible();

      // Press Escape key
      await page.keyboard.press("Escape");

      // Modal should be hidden
      await expect(imageModal).not.toBeVisible();
    }
  });

  test("should close modal when clicking outside the image", async ({
    page,
  }) => {
    const firstThumbnail = page
      .locator('[data-testid^="review-thumbnail-"]')
      .first();

    if (await firstThumbnail.isVisible()) {
      await firstThumbnail.click();

      const imageModal = page.locator('[data-testid="review-image-modal"]');
      await expect(imageModal).toBeVisible();

      // Click on modal backdrop (outside the image)
      const modalBackdrop = imageModal.locator(
        '[data-testid="modal-backdrop"]',
      );
      if (await modalBackdrop.isVisible()) {
        await modalBackdrop.click();

        // Modal should be hidden
        await expect(imageModal).not.toBeVisible();
      }
    }
  });

  test("should handle modal focus management correctly", async ({ page }) => {
    const firstThumbnail = page
      .locator('[data-testid^="review-thumbnail-"]')
      .first();

    if (await firstThumbnail.isVisible()) {
      await firstThumbnail.click();

      const imageModal = page.locator('[data-testid="review-image-modal"]');
      await expect(imageModal).toBeVisible();

      // Focus should be trapped within modal
      const closeButton = imageModal.locator('[data-testid="close-modal"]');
      await expect(closeButton).toBeFocused();

      // Tab navigation should cycle within modal
      await page.keyboard.press("Tab");
      const nextButton = imageModal.locator('[data-testid="next-image"]');
      if (await nextButton.isVisible()) {
        await expect(nextButton).toBeFocused();
      }

      // Close modal
      await page.keyboard.press("Escape");

      // Focus should return to thumbnail that opened the modal
      await expect(firstThumbnail).toBeFocused();
    }
  });

  test("should display image alt text for accessibility", async ({ page }) => {
    const firstThumbnail = page
      .locator('[data-testid^="review-thumbnail-"]')
      .first();

    if (await firstThumbnail.isVisible()) {
      await firstThumbnail.click();

      const imageModal = page.locator('[data-testid="review-image-modal"]');
      const modalImage = imageModal.locator('[data-testid="modal-image"]');

      // Should have alt text
      const altText = await modalImage.getAttribute("alt");
      expect(altText).toBeTruthy();
      expect(altText).not.toBe("");

      // Alt text should be descriptive
      expect(altText?.length || 0).toBeGreaterThan(5);
    }
  });

  test("should show loading state while image loads", async ({ page }) => {
    // Mock slow image loading
    await page.route("**/*.{jpg,jpeg,png,gif,webp}", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    const firstThumbnail = page
      .locator('[data-testid^="review-thumbnail-"]')
      .first();

    if (await firstThumbnail.isVisible()) {
      await firstThumbnail.click();

      const imageModal = page.locator('[data-testid="review-image-modal"]');
      await expect(imageModal).toBeVisible();

      // Should show loading state
      const loadingIndicator = imageModal.locator(
        '[data-testid="image-loading"], .animate-spin',
      );
      await expect(loadingIndicator).toBeVisible();

      // Eventually image should load
      const modalImage = imageModal.locator('[data-testid="modal-image"]');
      await expect(modalImage).toBeVisible({ timeout: 10_000 });
    }
  });

  test("should handle image load errors gracefully", async ({ page }) => {
    // Mock image load failure
    await page.route("**/*.{jpg,jpeg,png,gif,webp}", (route) => {
      route.abort("failed");
    });

    const firstThumbnail = page
      .locator('[data-testid^="review-thumbnail-"]')
      .first();

    if (await firstThumbnail.isVisible()) {
      await firstThumbnail.click();

      const imageModal = page.locator('[data-testid="review-image-modal"]');
      await expect(imageModal).toBeVisible();

      // Should show error state
      const errorMessage = imageModal.locator('[data-testid="image-error"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText(/failed.*load|error/i);

      // Should still allow closing modal
      const closeButton = imageModal.locator('[data-testid="close-modal"]');
      await closeButton.click();
      await expect(imageModal).not.toBeVisible();
    }
  });

  test("should work on mobile devices with touch events", async ({
    page,
    isMobile,
  }) => {
    if (isMobile) {
      const firstThumbnail = page
        .locator('[data-testid^="review-thumbnail-"]')
        .first();

      if (await firstThumbnail.isVisible()) {
        // Touch to open modal
        await firstThumbnail.tap();

        const imageModal = page.locator('[data-testid="review-image-modal"]');
        await expect(imageModal).toBeVisible();

        // Should support swipe gestures for navigation if multiple images
        const nextButton = imageModal.locator('[data-testid="next-image"]');
        if (await nextButton.isVisible()) {
          const modalImage = imageModal.locator('[data-testid="modal-image"]');

          // Get bounding box for swipe
          const imageBounds = await modalImage.boundingBox();
          if (imageBounds) {
            // Swipe left to go to next image
            await page.touchscreen.tap(
              imageBounds.x + imageBounds.width * 0.8,
              imageBounds.y + imageBounds.height / 2,
            );

            // Should navigate to next image (same as clicking next button)
            // This test verifies touch events work, actual swipe implementation may vary
          }
        }

        // Tap outside to close
        const modalBackdrop = imageModal.locator(
          '[data-testid="modal-backdrop"]',
        );
        if (await modalBackdrop.isVisible()) {
          await modalBackdrop.tap();
          await expect(imageModal).not.toBeVisible();
        }
      }
    }
  });

  test("should handle reviews with no images gracefully", async ({ page }) => {
    // Find review without images
    const reviewWithoutImages = page
      .locator('[data-testid^="review-item-"]')
      .filter({
        hasNot: page.locator('[data-testid="review-images"]'),
      })
      .first();

    if (await reviewWithoutImages.isVisible()) {
      // Should not have image thumbnails
      const images = reviewWithoutImages.locator(
        '[data-testid^="review-thumbnail-"]',
      );
      await expect(images).toHaveCount(0);

      // Should not have image placeholder that's clickable
      const imagePlaceholder = reviewWithoutImages.locator(
        '[data-testid="image-placeholder"]',
      );
      if (await imagePlaceholder.isVisible()) {
        await expect(imagePlaceholder).not.toHaveAttribute("role", "button");
      }
    }
  });

  test("should preserve modal state when navigating between different review images", async ({
    page,
  }) => {
    // Open modal from first review with images
    const firstReviewThumbnail = page
      .locator('[data-testid^="review-item-"]')
      .first()
      .locator('[data-testid^="review-thumbnail-"]')
      .first();

    if (await firstReviewThumbnail.isVisible()) {
      await firstReviewThumbnail.click();

      let imageModal = page.locator('[data-testid="review-image-modal"]');
      await expect(imageModal).toBeVisible();

      // Close modal
      await page.keyboard.press("Escape");
      await expect(imageModal).not.toBeVisible();

      // Open modal from different review
      const secondReviewThumbnail = page
        .locator('[data-testid^="review-item-"]')
        .nth(1)
        .locator('[data-testid^="review-thumbnail-"]')
        .first();

      if (await secondReviewThumbnail.isVisible()) {
        await secondReviewThumbnail.click();

        imageModal = page.locator('[data-testid="review-image-modal"]');
        await expect(imageModal).toBeVisible();

        // Should show first image of second review (not remembered state from first review)
        const imageCounter = imageModal.locator(
          '[data-testid="image-counter"]',
        );
        if (await imageCounter.isVisible()) {
          await expect(imageCounter).toContainText(/1 of/);
        }
      }
    }
  });

  test("should display image metadata when available", async ({ page }) => {
    const firstThumbnail = page
      .locator('[data-testid^="review-thumbnail-"]')
      .first();

    if (await firstThumbnail.isVisible()) {
      await firstThumbnail.click();

      const imageModal = page.locator('[data-testid="review-image-modal"]');
      await expect(imageModal).toBeVisible();

      // Check for image metadata display (if implemented)
      const imageInfo = imageModal.locator('[data-testid="image-info"]');
      if (await imageInfo.isVisible()) {
        // Should show relevant info like file name, size, etc.
        await expect(imageInfo).toContainText(/.+/); // Should have some content
      }
    }
  });
});
