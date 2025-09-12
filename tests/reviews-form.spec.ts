import { expect, test } from "@playwright/test";

test.describe("JudgemeReviewSection - Review Form Toggle", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a product page
    await page.goto("/products/test-product-with-reviews");

    // Wait for the reviews section to load
    await page.waitForSelector('[data-testid="judgeme-reviews-section"]', {
      timeout: 10_000,
    });
  });

  test('should display "Write a Review" button prominently', async ({
    page,
  }) => {
    const writeReviewButton = page.locator(
      '[data-testid="write-review-button"]',
    );
    await expect(writeReviewButton).toBeVisible();
    await expect(writeReviewButton).toContainText(/write.*review/i);

    // Button should be prominent/styled
    const buttonClasses = await writeReviewButton.getAttribute("class");
    expect(buttonClasses).toContain("bg-"); // Should have background color
  });

  test("should show review form when button is clicked", async ({ page }) => {
    // Initially form should be hidden
    const reviewForm = page.locator('[data-testid="review-form"]');
    await expect(reviewForm).not.toBeVisible();

    // Click write review button
    const writeReviewButton = page.locator(
      '[data-testid="write-review-button"]',
    );
    await writeReviewButton.click();

    // Form should appear
    await expect(reviewForm).toBeVisible();

    // Form should contain required fields
    await expect(
      reviewForm.locator('[data-testid="rating-input"]'),
    ).toBeVisible();
    await expect(
      reviewForm.locator('[data-testid="reviewer-name-input"]'),
    ).toBeVisible();
    await expect(
      reviewForm.locator('[data-testid="reviewer-email-input"]'),
    ).toBeVisible();
    await expect(
      reviewForm.locator('[data-testid="review-body-input"]'),
    ).toBeVisible();
  });

  test("should hide review form when button is clicked again", async ({
    page,
  }) => {
    const reviewForm = page.locator('[data-testid="review-form"]');
    const writeReviewButton = page.locator(
      '[data-testid="write-review-button"]',
    );

    // Show form
    await writeReviewButton.click();
    await expect(reviewForm).toBeVisible();

    // Click button again to hide
    await writeReviewButton.click();

    // Form should be hidden
    await expect(reviewForm).not.toBeVisible();
  });

  test("should update button text when form is toggled", async ({ page }) => {
    const writeReviewButton = page.locator(
      '[data-testid="write-review-button"]',
    );

    // Initial text
    const initialText = await writeReviewButton.textContent();
    expect(initialText).toMatch(/write.*review/i);

    // Click to show form
    await writeReviewButton.click();

    // Button text should change
    const toggledText = await writeReviewButton.textContent();
    expect(toggledText).not.toBe(initialText);
    expect(toggledText).toMatch(/hide|cancel|close/i);

    // Click again to hide form
    await writeReviewButton.click();

    // Should revert to original text
    const revertedText = await writeReviewButton.textContent();
    expect(revertedText).toBe(initialText);
  });

  test("should show form with smooth animation", async ({ page }) => {
    const reviewForm = page.locator('[data-testid="review-form"]');
    const writeReviewButton = page.locator(
      '[data-testid="write-review-button"]',
    );

    // Click to show form
    await writeReviewButton.click();

    // Form should have animation/transition classes
    const formClasses = await reviewForm.getAttribute("class");
    expect(formClasses).toMatch(/transition|animate|duration|ease/);

    // Form should be fully visible after animation
    await expect(reviewForm).toBeVisible();

    // Check opacity is fully opaque
    const opacity = await reviewForm.evaluate(
      (el) => getComputedStyle(el).opacity,
    );
    expect(Number.parseFloat(opacity)).toBe(1);
  });

  test("should position form below summary section", async ({ page }) => {
    const summary = page.locator('[data-testid="reviews-summary"]');
    const writeReviewButton = page.locator(
      '[data-testid="write-review-button"]',
    );
    const reviewForm = page.locator('[data-testid="review-form"]');

    // Show form
    await writeReviewButton.click();
    await expect(reviewForm).toBeVisible();

    // Get positions
    const summaryBox = await summary.boundingBox();
    const formBox = await reviewForm.boundingBox();

    expect(summaryBox).toBeTruthy();
    expect(formBox).toBeTruthy();

    if (summaryBox && formBox) {
      // Form should be below summary
      expect(formBox.y).toBeGreaterThan(summaryBox.y + summaryBox.height);
    }
  });

  test("should hide form when Cancel button is clicked", async ({ page }) => {
    const reviewForm = page.locator('[data-testid="review-form"]');
    const writeReviewButton = page.locator(
      '[data-testid="write-review-button"]',
    );

    // Show form
    await writeReviewButton.click();
    await expect(reviewForm).toBeVisible();

    // Click cancel button
    const cancelButton = reviewForm.locator('[data-testid="cancel-button"]');
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    // Form should be hidden
    await expect(reviewForm).not.toBeVisible();

    // Write review button should revert to original text
    const buttonText = await writeReviewButton.textContent();
    expect(buttonText).toMatch(/write.*review/i);
  });

  test("should maintain form state when toggling", async ({ page }) => {
    const reviewForm = page.locator('[data-testid="review-form"]');
    const writeReviewButton = page.locator(
      '[data-testid="write-review-button"]',
    );

    // Show form and fill some data
    await writeReviewButton.click();
    await reviewForm
      .locator('[data-testid="reviewer-name-input"]')
      .fill("Test User");
    await reviewForm
      .locator('[data-testid="review-body-input"]')
      .fill("This is a test review");

    // Hide form
    await writeReviewButton.click();
    await expect(reviewForm).not.toBeVisible();

    // Show form again
    await writeReviewButton.click();

    // Form data should be preserved
    const nameValue = await reviewForm
      .locator('[data-testid="reviewer-name-input"]')
      .inputValue();
    const bodyValue = await reviewForm
      .locator('[data-testid="review-body-input"]')
      .inputValue();

    expect(nameValue).toBe("Test User");
    expect(bodyValue).toBe("This is a test review");
  });

  test("should clear form state when cancelled", async ({ page }) => {
    const reviewForm = page.locator('[data-testid="review-form"]');
    const writeReviewButton = page.locator(
      '[data-testid="write-review-button"]',
    );

    // Show form and fill data
    await writeReviewButton.click();
    await reviewForm
      .locator('[data-testid="reviewer-name-input"]')
      .fill("Test User");
    await reviewForm
      .locator('[data-testid="review-body-input"]')
      .fill("This is a test review");

    // Cancel form (not just toggle)
    const cancelButton = reviewForm.locator('[data-testid="cancel-button"]');
    await cancelButton.click();

    // Show form again
    await writeReviewButton.click();

    // Form should be cleared
    const nameValue = await reviewForm
      .locator('[data-testid="reviewer-name-input"]')
      .inputValue();
    const bodyValue = await reviewForm
      .locator('[data-testid="review-body-input"]')
      .inputValue();

    expect(nameValue).toBe("");
    expect(bodyValue).toBe("");
  });

  test("should handle form toggle with keyboard navigation", async ({
    page,
  }) => {
    const writeReviewButton = page.locator(
      '[data-testid="write-review-button"]',
    );
    const reviewForm = page.locator('[data-testid="review-form"]');

    // Focus on write review button
    await writeReviewButton.focus();

    // Press Enter to toggle
    await page.keyboard.press("Enter");

    // Form should appear
    await expect(reviewForm).toBeVisible();

    // Focus should move to first form input
    const firstInput = reviewForm.locator("input, textarea, select").first();
    await expect(firstInput).toBeFocused();
  });

  test("should handle Escape key to close form", async ({ page }) => {
    const reviewForm = page.locator('[data-testid="review-form"]');
    const writeReviewButton = page.locator(
      '[data-testid="write-review-button"]',
    );

    // Show form
    await writeReviewButton.click();
    await expect(reviewForm).toBeVisible();

    // Press Escape
    await page.keyboard.press("Escape");

    // Form should be hidden
    await expect(reviewForm).not.toBeVisible();
  });

  test("should be accessible with screen readers", async ({ page }) => {
    const writeReviewButton = page.locator(
      '[data-testid="write-review-button"]',
    );
    const reviewForm = page.locator('[data-testid="review-form"]');

    // Button should have proper ARIA attributes
    await expect(writeReviewButton).toHaveAttribute("aria-expanded", "false");
    await expect(writeReviewButton).toHaveAttribute("aria-controls");

    // Click to show form
    await writeReviewButton.click();

    // Button should update ARIA state
    await expect(writeReviewButton).toHaveAttribute("aria-expanded", "true");

    // Form should have proper ARIA attributes
    await expect(reviewForm).toHaveAttribute("role", "form");
    await expect(reviewForm).toHaveAttribute("aria-labelledby");
  });

  test("should disable form toggle when review is being submitted", async ({
    page,
  }) => {
    const reviewForm = page.locator('[data-testid="review-form"]');
    const writeReviewButton = page.locator(
      '[data-testid="write-review-button"]',
    );

    // Show form and fill required fields
    await writeReviewButton.click();
    await reviewForm
      .locator('[data-testid="rating-input"] [data-rating="5"]')
      .click();
    await reviewForm
      .locator('[data-testid="reviewer-name-input"]')
      .fill("Test User");
    await reviewForm
      .locator('[data-testid="reviewer-email-input"]')
      .fill("test@example.com");
    await reviewForm
      .locator('[data-testid="review-body-input"]')
      .fill("This is a test review with sufficient content.");

    // Mock slow submission
    await page.route("**/api/reviews/**", async (route) => {
      if (route.request().method() === "POST") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.continue();
      } else {
        await route.continue();
      }
    });

    // Submit form
    const submitButton = reviewForm.locator('[data-testid="submit-button"]');
    await submitButton.click();

    // Toggle button should be disabled during submission
    await expect(writeReviewButton).toBeDisabled();

    // Cancel button should also be disabled
    const cancelButton = reviewForm.locator('[data-testid="cancel-button"]');
    await expect(cancelButton).toBeDisabled();
  });

  test("should show form validation errors and keep form open", async ({
    page,
  }) => {
    const reviewForm = page.locator('[data-testid="review-form"]');
    const writeReviewButton = page.locator(
      '[data-testid="write-review-button"]',
    );

    // Show form
    await writeReviewButton.click();

    // Submit without filling required fields
    const submitButton = reviewForm.locator('[data-testid="submit-button"]');
    await submitButton.click();

    // Form should stay visible
    await expect(reviewForm).toBeVisible();

    // Should show validation errors
    const errorMessages = reviewForm.locator('[data-testid*="error"]');
    const errorCount = await errorMessages.count();
    expect(errorCount).toBeGreaterThan(0);

    // Toggle button should still work after validation errors
    await writeReviewButton.click();
    await expect(reviewForm).not.toBeVisible();
  });

  test("should hide form after successful submission", async ({ page }) => {
    const reviewForm = page.locator('[data-testid="review-form"]');
    const writeReviewButton = page.locator(
      '[data-testid="write-review-button"]',
    );

    // Mock successful submission
    await page.route("**/api/reviews/**", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            success: true,
            message: "Review submitted successfully",
          }),
        });
      } else {
        route.continue();
      }
    });

    // Show form and fill required fields
    await writeReviewButton.click();
    await reviewForm
      .locator('[data-testid="rating-input"] [data-rating="5"]')
      .click();
    await reviewForm
      .locator('[data-testid="reviewer-name-input"]')
      .fill("Test User");
    await reviewForm
      .locator('[data-testid="reviewer-email-input"]')
      .fill("test@example.com");
    await reviewForm
      .locator('[data-testid="review-body-input"]')
      .fill("This is a test review with sufficient content.");

    // Submit form
    const submitButton = reviewForm.locator('[data-testid="submit-button"]');
    await submitButton.click();

    // Form should be hidden after successful submission
    await expect(reviewForm).not.toBeVisible({ timeout: 5000 });

    // Success message should appear
    const successMessage = page.locator('[data-testid="success-message"]');
    await expect(successMessage).toBeVisible();

    // Button should revert to original text
    const buttonText = await writeReviewButton.textContent();
    expect(buttonText).toMatch(/write.*review/i);
  });
});
