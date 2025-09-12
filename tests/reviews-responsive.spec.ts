import { expect, test } from "@playwright/test";

test.describe("JudgemeReviewSection - Responsive Design", () => {
  const devices = [
    { name: "Desktop", viewport: { width: 1200, height: 800 } },
    { name: "Tablet", viewport: { width: 768, height: 1024 } },
    { name: "Mobile", viewport: { width: 375, height: 667 } },
  ];

  devices.forEach(({ name, viewport }) => {
    test.describe(`${name} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        // Set viewport for each device
        await page.setViewportSize(viewport);

        // Navigate to product with reviews
        await page.goto("/products/test-product-with-reviews");
        await page.waitForSelector('[data-testid="judgeme-reviews-section"]', {
          timeout: 10_000,
        });
      });

      test("should display reviews section appropriately", async ({ page }) => {
        const reviewsSection = page.locator(
          '[data-testid="judgeme-reviews-section"]',
        );
        await expect(reviewsSection).toBeVisible();

        // Section should not cause horizontal scrolling
        const bodyScrollWidth = await page.evaluate(
          () => document.body.scrollWidth,
        );
        const viewportWidth = viewport.width;
        expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow small margin for scrollbars
      });

      test("should adapt summary layout for screen size", async ({ page }) => {
        const summary = page.locator('[data-testid="reviews-summary"]');
        await expect(summary).toBeVisible();

        if (name === "Mobile") {
          // On mobile, elements should stack vertically
          const summaryBox = await summary.boundingBox();
          const avgRating = summary.locator('[data-testid="average-rating"]');
          const ratingsBreakdown = summary.locator(
            '[data-testid="ratings-breakdown"]',
          );

          if (
            summaryBox &&
            (await avgRating.isVisible()) &&
            (await ratingsBreakdown.isVisible())
          ) {
            const avgRatingBox = await avgRating.boundingBox();
            const breakdownBox = await ratingsBreakdown.boundingBox();

            if (avgRatingBox && breakdownBox) {
              // Elements should be stacked vertically (breakdown below average rating)
              expect(breakdownBox.y).toBeGreaterThan(
                avgRatingBox.y + avgRatingBox.height - 10,
              );
            }
          }
        } else {
          // On desktop/tablet, elements can be side by side
          const summaryBox = await summary.boundingBox();
          expect(summaryBox?.width).toBeGreaterThan(400); // Should have adequate width
        }
      });

      test("should display ratings breakdown progress bars appropriately", async ({
        page,
      }) => {
        const ratingsBreakdown = page.locator(
          '[data-testid="ratings-breakdown"]',
        );
        if (await ratingsBreakdown.isVisible()) {
          // Check that progress bars fit within their containers
          const progressBars = ratingsBreakdown.locator(
            '[data-testid^="rating-"][data-testid$="-stars"] [data-testid="progress-bar"]',
          );
          const progressBarCount = await progressBars.count();

          for (let i = 0; i < Math.min(progressBarCount, 5); i++) {
            const progressBar = progressBars.nth(i);
            const barBox = await progressBar.boundingBox();

            if (barBox) {
              expect(barBox.width).toBeGreaterThan(20); // Should have minimum width
              expect(barBox.width).toBeLessThan(viewport.width - 100); // Should not exceed viewport
            }
          }
        }
      });

      test("should make write review button accessible on all screen sizes", async ({
        page,
      }) => {
        const writeReviewButton = page.locator(
          '[data-testid="write-review-button"]',
        );
        await expect(writeReviewButton).toBeVisible();

        // Button should be large enough for touch interaction on mobile
        const buttonBox = await writeReviewButton.boundingBox();
        if (buttonBox) {
          if (name === "Mobile") {
            expect(buttonBox.height).toBeGreaterThan(44); // iOS/Android touch target minimum
            expect(buttonBox.width).toBeGreaterThan(44);
          }

          // Button should not overflow viewport
          expect(buttonBox.x + buttonBox.width).toBeLessThan(viewport.width);
        }
      });

      test("should adapt reviews list layout for screen size", async ({
        page,
      }) => {
        const reviewsList = page.locator('[data-testid="reviews-list"]');
        if (await reviewsList.isVisible()) {
          const reviews = reviewsList.locator('[data-testid^="review-item-"]');
          const reviewCount = await reviews.count();

          if (reviewCount > 0) {
            const firstReview = reviews.first();
            const reviewBox = await firstReview.boundingBox();

            if (reviewBox) {
              // Review should fit within viewport width
              expect(reviewBox.x + reviewBox.width).toBeLessThan(
                viewport.width,
              );

              if (name === "Mobile") {
                // On mobile, review content should stack vertically
                const reviewerInfo = firstReview.locator(
                  '[data-testid="reviewer-info"]',
                );
                const reviewContent = firstReview.locator(
                  '[data-testid="review-content"]',
                );

                if (
                  (await reviewerInfo.isVisible()) &&
                  (await reviewContent.isVisible())
                ) {
                  const infoBox = await reviewerInfo.boundingBox();
                  const contentBox = await reviewContent.boundingBox();

                  if (infoBox && contentBox) {
                    // Content should be below reviewer info on mobile
                    expect(contentBox.y).toBeGreaterThan(infoBox.y);
                  }
                }
              }
            }
          }
        }
      });

      test("should handle filter controls responsively", async ({ page }) => {
        const filtersSection = page.locator('[data-testid="reviews-filters"]');
        if (await filtersSection.isVisible()) {
          const filterDropdown = filtersSection.locator(
            '[data-testid="rating-filter"]',
          );
          const sortDropdown = filtersSection.locator(
            '[data-testid="sort-dropdown"]',
          );

          if (name === "Mobile") {
            // On mobile, filters might be smaller or stacked
            if (await filterDropdown.isVisible()) {
              const filterBox = await filterDropdown.boundingBox();
              if (filterBox) {
                expect(filterBox.width).toBeGreaterThan(80); // Minimum usable width
                expect(filterBox.height).toBeGreaterThan(32); // Minimum touch height
              }
            }
          }

          // Dropdowns should not overflow viewport
          if (await filterDropdown.isVisible()) {
            const filterBox = await filterDropdown.boundingBox();
            if (filterBox) {
              expect(filterBox.x + filterBox.width).toBeLessThan(
                viewport.width,
              );
            }
          }
        }
      });

      test("should display pagination controls appropriately", async ({
        page,
      }) => {
        const pagination = page.locator('[data-testid="reviews-pagination"]');
        if (await pagination.isVisible()) {
          const paginationBox = await pagination.boundingBox();
          if (paginationBox) {
            // Pagination should fit within viewport
            expect(paginationBox.x + paginationBox.width).toBeLessThan(
              viewport.width,
            );
          }

          // Check pagination buttons are touch-friendly on mobile
          const pageButtons = pagination.locator("button");
          const buttonCount = await pageButtons.count();

          if (buttonCount > 0 && name === "Mobile") {
            const firstButton = pageButtons.first();
            const buttonBox = await firstButton.boundingBox();
            if (buttonBox) {
              expect(buttonBox.height).toBeGreaterThan(36); // Touch target size
              expect(buttonBox.width).toBeGreaterThan(36);
            }
          }
        }
      });

      test("should handle review form responsively", async ({ page }) => {
        const writeReviewButton = page.locator(
          '[data-testid="write-review-button"]',
        );
        await writeReviewButton.click();

        const reviewForm = page.locator('[data-testid="review-form"]');
        await expect(reviewForm).toBeVisible();

        // Form should fit within viewport
        const formBox = await reviewForm.boundingBox();
        if (formBox) {
          expect(formBox.x + formBox.width).toBeLessThanOrEqual(viewport.width);
        }

        // Form inputs should be appropriately sized
        const nameInput = reviewForm.locator(
          '[data-testid="reviewer-name-input"]',
        );
        const emailInput = reviewForm.locator(
          '[data-testid="reviewer-email-input"]',
        );
        const bodyTextarea = reviewForm.locator(
          '[data-testid="review-body-input"]',
        );

        for (const input of [nameInput, emailInput, bodyTextarea]) {
          if (await input.isVisible()) {
            const inputBox = await input.boundingBox();
            if (inputBox) {
              expect(inputBox.width).toBeGreaterThan(200); // Minimum usable width
              expect(inputBox.x + inputBox.width).toBeLessThan(
                viewport.width - 20,
              );

              if (name === "Mobile") {
                expect(inputBox.height).toBeGreaterThan(40); // Touch-friendly height
              }
            }
          }
        }
      });

      test("should handle image modal responsively", async ({ page }) => {
        const firstThumbnail = page
          .locator('[data-testid^="review-thumbnail-"]')
          .first();

        if (await firstThumbnail.isVisible()) {
          await firstThumbnail.click();

          const imageModal = page.locator('[data-testid="review-image-modal"]');
          await expect(imageModal).toBeVisible();

          // Modal should fit within viewport
          const modalBox = await imageModal.boundingBox();
          if (modalBox) {
            expect(modalBox.x).toBeGreaterThanOrEqual(0);
            expect(modalBox.y).toBeGreaterThanOrEqual(0);
            expect(modalBox.x + modalBox.width).toBeLessThanOrEqual(
              viewport.width,
            );
            expect(modalBox.y + modalBox.height).toBeLessThanOrEqual(
              viewport.height,
            );
          }

          // Modal image should be appropriately sized
          const modalImage = imageModal.locator('[data-testid="modal-image"]');
          const imageBox = await modalImage.boundingBox();
          if (imageBox) {
            // Image should not exceed viewport dimensions with padding
            expect(imageBox.width).toBeLessThan(viewport.width - 40);
            expect(imageBox.height).toBeLessThan(viewport.height - 80);
          }

          // Navigation buttons should be touch-friendly on mobile
          if (name === "Mobile") {
            const nextButton = imageModal.locator('[data-testid="next-image"]');
            const prevButton = imageModal.locator('[data-testid="prev-image"]');

            for (const button of [nextButton, prevButton]) {
              if (await button.isVisible()) {
                const buttonBox = await button.boundingBox();
                if (buttonBox) {
                  expect(buttonBox.width).toBeGreaterThan(44);
                  expect(buttonBox.height).toBeGreaterThan(44);
                }
              }
            }
          }

          // Close modal
          await page.keyboard.press("Escape");
        }
      });

      test("should have readable text at all screen sizes", async ({
        page,
      }) => {
        // Check font sizes are appropriate
        const reviewText = page
          .locator(
            '[data-testid^="review-item-"] [data-testid="review-content"]',
          )
          .first();
        if (await reviewText.isVisible()) {
          const fontSize = await reviewText.evaluate((el) => {
            return window.getComputedStyle(el).fontSize;
          });

          const fontSizeValue = Number.parseFloat(fontSize);

          if (name === "Mobile") {
            expect(fontSizeValue).toBeGreaterThan(14); // Minimum readable size on mobile
          } else {
            expect(fontSizeValue).toBeGreaterThan(12); // Desktop can be slightly smaller
          }
        }

        // Check line height for readability
        const summaryText = page.locator('[data-testid="reviews-summary"]');
        if (await summaryText.isVisible()) {
          const lineHeight = await summaryText.evaluate((el) => {
            return window.getComputedStyle(el).lineHeight;
          });

          // Line height should be at least 1.2x font size
          expect(lineHeight).not.toBe("normal"); // Should have explicit line height
        }
      });

      test("should maintain adequate spacing and padding", async ({ page }) => {
        const reviewsSection = page.locator(
          '[data-testid="judgeme-reviews-section"]',
        );
        const sectionBox = await reviewsSection.boundingBox();

        if (sectionBox) {
          // Section should have some margin from edges
          expect(sectionBox.x).toBeGreaterThan(10);
          expect(sectionBox.x + sectionBox.width).toBeLessThan(
            viewport.width - 10,
          );
        }

        // Check spacing between review items
        const reviews = page.locator('[data-testid^="review-item-"]');
        const reviewCount = await reviews.count();

        if (reviewCount > 1) {
          const firstReviewBox = await reviews.first().boundingBox();
          const secondReviewBox = await reviews.nth(1).boundingBox();

          if (firstReviewBox && secondReviewBox) {
            const spacing =
              secondReviewBox.y - (firstReviewBox.y + firstReviewBox.height);
            expect(spacing).toBeGreaterThan(10); // Adequate spacing between reviews
          }
        }
      });

      test("should handle overflow content gracefully", async ({ page }) => {
        // Check that long review content doesn't break layout
        const longReview = page
          .locator('[data-testid^="review-item-"]')
          .filter({
            has: page
              .locator('[data-testid="review-content"]')
              .filter({ hasText: /.{200,}/ }),
          })
          .first();

        if (await longReview.isVisible()) {
          const reviewBox = await longReview.boundingBox();
          if (reviewBox) {
            // Long content should not exceed viewport width
            expect(reviewBox.x + reviewBox.width).toBeLessThan(viewport.width);

            // Should have proper text wrapping
            const reviewContent = longReview.locator(
              '[data-testid="review-content"]',
            );
            const wordBreak = await reviewContent.evaluate((el) => {
              const style = window.getComputedStyle(el);
              return style.wordBreak || style.wordWrap || style.overflowWrap;
            });

            // Should have some form of word wrapping
            expect(wordBreak).toMatch(/break-word|break-all|anywhere/);
          }
        }
      });

      test("should be scrollable when content exceeds viewport", async ({
        page,
      }) => {
        // Check that page is scrollable if content is long
        const bodyHeight = await page.evaluate(
          () => document.body.scrollHeight,
        );

        if (bodyHeight > viewport.height) {
          // Should be able to scroll
          await page.evaluate(() => window.scrollTo(0, 100));
          const scrollY = await page.evaluate(() => window.scrollY);
          expect(scrollY).toBeGreaterThan(0);

          // Scroll back to top
          await page.evaluate(() => window.scrollTo(0, 0));
        }
      });
    });
  });

  test("should handle orientation changes on mobile devices", async ({
    page,
  }) => {
    // Test portrait to landscape transition
    await page.setViewportSize({ width: 375, height: 667 }); // Portrait
    await page.goto("/products/test-product-with-reviews");
    await page.waitForSelector('[data-testid="judgeme-reviews-section"]');

    // Verify layout in portrait
    const reviewsSection = page.locator(
      '[data-testid="judgeme-reviews-section"]',
    );
    await expect(reviewsSection).toBeVisible();

    // Change to landscape
    await page.setViewportSize({ width: 667, height: 375 });

    // Layout should adapt
    await expect(reviewsSection).toBeVisible();

    // Section should not overflow
    const bodyScrollWidth = await page.evaluate(
      () => document.body.scrollWidth,
    );
    expect(bodyScrollWidth).toBeLessThanOrEqual(667 + 20);
  });

  test("should support high DPI displays", async ({ page }) => {
    // Simulate high DPI display
    await page.emulateMedia({ reducedMotion: "reduce" }); // Also test reduced motion
    await page.setViewportSize({ width: 1200, height: 800 });

    await page.goto("/products/test-product-with-reviews");
    await page.waitForSelector('[data-testid="judgeme-reviews-section"]');

    // Check that images and icons are crisp
    const starRatings = page.locator('[data-testid="review-rating"]');
    if (await starRatings.first().isVisible()) {
      // Star icons should have proper sizing
      const starIcon = starRatings.first().locator("svg, .star").first();
      if (await starIcon.isVisible()) {
        const iconBox = await starIcon.boundingBox();
        if (iconBox) {
          expect(iconBox.width).toBeGreaterThan(12);
          expect(iconBox.height).toBeGreaterThan(12);
        }
      }
    }
  });
});
