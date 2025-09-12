import { StarIcon } from "@phosphor-icons/react";
import type React from "react";
import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/components/button";
import type {
  ReviewFormData,
  ValidationErrors,
} from "~/types/judgeme-redesigned";
import { cn } from "~/utils/cn";

interface ReviewFormProps extends React.HTMLAttributes<HTMLDivElement> {
  productId: string;
  isOpen: boolean;
  onToggle: () => void;
  onSubmitted?: () => void;
  labels?: {
    title?: string;
    reviewerName?: string;
    reviewerEmail?: string;
    rating?: string;
    reviewTitle?: string;
    reviewBody?: string;
    submit?: string;
    cancel?: string;
    success?: string;
    error?: string;
    loading?: string;
    reviewerNamePlaceholder?: string;
    reviewerEmailPlaceholder?: string;
    reviewTitlePlaceholder?: string;
    reviewBodyPlaceholder?: string;
  };
}

export const ReviewForm = forwardRef<HTMLDivElement, ReviewFormProps>(
  (
    {
      productId,
      isOpen,
      onToggle,
      onSubmitted,
      labels = {
        title: "Write Your Review",
        reviewerName: "Your Name",
        reviewerEmail: "Your Email",
        rating: "Rating",
        reviewTitle: "Review Title",
        reviewBody: "Your Review",
        submit: "Submit Review",
        cancel: "Cancel",
        success: "Review submitted successfully!",
        error: "Error submitting review. Please try again.",
        loading: "Submitting...",
        reviewerNamePlaceholder: "Enter your name",
        reviewerEmailPlaceholder: "Enter your email",
        reviewTitlePlaceholder: "Summarize your experience",
        reviewBodyPlaceholder: "Tell us about your experience...",
      },
      className,
      ...props
    },
    ref,
  ) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [formData, setFormData] = useState<ReviewFormData>({
      rating: 0,
      title: "",
      body: "",
      reviewerName: "",
      reviewerEmail: "",
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetcher = useFetcher();
    const formRef = useRef<HTMLFormElement>(null);
    const formId = useId();
    const nameId = useId();
    const emailId = useId();
    const reviewTitleId = useId();
    const reviewBodyId = useId();

    useEffect(() => {
      if (!isOpen) {
        // Reset form when closed
        setRating(0);
        setHoverRating(0);
        setFormData({
          rating: 0,
          title: "",
          body: "",
          reviewerName: "",
          reviewerEmail: "",
        });
        setErrors({});
      }
    }, [isOpen]);

    useEffect(() => {
      if (fetcher.state === "idle" && fetcher.data) {
        setIsSubmitting(false);
        if ((fetcher.data as any)?.success) {
          setShowSuccess(true);
          onSubmitted?.();
          // Auto-close after 3 seconds
          setTimeout(() => {
            onToggle();
            setShowSuccess(false);
          }, 3000);
        } else {
          // Handle error
          const errorMessage = (fetcher.data as any)?.error || labels.error;
          setErrors({ body: errorMessage });
        }
      }
    }, [fetcher.state, fetcher.data, onToggle, onSubmitted, labels.error]);

    const handleRatingClick = (value: number) => {
      setRating(value);
      if (errors.rating) {
        setErrors((prev) => ({ ...prev, rating: undefined }));
      }
    };

    const handleInputChange = (field: keyof ReviewFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

    const validateForm = (): boolean => {
      const newErrors: ValidationErrors = {};

      if (!formData.reviewerName.trim()) {
        newErrors.reviewerName = "Name is required";
      }

      if (!formData.reviewerEmail.trim()) {
        newErrors.reviewerEmail = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.reviewerEmail)) {
        newErrors.reviewerEmail = "Please enter a valid email";
      }

      if (!formData.title.trim()) {
        newErrors.title = "Review title is required";
      }

      if (!formData.body.trim()) {
        newErrors.body = "Review is required";
      }

      if (rating === 0) {
        newErrors.rating = "Please select a rating";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      const formData = new FormData(event.currentTarget);
      formData.set("rating", rating.toString());
      formData.set("id", productId);

      fetcher.submit(formData, {
        method: "POST",
        encType: "multipart/form-data",
      });
    };

    if (!(isOpen || showSuccess)) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "w-full space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-200 md:p-8 dark:border-gray-700 dark:bg-gray-800",
          className,
        )}
        {...props}
      >
        {showSuccess ? (
          <div
            className="space-y-4 py-4 text-center"
            role="alert"
            aria-live="polite"
          >
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <svg
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-green-900 text-xl dark:text-green-100">
              {labels.success}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Thank you for sharing your experience!
            </p>
          </div>
        ) : (
          <form
            ref={formRef}
            id={formId}
            onSubmit={handleSubmit}
            className="space-y-6"
            noValidate
          >
            <div className="space-y-2">
              <h2 className="text-center font-bold text-2xl text-gray-900 dark:text-gray-100">
                {labels.title}
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-400">
                Share your experience with other customers
              </p>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <label
                htmlFor={`rating-${formId}`}
                className="block font-medium text-gray-700 text-sm dark:text-gray-300"
              >
                {labels.rating}
                <span className="ml-1 text-red-500" aria-label="required">
                  *
                </span>
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    id={`rating-${value}-${formId}`}
                    onClick={() => handleRatingClick(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={cn(
                      "rounded-lg p-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                      value <= (hoverRating || rating)
                        ? "scale-110 text-yellow-400 dark:text-yellow-300"
                        : "text-gray-300 hover:scale-105 hover:text-yellow-300 dark:text-gray-600 dark:hover:text-yellow-400",
                    )}
                    aria-label={`Rate ${value} star${value !== 1 ? "s" : ""}`}
                    aria-pressed={value === rating}
                  >
                    <StarIcon
                      weight={
                        value <= (hoverRating || rating) ? "fill" : "regular"
                      }
                      className="h-8 w-8"
                    />
                  </button>
                ))}
              </div>
              {errors.rating && (
                <p className="mt-1 text-red-600 text-sm" role="alert">
                  {errors.rating}
                </p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label
                htmlFor={nameId}
                className="block font-medium text-gray-700 text-sm dark:text-gray-300"
              >
                {labels.reviewerName}
                <span className="ml-1 text-red-500" aria-label="required">
                  *
                </span>
              </label>
              <input
                id={nameId}
                type="text"
                name="reviewerName"
                value={formData.reviewerName}
                onChange={(e) =>
                  handleInputChange("reviewerName", e.target.value)
                }
                placeholder={labels.reviewerNamePlaceholder}
                required
                className={cn(
                  "w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
                  errors.reviewerName
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 bg-white hover:border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500",
                )}
                aria-invalid={Boolean(errors.reviewerName)}
                aria-describedby={
                  errors.reviewerName ? `${nameId}-error` : undefined
                }
              />
              {errors.reviewerName && (
                <p
                  id={`${nameId}-error`}
                  className="text-red-600 text-sm"
                  role="alert"
                >
                  {errors.reviewerName}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor={emailId}
                className="block font-medium text-gray-700 text-sm dark:text-gray-300"
              >
                {labels.reviewerEmail}
                <span className="ml-1 text-red-500" aria-label="required">
                  *
                </span>
              </label>
              <input
                id={emailId}
                type="email"
                name="reviewerEmail"
                value={formData.reviewerEmail}
                onChange={(e) =>
                  handleInputChange("reviewerEmail", e.target.value)
                }
                placeholder={labels.reviewerEmailPlaceholder}
                required
                className={cn(
                  "w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
                  errors.reviewerEmail
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 hover:border-gray-400",
                )}
                aria-invalid={Boolean(errors.reviewerEmail)}
                aria-describedby={
                  errors.reviewerEmail ? `${emailId}-error` : undefined
                }
              />
              {errors.reviewerEmail && (
                <p
                  id={`${emailId}-error`}
                  className="text-red-600 text-sm"
                  role="alert"
                >
                  {errors.reviewerEmail}
                </p>
              )}
            </div>

            {/* Review Title */}
            <div className="space-y-2">
              <label
                htmlFor={reviewTitleId}
                className="block font-medium text-gray-700 text-sm dark:text-gray-300"
              >
                {labels.reviewTitle}
                <span className="ml-1 text-red-500" aria-label="required">
                  *
                </span>
              </label>
              <input
                id={reviewTitleId}
                type="text"
                name="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder={labels.reviewTitlePlaceholder}
                required
                className={cn(
                  "w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
                  errors.title
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 hover:border-gray-400",
                )}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={
                  errors.title ? `${reviewTitleId}-error` : undefined
                }
              />
              {errors.title && (
                <p
                  id={`${reviewTitleId}-error`}
                  className="text-red-600 text-sm"
                  role="alert"
                >
                  {errors.title}
                </p>
              )}
            </div>

            {/* Review Body */}
            <div className="space-y-2">
              <label
                htmlFor={reviewBodyId}
                className="block font-medium text-gray-700 text-sm dark:text-gray-300"
              >
                {labels.reviewBody}
                <span className="ml-1 text-red-500" aria-label="required">
                  *
                </span>
              </label>
              <textarea
                id={reviewBodyId}
                name="body"
                value={formData.body}
                onChange={(e) => handleInputChange("body", e.target.value)}
                placeholder={labels.reviewBodyPlaceholder}
                rows={4}
                required
                className={cn(
                  "w-full resize-none rounded-lg border px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
                  errors.body
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 hover:border-gray-400",
                )}
                aria-invalid={Boolean(errors.body)}
                aria-describedby={
                  errors.body ? `${reviewBodyId}-error` : undefined
                }
              />
              {errors.body && (
                <p
                  id={`${reviewBodyId}-error`}
                  className="text-red-600 text-sm"
                  role="alert"
                >
                  {errors.body}
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 border-gray-200 border-t pt-6 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={onToggle}
                disabled={isSubmitting}
                className="rounded-lg border-gray-300 px-6 py-3 font-medium text-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                {labels.cancel}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
                className="rounded-lg px-6 py-3 font-medium text-sm transition-colors"
              >
                {isSubmitting ? labels.loading : labels.submit}
              </Button>
            </div>
          </form>
        )}
      </div>
    );
  },
);

ReviewForm.displayName = "ReviewForm";

export default ReviewForm;
