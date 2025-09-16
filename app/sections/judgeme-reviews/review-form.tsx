import { CheckIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/button";
import { RatingInput } from "./components/rating-input";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { ProductQuery } from "storefront-api.generated";

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface ReviewFormProps extends React.HTMLAttributes<HTMLDivElement> {
  product: ProductQuery["product"];
  onToggle: () => void;
  onSubmitted?: () => void;
}

export function ReviewForm({
  product,
  onToggle,
  onSubmitted,
  className,
  ...props
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const submitReviewAPI = usePrefixPathWithLocale(`/api/reviews/${product.handle}`);

  useEffect(() => {
    // Reset form when it is opened
    setRating(0);
    setFormState('idle');
    setErrorMessage('');
    if (formRef.current) {
      formRef.current.reset();
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Use native form validation
    if (!event.currentTarget.checkValidity()) {
      return;
    }
    // Check if rating is selected
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setFormState('submitting');
    const submitData = new FormData(event.currentTarget);
    submitData.set("rating", rating.toString());
    submitData.set("id", product.id);

    try {
      const response = await fetch(submitReviewAPI, {
        method: "POST",
        body: submitData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('👉 --------> - review-form.tsx - result:', result)

      if (result.success) {
        setFormState('success');
        onSubmitted?.();
        formRef.current?.reset();
        setRating(0);
      } else {
        setErrorMessage(result.message || "Failed to submit review. Please try again.");
        setFormState('error');
      }
    } catch (error) {
      setErrorMessage("Failed to submit review. Please try again.");
      setFormState('error');
    }
  }

  return (
    <div
      className={`w-full space-y-6 border border-gray-200 bg-white p-6 transition-all duration-200 md:p-8 ${className || ''}`}
      {...props}
    >
      {formState === 'success' ? (
        <div
          className="space-y-4 py-4 text-center"
          role="alert"
          aria-live="polite"
        >
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckIcon className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="mb-2 font-semibold text-green-900 text-xl">
            Review Submitted Successfully!
          </h3>
          <p className="text-gray-600">
            Thank you for your feedback. Your review has been submitted and will be published after moderation.
          </p>
          <Button
            type="button"
            onClick={() => {
              setRating(0);
              setFormState('idle');
              onToggle();
            }}
            className="mt-4 px-6 py-3"
          >
            Write Another Review
          </Button>
        </div>
      ) : formState === 'error' ? (
        <div
          className="space-y-4 py-4 text-center"
          role="alert"
          aria-live="polite"
        >
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <WarningCircleIcon className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="mb-2 font-semibold text-red-900 text-xl">
            Submission Failed
          </h3>
          <p className="text-gray-600">
            {errorMessage || "There was an error submitting your review. Please try again."}
          </p>
          <Button
            type="button"
            onClick={() => setFormState('idle')}
            className="mt-4 px-6 py-3"
          >
            Try Again
          </Button>
        </div>
      ) : (
        <form
          ref={formRef}
          id="judgeme-review-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="space-y-2">
            <h2 className="text-center font-bold text-2xl text-gray-900">
              Write Your Review
            </h2>
            <p className="text-center text-gray-600">
              Share your experience with other customers
            </p>
          </div>

          {/* Rating */}
          <RatingInput
            label="Rating"
            required
            rating={rating}
            onRatingClick={setRating}
          />

          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor="judgeme-reviewer-name"
              className="block font-medium text-gray-700 text-sm"
            >
              Your Name
              <span className="ml-1 text-red-500">*</span>
            </label>
            <input
              type="text"
              name="reviewerName"
              id="judgeme-reviewer-name"
              defaultValue=""
              placeholder="Enter your name"
              required
              className="w-full border border-gray-300 px-4 py-3 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="judgeme-reviewer-email"
              className="block font-medium text-gray-700 text-sm"
            >
              Email Address
              <span className="ml-1 text-red-500">*</span>
            </label>
            <input
              type="email"
              name="reviewerEmail"
              id="judgeme-reviewer-email"
              defaultValue=""
              placeholder="Enter your email"
              required
              className="w-full border border-gray-300 px-4 py-3 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>

          {/* Review Title */}
          <div className="space-y-2">
            <label
              htmlFor="judgeme-review-title"
              className="block font-medium text-gray-700 text-sm"
            >
              Review Title
              <span className="ml-1 text-red-500">*</span>
            </label>
            <input
              type="text"
              name="reviewTitle"
              id="judgeme-review-title"
              defaultValue=""
              placeholder="Give your review a title"
              required
              className="w-full border border-gray-300 px-4 py-3 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>

          {/* Review Body */}
          <div className="space-y-2">
            <label
              htmlFor="judgeme-review-body"
              className="block font-medium text-gray-700 text-sm"
            >
              Your Review
              <span className="ml-1 text-red-500">*</span>
            </label>
            <textarea
              name="reviewBody"
              id="judgeme-review-body"
              defaultValue=""
              placeholder="Share your experience with this product"
              required
              rows={5}
              className="w-full border border-gray-300 px-4 py-3 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={formState === 'submitting' || rating === 0}
            className="w-full px-6 py-3"
          >
            {formState === 'submitting' ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      )}
    </div>
  );
}
