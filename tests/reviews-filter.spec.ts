import { expect, test } from "@playwright/test";

test.describe("JudgemeReviewSection - Review Filtering & Sorting", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a product page with multiple reviews of different ratings
    await page.goto("/products/test-product-mixed-reviews");

    // Wait for the reviews section to load
    await page.waitForSelector('[data-testid="judgeme-reviews-section"]', {
      timeout: 10_000,
    });
    await page.waitForSelector('[data-testid="reviews-list"]');
  });

  test("should display filter dropdown with rating options", async ({
    page,
  }) => {
    const filtersSection = page.locator('[data-testid="reviews-filters"]');
    await expect(filtersSection).toBeVisible();

    // Check filter dropdown exists
    const filterDropdown = filtersSection.locator(
      '[data-testid="rating-filter"]',
    );
    await expect(filterDropdown).toBeVisible();

    // Open dropdown and check options
    await filterDropdown.click();

    const filterOptions = page.locator('[data-testid="filter-option"]');
    await expect(filterOptions).toHaveCount(6); // All ratings + "All ratings"

    // Check specific options exist
    await expect(page.locator('[data-testid="filter-all"]')).toContainText(
      "All ratings",
    );
    await expect(page.locator('[data-testid="filter-5-stars"]')).toContainText(
      "5 stars",
    );
    await expect(page.locator('[data-testid="filter-4-stars"]')).toContainText(
      "4 stars",
    );
    await expect(page.locator('[data-testid="filter-3-stars"]')).toContainText(
      "3 stars",
    );
    await expect(page.locator('[data-testid="filter-2-stars"]')).toContainText(
      "2 stars",
    );
    await expect(page.locator('[data-testid="filter-1-stars"]')).toContainText(
      "1 star",
    );
  });

  test("should filter reviews by 5-star rating", async ({ page }) => {
    // Get initial review count
    const initialReviews = page.locator('[data-testid^="review-item-"]');
    const initialCount = await initialReviews.count();

    // Open filter dropdown and select 5 stars
    await page.locator('[data-testid="rating-filter"]').click();
    await page.locator('[data-testid="filter-5-stars"]').click();

    // Wait for filtering to complete
    await page.waitForTimeout(1000);

    // Check that only 5-star reviews are displayed
    const filteredReviews = page.locator('[data-testid^="review-item-"]');
    const filteredCount = await filteredReviews.count();

    // Should have fewer or equal reviews
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // All displayed reviews should have 5 stars
    for (let i = 0; i < Math.min(filteredCount, 5); i++) {
      const review = filteredReviews.nth(i);
      const starCount = await review
        .locator('[data-testid="review-rating"] [data-filled="true"]')
        .count();
      expect(starCount).toBe(5);
    }

    // Filter indicator should show active filter
    const activeFilter = page.locator('[data-testid="active-filter"]');
    await expect(activeFilter).toContainText("5 stars");
  });

  test("should filter reviews by different star ratings", async ({ page }) => {
    const ratings = [4, 3, 2, 1];

    for (const rating of ratings) {
      // Select rating filter
      await page.locator('[data-testid="rating-filter"]').click();
      await page.locator(`[data-testid="filter-${rating}-stars"]`).click();

      // Wait for filtering
      await page.waitForTimeout(1000);

      // Check that only reviews with this rating are displayed
      const filteredReviews = page.locator('[data-testid^="review-item-"]');
      const filteredCount = await filteredReviews.count();

      if (filteredCount > 0) {
        // Check first few reviews have correct rating
        for (let i = 0; i < Math.min(filteredCount, 3); i++) {
          const review = filteredReviews.nth(i);
          const starCount = await review
            .locator('[data-testid="review-rating"] [data-filled="true"]')
            .count();
          expect(starCount).toBe(rating);
        }
      }
    }
  });

  test("should clear filters and show all reviews", async ({ page }) => {
    // First apply a filter
    await page.locator('[data-testid="rating-filter"]').click();
    await page.locator('[data-testid="filter-5-stars"]').click();
    await page.waitForTimeout(1000);

    const filteredCount = await page
      .locator('[data-testid^="review-item-"]')
      .count();

    // Clear filter
    await page.locator('[data-testid="rating-filter"]').click();
    await page.locator('[data-testid="filter-all"]').click();
    await page.waitForTimeout(1000);

    // Should show more reviews (or same if all were 5-star)
    const allReviewsCount = await page
      .locator('[data-testid^="review-item-"]')
      .count();
    expect(allReviewsCount).toBeGreaterThanOrEqual(filteredCount);

    // Active filter should be cleared
    const activeFilter = page.locator('[data-testid="active-filter"]');
    await expect(activeFilter).toContainText("All ratings");
  });

  test("should display sort dropdown with options", async ({ page }) => {
    const sortDropdown = page.locator('[data-testid="sort-dropdown"]');
    await expect(sortDropdown).toBeVisible();

    // Open dropdown and check options
    await sortDropdown.click();

    await expect(page.locator('[data-testid="sort-newest"]')).toContainText(
      "Newest first",
    );
    await expect(page.locator('[data-testid="sort-oldest"]')).toContainText(
      "Oldest first",
    );
    await expect(
      page.locator('[data-testid="sort-rating-high"]'),
    ).toContainText("Highest rating");
    await expect(page.locator('[data-testid="sort-rating-low"]')).toContainText(
      "Lowest rating",
    );
  });

  test("should sort reviews by newest first", async ({ page }) => {
    // Change sort to newest
    await page.locator('[data-testid="sort-dropdown"]').click();
    await page.locator('[data-testid="sort-newest"]').click();
    await page.waitForTimeout(1000);

    // Get dates from first few reviews
    const reviews = page.locator('[data-testid^="review-item-"]');
    const dates = [];

    for (let i = 0; i < Math.min(3, await reviews.count()); i++) {
      const dateText = await reviews
        .nth(i)
        .locator('[data-testid="review-date"]')
        .textContent();
      if (dateText) {
        dates.push(new Date(dateText));
      }
    }

    // Verify dates are in descending order (newest first)
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i - 1].getTime()).toBeGreaterThanOrEqual(dates[i].getTime());
    }
  });

  test("should sort reviews by oldest first", async ({ page }) => {
    // Change sort to oldest
    await page.locator('[data-testid="sort-dropdown"]').click();
    await page.locator('[data-testid="sort-oldest"]').click();
    await page.waitForTimeout(1000);

    // Get dates from first few reviews
    const reviews = page.locator('[data-testid^="review-item-"]');
    const dates = [];

    for (let i = 0; i < Math.min(3, await reviews.count()); i++) {
      const dateText = await reviews
        .nth(i)
        .locator('[data-testid="review-date"]')
        .textContent();
      if (dateText) {
        dates.push(new Date(dateText));
      }
    }

    // Verify dates are in ascending order (oldest first)
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i - 1].getTime()).toBeLessThanOrEqual(dates[i].getTime());
    }
  });

  test("should sort reviews by highest rating", async ({ page }) => {
    // Change sort to highest rating
    await page.locator('[data-testid="sort-dropdown"]').click();
    await page.locator('[data-testid="sort-rating-high"]').click();
    await page.waitForTimeout(1000);

    // Get ratings from first few reviews
    const reviews = page.locator('[data-testid^="review-item-"]');
    const ratings = [];

    for (let i = 0; i < Math.min(3, await reviews.count()); i++) {
      const starCount = await reviews
        .nth(i)
        .locator('[data-testid="review-rating"] [data-filled="true"]')
        .count();
      ratings.push(starCount);
    }

    // Verify ratings are in descending order
    for (let i = 1; i < ratings.length; i++) {
      expect(ratings[i - 1]).toBeGreaterThanOrEqual(ratings[i]);
    }
  });

  test("should sort reviews by lowest rating", async ({ page }) => {
    // Change sort to lowest rating
    await page.locator('[data-testid="sort-dropdown"]').click();
    await page.locator('[data-testid="sort-rating-low"]').click();
    await page.waitForTimeout(1000);

    // Get ratings from first few reviews
    const reviews = page.locator('[data-testid^="review-item-"]');
    const ratings = [];

    for (let i = 0; i < Math.min(3, await reviews.count()); i++) {
      const starCount = await reviews
        .nth(i)
        .locator('[data-testid="review-rating"] [data-filled="true"]')
        .count();
      ratings.push(starCount);
    }

    // Verify ratings are in ascending order
    for (let i = 1; i < ratings.length; i++) {
      expect(ratings[i - 1]).toBeLessThanOrEqual(ratings[i]);
    }
  });

  test("should update URL with filter and sort parameters", async ({
    page,
  }) => {
    // Apply filter and sort
    await page.locator('[data-testid="rating-filter"]').click();
    await page.locator('[data-testid="filter-5-stars"]').click();
    await page.waitForTimeout(500);

    await page.locator('[data-testid="sort-dropdown"]').click();
    await page.locator('[data-testid="sort-oldest"]').click();
    await page.waitForTimeout(500);

    // Check URL contains parameters
    const url = new URL(page.url());
    expect(url.searchParams.get("rating")).toBe("5");
    expect(url.searchParams.get("sort")).toBe("oldest");
  });

  test("should persist filter and sort state on page refresh", async ({
    page,
  }) => {
    // Apply filter and sort
    await page.locator('[data-testid="rating-filter"]').click();
    await page.locator('[data-testid="filter-4-stars"]').click();
    await page.waitForTimeout(500);

    await page.locator('[data-testid="sort-dropdown"]').click();
    await page.locator('[data-testid="sort-rating-high"]').click();
    await page.waitForTimeout(500);

    // Reload page
    await page.reload();
    await page.waitForSelector('[data-testid="reviews-list"]');

    // Check that filter and sort are preserved
    const activeFilter = page.locator('[data-testid="active-filter"]');
    await expect(activeFilter).toContainText("4 stars");

    const sortIndicator = page.locator('[data-testid="current-sort"]');
    await expect(sortIndicator).toContainText("Highest rating");

    // Verify reviews are actually filtered and sorted
    const reviews = page.locator('[data-testid^="review-item-"]');
    if ((await reviews.count()) > 0) {
      const firstReviewStars = await reviews
        .first()
        .locator('[data-testid="review-rating"] [data-filled="true"]')
        .count();
      expect(firstReviewStars).toBe(4);
    }
  });

  test('should show "no results" when filter has no matches', async ({
    page,
  }) => {
    // Apply filter that might have no results (depends on test data)
    await page.locator('[data-testid="rating-filter"]').click();
    await page.locator('[data-testid="filter-1-stars"]').click();
    await page.waitForTimeout(1000);

    const reviews = page.locator('[data-testid^="review-item-"]');
    const reviewCount = await reviews.count();

    if (reviewCount === 0) {
      // Should show no filtered results message
      const noResults = page.locator('[data-testid="no-filtered-reviews"]');
      await expect(noResults).toBeVisible();
      await expect(noResults).toContainText(/no reviews match/i);

      // Should have clear filters button
      const clearFilters = page.locator('[data-testid="clear-filters"]');
      await expect(clearFilters).toBeVisible();

      // Click clear filters should show all reviews
      await clearFilters.click();
      await page.waitForTimeout(1000);

      const allReviews = page.locator('[data-testid^="review-item-"]');
      expect(await allReviews.count()).toBeGreaterThan(0);
    }
  });

  test("should handle combined filter and sort operations", async ({
    page,
  }) => {
    // Apply both filter and sort
    await page.locator('[data-testid="rating-filter"]').click();
    await page.locator('[data-testid="filter-5-stars"]').click();
    await page.waitForTimeout(500);

    await page.locator('[data-testid="sort-dropdown"]').click();
    await page.locator('[data-testid="sort-oldest"]').click();
    await page.waitForTimeout(1000);

    // Verify both are applied
    const reviews = page.locator('[data-testid^="review-item-"]');
    const reviewCount = await reviews.count();

    if (reviewCount > 1) {
      // All should be 5-star reviews
      for (let i = 0; i < Math.min(reviewCount, 3); i++) {
        const starCount = await reviews
          .nth(i)
          .locator('[data-testid="review-rating"] [data-filled="true"]')
          .count();
        expect(starCount).toBe(5);
      }

      // Should be sorted by oldest first
      const dates = [];
      for (let i = 0; i < Math.min(3, reviewCount); i++) {
        const dateText = await reviews
          .nth(i)
          .locator('[data-testid="review-date"]')
          .textContent();
        if (dateText) {
          dates.push(new Date(dateText));
        }
      }

      for (let i = 1; i < dates.length; i++) {
        expect(dates[i - 1].getTime()).toBeLessThanOrEqual(dates[i].getTime());
      }
    }
  });
});
