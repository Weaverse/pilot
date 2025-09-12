import { expect, test } from "@playwright/test";

test.describe("JudgemeReviewSection - Review Pagination", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a product page with many reviews (>10)
    await page.goto("/products/test-product-many-reviews");

    // Wait for the reviews section to load
    await page.waitForSelector('[data-testid="judgeme-reviews-section"]', {
      timeout: 10_000,
    });
    await page.waitForSelector('[data-testid="reviews-list"]');
  });

  test("should display pagination controls when reviews exceed per-page limit", async ({
    page,
  }) => {
    // Check if pagination is needed
    const totalReviewsText = await page
      .locator('[data-testid="total-reviews"]')
      .textContent();
    const totalReviews = Number.parseInt(
      totalReviewsText?.match(/\d+/)?.[0] || "0",
      10,
    );

    if (totalReviews > 10) {
      const pagination = page.locator('[data-testid="reviews-pagination"]');
      await expect(pagination).toBeVisible();

      // Should have page numbers or navigation buttons
      const paginationButtons = pagination.locator("button");
      const buttonCount = await paginationButtons.count();
      expect(buttonCount).toBeGreaterThan(0);
    }
  });

  test("should show only 10 reviews per page initially", async ({ page }) => {
    const reviews = page.locator('[data-testid^="review-item-"]');
    const reviewCount = await reviews.count();

    // Should show maximum 10 reviews on first page
    expect(reviewCount).toBeLessThanOrEqual(10);

    // If total reviews > 10, should show exactly 10
    const totalReviewsText = await page
      .locator('[data-testid="total-reviews"]')
      .textContent();
    const totalReviews = Number.parseInt(
      totalReviewsText?.match(/\d+/)?.[0] || "0",
      10,
    );

    if (totalReviews > 10) {
      expect(reviewCount).toBe(10);
    } else {
      expect(reviewCount).toBe(totalReviews);
    }
  });

  test("should navigate to page 2 and load next reviews", async ({ page }) => {
    const totalReviewsText = await page
      .locator('[data-testid="total-reviews"]')
      .textContent();
    const totalReviews = Number.parseInt(
      totalReviewsText?.match(/\d+/)?.[0] || "0",
      10,
    );

    if (totalReviews > 10) {
      // Get IDs of reviews on page 1
      const page1ReviewIds = [];
      const page1Reviews = page.locator('[data-testid^="review-item-"]');
      const page1Count = await page1Reviews.count();

      for (let i = 0; i < page1Count; i++) {
        const id = await page1Reviews.nth(i).getAttribute("data-testid");
        if (id) {
          page1ReviewIds.push(id);
        }
      }

      // Navigate to page 2
      const page2Button = page.locator(
        '[data-testid="page-2"], [data-testid="next-page"]',
      );
      await expect(page2Button).toBeVisible();
      await page2Button.click();

      // Wait for page to update
      await page.waitForTimeout(1000);

      // Check that different reviews are loaded
      const page2Reviews = page.locator('[data-testid^="review-item-"]');
      const page2Count = await page2Reviews.count();
      expect(page2Count).toBeGreaterThan(0);
      expect(page2Count).toBeLessThanOrEqual(10);

      // Verify different reviews are shown
      const page2ReviewIds = [];
      for (let i = 0; i < page2Count; i++) {
        const id = await page2Reviews.nth(i).getAttribute("data-testid");
        if (id) {
          page2ReviewIds.push(id);
        }
      }

      // Should have different reviews (no overlap)
      const hasOverlap = page1ReviewIds.some((id) =>
        page2ReviewIds.includes(id),
      );
      expect(hasOverlap).toBeFalsy();
    }
  });

  test("should update URL with page parameter", async ({ page }) => {
    const totalReviewsText = await page
      .locator('[data-testid="total-reviews"]')
      .textContent();
    const totalReviews = Number.parseInt(
      totalReviewsText?.match(/\d+/)?.[0] || "0",
      10,
    );

    if (totalReviews > 10) {
      // Navigate to page 2
      const page2Button = page.locator(
        '[data-testid="page-2"], [data-testid="next-page"]',
      );
      await page2Button.click();
      await page.waitForTimeout(1000);

      // Check URL contains page parameter
      const url = new URL(page.url());
      expect(url.searchParams.get("page")).toBe("2");
    }
  });

  test("should maintain page state on browser refresh", async ({ page }) => {
    const totalReviewsText = await page
      .locator('[data-testid="total-reviews"]')
      .textContent();
    const totalReviews = Number.parseInt(
      totalReviewsText?.match(/\d+/)?.[0] || "0",
      10,
    );

    if (totalReviews > 10) {
      // Navigate to page 2
      const page2Button = page.locator(
        '[data-testid="page-2"], [data-testid="next-page"]',
      );
      await page2Button.click();
      await page.waitForTimeout(1000);

      // Get review IDs on page 2
      const page2ReviewIds = [];
      const reviews = page.locator('[data-testid^="review-item-"]');
      for (let i = 0; i < (await reviews.count()); i++) {
        const id = await reviews.nth(i).getAttribute("data-testid");
        if (id) {
          page2ReviewIds.push(id);
        }
      }

      // Refresh page
      await page.reload();
      await page.waitForSelector('[data-testid="reviews-list"]');

      // Should still be on page 2 with same reviews
      const afterReloadReviews = page.locator('[data-testid^="review-item-"]');
      const afterReloadIds = [];
      for (let i = 0; i < (await afterReloadReviews.count()); i++) {
        const id = await afterReloadReviews.nth(i).getAttribute("data-testid");
        if (id) {
          afterReloadIds.push(id);
        }
      }

      expect(afterReloadIds).toEqual(page2ReviewIds);
    }
  });

  test("should show correct page numbers in pagination", async ({ page }) => {
    const totalReviewsText = await page
      .locator('[data-testid="total-reviews"]')
      .textContent();
    const totalReviews = Number.parseInt(
      totalReviewsText?.match(/\d+/)?.[0] || "0",
      10,
    );
    const expectedTotalPages = Math.ceil(totalReviews / 10);

    if (expectedTotalPages > 1) {
      const pagination = page.locator('[data-testid="reviews-pagination"]');

      // Check page number buttons exist
      for (let i = 1; i <= Math.min(expectedTotalPages, 5); i++) {
        const pageButton = pagination.locator(`[data-testid="page-${i}"]`);
        await expect(pageButton).toBeVisible();
        await expect(pageButton).toContainText(i.toString());
      }

      // First page should be active/current
      const currentPage = pagination.locator(
        '[data-testid="current-page"], [aria-current="page"]',
      );
      await expect(currentPage).toBeVisible();
      await expect(currentPage).toContainText("1");
    }
  });

  test("should highlight current page in pagination", async ({ page }) => {
    const totalReviewsText = await page
      .locator('[data-testid="total-reviews"]')
      .textContent();
    const totalReviews = Number.parseInt(
      totalReviewsText?.match(/\d+/)?.[0] || "0",
      10,
    );

    if (totalReviews > 20) {
      // Need at least 3 pages
      // Navigate to page 2
      const page2Button = page.locator('[data-testid="page-2"]');
      await page2Button.click();
      await page.waitForTimeout(1000);

      // Page 2 should be highlighted/active
      const currentPage = page.locator(
        '[data-testid="current-page"], [aria-current="page"]',
      );
      await expect(currentPage).toContainText("2");

      // Page 1 should no longer be active
      const page1Button = page.locator('[data-testid="page-1"]');
      await expect(page1Button).not.toHaveAttribute("aria-current", "page");
    }
  });

  test("should handle next/previous navigation", async ({ page }) => {
    const totalReviewsText = await page
      .locator('[data-testid="total-reviews"]')
      .textContent();
    const totalReviews = Number.parseInt(
      totalReviewsText?.match(/\d+/)?.[0] || "0",
      10,
    );

    if (totalReviews > 10) {
      // Check next button exists and is enabled
      const nextButton = page.locator('[data-testid="next-page"]');
      await expect(nextButton).toBeVisible();
      await expect(nextButton).toBeEnabled();

      // Previous button should be disabled on page 1
      const prevButton = page.locator('[data-testid="prev-page"]');
      if (await prevButton.isVisible()) {
        await expect(prevButton).toBeDisabled();
      }

      // Click next button
      await nextButton.click();
      await page.waitForTimeout(1000);

      // Previous button should now be enabled
      if (await prevButton.isVisible()) {
        await expect(prevButton).toBeEnabled();
      }

      // Test previous button
      await prevButton.click();
      await page.waitForTimeout(1000);

      // Should be back on page 1
      const url = new URL(page.url());
      const pageParam = url.searchParams.get("page");
      expect(pageParam === null || pageParam === "1").toBe(true);
    }
  });

  test("should maintain pagination with filters applied", async ({ page }) => {
    const totalReviewsText = await page
      .locator('[data-testid="total-reviews"]')
      .textContent();
    const totalReviews = Number.parseInt(
      totalReviewsText?.match(/\d+/)?.[0] || "0",
      10,
    );

    if (totalReviews > 10) {
      // Apply a filter
      await page.locator('[data-testid="rating-filter"]').click();
      await page.locator('[data-testid="filter-5-stars"]').click();
      await page.waitForTimeout(1000);

      const filteredReviews = page.locator('[data-testid^="review-item-"]');
      const filteredCount = await filteredReviews.count();

      if (filteredCount > 10) {
        // Pagination should still work with filters
        const pagination = page.locator('[data-testid="reviews-pagination"]');
        await expect(pagination).toBeVisible();

        const page2Button = pagination.locator(
          '[data-testid="page-2"], [data-testid="next-page"]',
        );
        if (await page2Button.isVisible()) {
          await page2Button.click();
          await page.waitForTimeout(1000);

          // Should still have filter applied on page 2
          const page2Reviews = page.locator('[data-testid^="review-item-"]');
          if ((await page2Reviews.count()) > 0) {
            const firstReviewStars = await page2Reviews
              .first()
              .locator('[data-testid="review-rating"] [data-filled="true"]')
              .count();
            expect(firstReviewStars).toBe(5);
          }

          // URL should have both filter and page params
          const url = new URL(page.url());
          expect(url.searchParams.get("rating")).toBe("5");
          expect(url.searchParams.get("page")).toBe("2");
        }
      }
    }
  });

  test("should show loading state during page transitions", async ({
    page,
  }) => {
    const totalReviewsText = await page
      .locator('[data-testid="total-reviews"]')
      .textContent();
    const totalReviews = Number.parseInt(
      totalReviewsText?.match(/\d+/)?.[0] || "0",
      10,
    );

    if (totalReviews > 10) {
      // Slow down the API response to test loading state
      await page.route("**/api/reviews/**", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.continue();
      });

      // Navigate to page 2
      const page2Button = page.locator(
        '[data-testid="page-2"], [data-testid="next-page"]',
      );
      await page2Button.click();

      // Should show loading state
      const loadingState = page.locator(
        '[data-testid="pagination-loading"], [data-testid="reviews-loading"]',
      );
      await expect(loadingState).toBeVisible();

      // Eventually should show page 2 reviews
      await expect(page.locator('[data-testid^="review-item-"]')).toHaveCount(
        10,
        { timeout: 5000 },
      );
    }
  });

  test("should handle edge case of last page with fewer reviews", async ({
    page,
  }) => {
    const totalReviewsText = await page
      .locator('[data-testid="total-reviews"]')
      .textContent();
    const totalReviews = Number.parseInt(
      totalReviewsText?.match(/\d+/)?.[0] || "0",
      10,
    );
    const totalPages = Math.ceil(totalReviews / 10);
    const expectedLastPageCount = totalReviews % 10 || 10;

    if (totalPages > 1 && expectedLastPageCount < 10) {
      // Navigate to last page
      const lastPageButton = page.locator(`[data-testid="page-${totalPages}"]`);
      if (await lastPageButton.isVisible()) {
        await lastPageButton.click();
        await page.waitForTimeout(1000);

        // Should show correct number of reviews on last page
        const lastPageReviews = page.locator('[data-testid^="review-item-"]');
        expect(await lastPageReviews.count()).toBe(expectedLastPageCount);

        // Next button should be disabled
        const nextButton = page.locator('[data-testid="next-page"]');
        if (await nextButton.isVisible()) {
          await expect(nextButton).toBeDisabled();
        }
      }
    }
  });

  test("should handle pagination when no reviews match filter", async ({
    page,
  }) => {
    // Apply a filter that results in no reviews
    await page.locator('[data-testid="rating-filter"]').click();
    await page.locator('[data-testid="filter-1-stars"]').click();
    await page.waitForTimeout(1000);

    const filteredReviews = page.locator('[data-testid^="review-item-"]');
    const filteredCount = await filteredReviews.count();

    if (filteredCount === 0) {
      // Pagination should be hidden
      const pagination = page.locator('[data-testid="reviews-pagination"]');
      await expect(pagination).not.toBeVisible();

      // Should show no results message
      const noResults = page.locator('[data-testid="no-filtered-reviews"]');
      await expect(noResults).toBeVisible();
    }
  });
});
