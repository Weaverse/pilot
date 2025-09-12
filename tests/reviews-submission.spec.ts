import { expect, test } from "@playwright/test";

declare global {
  interface Window {
    mockAuthenticatedUser?: {
      name: string;
      email: string;
    };
  }
}

test.describe("JudgemeReviewSection - Review Submission", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a product page
    await page.goto("/products/test-product-for-review-submission");

    // Wait for the reviews section and show the form
    await page.waitForSelector('[data-testid="judgeme-reviews-section"]', {
      timeout: 10_000,
    });
    await page.locator('[data-testid="write-review-button"]').click();
    await page.waitForSelector('[data-testid="review-form"]');
  });

  test("should display all required form fields", async ({ page }) => {
    const reviewForm = page.locator('[data-testid="review-form"]');

    // Check required fields are present
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

    // Check optional fields
    await expect(
      reviewForm.locator('[data-testid="review-title-input"]'),
    ).toBeVisible();

    // Check buttons
    await expect(
      reviewForm.locator('[data-testid="submit-button"]'),
    ).toBeVisible();
    await expect(
      reviewForm.locator('[data-testid="cancel-button"]'),
    ).toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    const reviewForm = page.locator('[data-testid="review-form"]');
    const submitButton = reviewForm.locator('[data-testid="submit-button"]');

    // Submit empty form
    await submitButton.click();

    // Should show validation errors for required fields
    await expect(
      reviewForm.locator('[data-testid="rating-error"]'),
    ).toBeVisible();
    await expect(
      reviewForm.locator('[data-testid="name-error"]'),
    ).toBeVisible();
    await expect(
      reviewForm.locator('[data-testid="email-error"]'),
    ).toBeVisible();
    await expect(
      reviewForm.locator('[data-testid="body-error"]'),
    ).toBeVisible();

    // Form should not be submitted (still visible)
    await expect(reviewForm).toBeVisible();
  });

  test("should validate email format", async ({ page }) => {
    const reviewForm = page.locator('[data-testid="review-form"]');
    const emailInput = reviewForm.locator(
      '[data-testid="reviewer-email-input"]',
    );
    const submitButton = reviewForm.locator('[data-testid="submit-button"]');

    // Fill other required fields
    await reviewForm
      .locator('[data-testid="rating-input"] [data-rating="5"]')
      .click();
    await reviewForm
      .locator('[data-testid="reviewer-name-input"]')
      .fill("Test User");
    await reviewForm
      .locator('[data-testid="review-body-input"]')
      .fill("This is a test review with sufficient content.");

    // Enter invalid email
    await emailInput.fill("invalid-email");
    await submitButton.click();

    // Should show email validation error
    await expect(
      reviewForm.locator('[data-testid="email-error"]'),
    ).toBeVisible();
    await expect(
      reviewForm.locator('[data-testid="email-error"]'),
    ).toContainText(/valid email/i);
  });

  test("should validate review body minimum length", async ({ page }) => {
    const reviewForm = page.locator('[data-testid="review-form"]');
    const bodyInput = reviewForm.locator('[data-testid="review-body-input"]');
    const submitButton = reviewForm.locator('[data-testid="submit-button"]');

    // Fill other required fields
    await reviewForm
      .locator('[data-testid="rating-input"] [data-rating="5"]')
      .click();
    await reviewForm
      .locator('[data-testid="reviewer-name-input"]')
      .fill("Test User");
    await reviewForm
      .locator('[data-testid="reviewer-email-input"]')
      .fill("test@example.com");

    // Enter too short review
    await bodyInput.fill("Too short");
    await submitButton.click();

    // Should show length validation error
    await expect(
      reviewForm.locator('[data-testid="body-error"]'),
    ).toBeVisible();
    await expect(
      reviewForm.locator('[data-testid="body-error"]'),
    ).toContainText(/minimum.*characters/i);
  });

  test("should validate review body maximum length", async ({ page }) => {
    const reviewForm = page.locator('[data-testid="review-form"]');
    const bodyInput = reviewForm.locator('[data-testid="review-body-input"]');

    // Fill other required fields
    await reviewForm
      .locator('[data-testid="rating-input"] [data-rating="5"]')
      .click();
    await reviewForm
      .locator('[data-testid="reviewer-name-input"]')
      .fill("Test User");
    await reviewForm
      .locator('[data-testid="reviewer-email-input"]')
      .fill("test@example.com");

    // Enter very long review (over 1000 characters)
    const longText = "A".repeat(1001);
    await bodyInput.fill(longText);

    // Should show character limit indicator
    const characterCount = reviewForm.locator(
      '[data-testid="character-count"]',
    );
    if (await characterCount.isVisible()) {
      await expect(characterCount).toContainText(/1000/);
      await expect(characterCount).toHaveClass(/text-red|error/);
    }

    const submitButton = reviewForm.locator('[data-testid="submit-button"]');
    await submitButton.click();

    // Should show length validation error
    await expect(
      reviewForm.locator('[data-testid="body-error"]'),
    ).toBeVisible();
    await expect(
      reviewForm.locator('[data-testid="body-error"]'),
    ).toContainText(/maximum.*characters/i);
  });

  test("should allow selecting star rating interactively", async ({ page }) => {
    const reviewForm = page.locator('[data-testid="review-form"]');
    const ratingInput = reviewForm.locator('[data-testid="rating-input"]');

    // Click on 4th star
    await ratingInput.locator('[data-rating="4"]').click();

    // Should show 4 filled stars
    const filledStars = ratingInput.locator('[data-filled="true"]');
    await expect(filledStars).toHaveCount(4);

    // Click on 2nd star
    await ratingInput.locator('[data-rating="2"]').click();

    // Should show 2 filled stars
    await expect(ratingInput.locator('[data-filled="true"]')).toHaveCount(2);
  });

  test("should submit valid review successfully", async ({ page }) => {
    // Mock successful API response
    await page.route("**/api/reviews/**", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            reviewId: "test-review-123",
            message: "Review submitted successfully",
          }),
        });
      } else {
        route.continue();
      }
    });

    const reviewForm = page.locator('[data-testid="review-form"]');

    // Fill all required fields with valid data
    await reviewForm
      .locator('[data-testid="rating-input"] [data-rating="5"]')
      .click();
    await reviewForm
      .locator('[data-testid="reviewer-name-input"]')
      .fill("John Doe");
    await reviewForm
      .locator('[data-testid="reviewer-email-input"]')
      .fill("john.doe@example.com");
    await reviewForm
      .locator('[data-testid="review-body-input"]')
      .fill(
        "This is an excellent product. I highly recommend it to anyone looking for quality and value.",
      );
    await reviewForm
      .locator('[data-testid="review-title-input"]')
      .fill("Excellent Product");

    // Submit form
    const submitButton = reviewForm.locator('[data-testid="submit-button"]');
    await submitButton.click();

    // Should show success message
    const successMessage = page.locator('[data-testid="success-message"]');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
    await expect(successMessage).toContainText(/success/i);

    // Form should be hidden
    await expect(reviewForm).not.toBeVisible();
  });

  test("should show loading state during submission", async ({ page }) => {
    // Mock slow API response
    await page.route("**/api/reviews/**", async (route) => {
      if (route.request().method() === "POST") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true, message: "Success" }),
        });
      } else {
        route.continue();
      }
    });

    const reviewForm = page.locator('[data-testid="review-form"]');

    // Fill required fields
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

    // Should show loading state
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toContainText(/submitting|loading/i);

    // Cancel button should also be disabled
    const cancelButton = reviewForm.locator('[data-testid="cancel-button"]');
    await expect(cancelButton).toBeDisabled();

    // Should show loading spinner or indicator
    const loadingIndicator = reviewForm.locator(
      '[data-testid="loading-spinner"], .animate-spin',
    );
    await expect(loadingIndicator).toBeVisible();

    // Eventually should complete
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible({
      timeout: 10_000,
    });
  });

  test("should handle API submission errors", async ({ page }) => {
    // Mock API error response
    await page.route("**/api/reviews/**", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            message: "Failed to submit review",
            errors: [
              {
                field: "email",
                message: "Email already used for this product",
              },
              { field: "general", message: "Server error occurred" },
            ],
          }),
        });
      } else {
        route.continue();
      }
    });

    const reviewForm = page.locator('[data-testid="review-form"]');

    // Fill and submit form
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
      .fill("This is a test review.");

    const submitButton = reviewForm.locator('[data-testid="submit-button"]');
    await submitButton.click();

    // Should show error messages
    await expect(
      reviewForm.locator('[data-testid="email-error"]'),
    ).toBeVisible();
    await expect(
      reviewForm.locator('[data-testid="general-error"]'),
    ).toBeVisible();

    // Form should remain visible for corrections
    await expect(reviewForm).toBeVisible();

    // Submit button should be enabled for retry
    await expect(submitButton).toBeEnabled();
  });

  test("should handle network errors gracefully", async ({ page }) => {
    // Mock network failure
    await page.route("**/api/reviews/**", (route) => {
      if (route.request().method() === "POST") {
        route.abort("failed");
      } else {
        route.continue();
      }
    });

    const reviewForm = page.locator('[data-testid="review-form"]');

    // Fill and submit form
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
      .fill("This is a test review.");

    await reviewForm.locator('[data-testid="submit-button"]').click();

    // Should show network error message
    const errorMessage = reviewForm.locator(
      '[data-testid="general-error"], [data-testid="network-error"]',
    );
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/network|connection|failed/i);
  });

  test("should pre-fill user information when authenticated", async ({
    page,
  }) => {
    // Mock authenticated user context
    await page.addInitScript(() => {
      window.mockAuthenticatedUser = {
        name: "Jane Smith",
        email: "jane.smith@example.com",
      };
    });

    // Navigate to page again to pick up authenticated state
    await page.goto("/products/test-product-for-review-submission");
    await page.waitForSelector('[data-testid="judgeme-reviews-section"]');
    await page.locator('[data-testid="write-review-button"]').click();

    const reviewForm = page.locator('[data-testid="review-form"]');

    // Name and email should be pre-filled
    const nameInput = reviewForm.locator('[data-testid="reviewer-name-input"]');
    const emailInput = reviewForm.locator(
      '[data-testid="reviewer-email-input"]',
    );

    await expect(nameInput).toHaveValue("Jane Smith");
    await expect(emailInput).toHaveValue("jane.smith@example.com");

    // Fields should be editable (not disabled)
    await expect(nameInput).toBeEnabled();
    await expect(emailInput).toBeEnabled();
  });

  test("should support image upload for reviews", async ({ page }) => {
    const reviewForm = page.locator('[data-testid="review-form"]');

    // Check if image upload is available
    const imageUpload = reviewForm.locator('[data-testid="image-upload"]');

    if (await imageUpload.isVisible()) {
      // Should accept image files
      await expect(imageUpload).toHaveAttribute("accept", /image/);

      // Should support multiple files
      await expect(imageUpload).toHaveAttribute("multiple");

      // Mock file selection
      const testFile = {
        name: "test-image.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.from("fake-image-data"),
      };

      await imageUpload.setInputFiles([testFile]);

      // Should show uploaded file
      const uploadedFile = reviewForm.locator('[data-testid="uploaded-image"]');
      await expect(uploadedFile).toBeVisible();

      // Should have remove option
      const removeButton = reviewForm.locator('[data-testid="remove-image"]');
      await expect(removeButton).toBeVisible();
    }
  });

  test("should validate image file types and sizes", async ({ page }) => {
    const reviewForm = page.locator('[data-testid="review-form"]');
    const imageUpload = reviewForm.locator('[data-testid="image-upload"]');

    if (await imageUpload.isVisible()) {
      // Test invalid file type
      const invalidFile = {
        name: "test-document.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("fake-pdf-data"),
      };

      await imageUpload.setInputFiles([invalidFile]);

      // Should show file type error
      const fileTypeError = reviewForm.locator(
        '[data-testid="image-type-error"]',
      );
      await expect(fileTypeError).toBeVisible();
      await expect(fileTypeError).toContainText(/image.*format/i);
    }
  });

  test("should reset form after successful submission", async ({ page }) => {
    // Mock successful submission
    await page.route("**/api/reviews/**", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true, message: "Success" }),
        });
      } else {
        route.continue();
      }
    });

    const reviewForm = page.locator('[data-testid="review-form"]');

    // Fill form
    await reviewForm
      .locator('[data-testid="rating-input"] [data-rating="4"]')
      .click();
    await reviewForm
      .locator('[data-testid="reviewer-name-input"]')
      .fill("Test User");
    await reviewForm
      .locator('[data-testid="reviewer-email-input"]')
      .fill("test@example.com");
    await reviewForm
      .locator('[data-testid="review-body-input"]')
      .fill("Test review content");
    await reviewForm
      .locator('[data-testid="review-title-input"]')
      .fill("Test Title");

    // Submit
    await reviewForm.locator('[data-testid="submit-button"]').click();
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

    // Show form again
    await page.locator('[data-testid="write-review-button"]').click();

    // Form should be reset
    await expect(
      reviewForm.locator('[data-testid="reviewer-name-input"]'),
    ).toHaveValue("");
    await expect(
      reviewForm.locator('[data-testid="reviewer-email-input"]'),
    ).toHaveValue("");
    await expect(
      reviewForm.locator('[data-testid="review-body-input"]'),
    ).toHaveValue("");
    await expect(
      reviewForm.locator('[data-testid="review-title-input"]'),
    ).toHaveValue("");

    // Rating should be unselected
    const filledStars = reviewForm.locator(
      '[data-testid="rating-input"] [data-filled="true"]',
    );
    await expect(filledStars).toHaveCount(0);
  });

  test("should be accessible with keyboard navigation", async ({ page }) => {
    const reviewForm = page.locator('[data-testid="review-form"]');

    // Tab through all form elements
    await page.keyboard.press("Tab"); // Rating
    await page.keyboard.press("Tab"); // Name input
    await page.keyboard.press("Tab"); // Email input
    await page.keyboard.press("Tab"); // Title input
    await page.keyboard.press("Tab"); // Body textarea
    await page.keyboard.press("Tab"); // Submit button
    await page.keyboard.press("Tab"); // Cancel button

    // Should be able to submit with Enter on submit button
    const submitButton = reviewForm.locator('[data-testid="submit-button"]');
    await expect(submitButton).toBeFocused();
  });
});
