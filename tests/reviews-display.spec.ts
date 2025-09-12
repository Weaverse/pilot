import { expect, test } from "@playwright/test";

test.describe("JudgemeReviewSection - Basic Review Display", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a product page with reviews
    // Note: This should be updated with actual product handle that has reviews
    await page.goto("/products/test-product-with-reviews");

    // Wait for the reviews section to be visible
    await page.waitForSelector('[data-testid="judgeme-reviews-section"]', {
      timeout: 10_000,
    });
  });

  test("should display reviews summary with total count", async ({ page }) => {
    const summary = page.locator('[data-testid="reviews-summary"]');
    await expect(summary).toBeVisible();

    // Check total review count is displayed
    const totalCount = summary.locator('[data-testid="total-reviews"]');
    await expect(totalCount).toBeVisible();
    await expect(totalCount).toContainText(/\d+ review/);
  });

  test("should display average rating with numerical value", async ({
    page,
  }) => {
    const summary = page.locator('[data-testid="reviews-summary"]');
    const averageRating = summary.locator('[data-testid="average-rating"]');

    await expect(averageRating).toBeVisible();
    // Should show format like "4.65 out of 5"
    await expect(averageRating).toContainText(/\d+\.\d+ out of 5/);
  });

  test("should display ratings breakdown with progress bars", async ({
    page,
  }) => {
    const summary = page.locator('[data-testid="reviews-summary"]');
    const breakdown = summary.locator('[data-testid="ratings-breakdown"]');

    await expect(breakdown).toBeVisible();

    // Check all 5 rating levels are present
    for (let i = 1; i <= 5; i++) {
      const ratingRow = breakdown.locator(`[data-testid="rating-${i}-stars"]`);
      await expect(ratingRow).toBeVisible();

      // Each row should have star icon, progress bar, and count
      await expect(
        ratingRow.locator('[data-testid="star-icon"]'),
      ).toBeVisible();
      await expect(
        ratingRow.locator('[data-testid="progress-bar"]'),
      ).toBeVisible();
      await expect(
        ratingRow.locator('[data-testid="review-count"]'),
      ).toBeVisible();
    }
  });

  test("should display progress bars with accurate percentages", async ({
    page,
  }) => {
    const breakdown = page.locator('[data-testid="ratings-breakdown"]');

    // Get total reviews count
    const totalReviewsText = await page
      .locator('[data-testid="total-reviews"]')
      .textContent();
    const totalReviews = Number.parseInt(
      totalReviewsText?.match(/\d+/)?.[0] || "0",
      10,
    );

    if (totalReviews > 0) {
      // Check that progress bars have appropriate width based on percentages
      for (let i = 1; i <= 5; i++) {
        const ratingRow = breakdown.locator(
          `[data-testid="rating-${i}-stars"]`,
        );
        const progressBar = ratingRow.locator('[data-testid="progress-bar"]');
        const countText = await ratingRow
          .locator('[data-testid="review-count"]')
          .textContent();
        const count = Number.parseInt(countText?.match(/\d+/)?.[0] || "0", 10);

        const expectedPercentage = Math.round((count / totalReviews) * 100);

        // Progress bar should have appropriate aria-valuenow
        if (expectedPercentage > 0) {
          await expect(progressBar).toHaveAttribute(
            "aria-valuenow",
            expectedPercentage.toString(),
          );
        }
      }
    }
  });

  test("should display reviews list in vertical format", async ({ page }) => {
    const reviewsList = page.locator('[data-testid="reviews-list"]');
    await expect(reviewsList).toBeVisible();

    // Should have at least one review
    const reviews = reviewsList.locator('[data-testid^="review-item-"]');
    await expect(reviews.first()).toBeVisible();
  });

  test("should display complete review information for each review", async ({
    page,
  }) => {
    const firstReview = page.locator('[data-testid^="review-item-"]').first();
    await expect(firstReview).toBeVisible();

    // Check all required elements
    await expect(
      firstReview.locator('[data-testid="review-rating"]'),
    ).toBeVisible();
    await expect(
      firstReview.locator('[data-testid="reviewer-name"]'),
    ).toBeVisible();
    await expect(
      firstReview.locator('[data-testid="reviewer-email"]'),
    ).toBeVisible();
    await expect(
      firstReview.locator('[data-testid="review-date"]'),
    ).toBeVisible();
    await expect(
      firstReview.locator('[data-testid="review-content"]'),
    ).toBeVisible();
  });

  test("should show clear visual separation between reviews", async ({
    page,
  }) => {
    const reviews = page.locator('[data-testid^="review-item-"]');
    const reviewCount = await reviews.count();

    if (reviewCount > 1) {
      // Check that reviews have visual separation (borders, spacing, etc.)
      for (let i = 0; i < Math.min(reviewCount, 3); i++) {
        const review = reviews.nth(i);
        await expect(review).toBeVisible();

        // Should have some form of visual separation (border, margin, etc.)
        const hasBottomBorder = await review.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return (
            style.borderBottom !== "0px none rgb(0, 0, 0)" ||
            style.marginBottom !== "0px" ||
            style.paddingBottom !== "0px"
          );
        });
        expect(hasBottomBorder).toBeTruthy();
      }
    }
  });

  test("should handle empty state when no reviews exist", async ({ page }) => {
    // Navigate to product with no reviews
    await page.goto("/products/test-product-no-reviews");

    const section = page.locator('[data-testid="judgeme-reviews-section"]');
    await expect(section).toBeVisible();

    // Should show empty state
    const emptyState = section.locator('[data-testid="empty-reviews-state"]');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText(/no reviews/i);

    // Should encourage first review
    await expect(emptyState).toContainText(/be the first/i);
  });

  test("should handle loading state gracefully", async ({ page }) => {
    // Slow down network to test loading state
    await page.route("**/api/reviews/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto("/products/test-product-with-reviews");

    // Should show loading skeletons
    const loadingState = page.locator('[data-testid="reviews-loading"]');
    await expect(loadingState).toBeVisible();

    // Should eventually show reviews
    await expect(page.locator('[data-testid="reviews-summary"]')).toBeVisible({
      timeout: 15_000,
    });
  });

  test("should handle API error state", async ({ page }) => {
    // Mock API failure
    await page.route("**/api/reviews/**", (route) => {
      route.abort("failed");
    });

    await page.goto("/products/test-product-with-reviews");

    // Should show error state
    const errorState = page.locator('[data-testid="reviews-error-state"]');
    await expect(errorState).toBeVisible();
    await expect(errorState).toContainText(/failed to load/i);

    // Should have retry option
    const retryButton = errorState.locator('[data-testid="retry-button"]');
    await expect(retryButton).toBeVisible();
  });
});
