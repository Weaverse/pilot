import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { useLoaderData } from "react-router";
import { Button } from "~/components/button";
import { Section, sectionSettings, type SectionProps } from "~/components/section";
import { useReviewsFilter } from "~/hooks/use-reviews-filter";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";
import type {
  PaginationInfo,
  Review,
  ReviewsFilter,
  ReviewsSummary as ReviewsSummaryType,
} from "~/types/judgeme-redesigned";
import { cn } from "~/utils/cn";
import { ImageModal } from "./components/image-modal";
import { ReviewPagination } from "./components/review-pagination";
import { ReviewsFilters } from "./components/reviews-filters";
import { ReviewsList } from "./components/reviews-list";
import { ReviewsSummary } from "./components/reviews-summary";
import { useImageModal } from "./hooks/use-image-modal";
import { ReviewForm } from "./review-form";

type LoaderData = {
  productReviews?: {
    reviews: Review[];
    summary: ReviewsSummaryType;
    pagination: PaginationInfo;
  };
};

type JudgemeReviewSectionRedesignedProps = SectionProps &
  HydrogenComponentProps<LoaderData> & {
    productId?: string;
    productHandle?: string;
    enableReviewForm?: boolean;
    showWriteReviewButton?: boolean;
    maxReviewsPerPage?: number;
    enableImageModal?: boolean;
    enablePagination?: boolean;
    labels?: {
      noReviews?: string;
      loadingReviews?: string;
      errorLoadingReviews?: string;
      writeReview?: string;
      viewAllReviews?: string;
      showingReviews?: string;
      ofTotalReviews?: string;
      of?: string;
      reviewsTitle?: string;
      summaryTitle?: string;
    };
    className?: string;
  } & Omit<SectionProps, "overflow">;

export const JudgemeReviewSectionRedesigned = forwardRef<
  HTMLElement,
  JudgemeReviewSectionRedesignedProps
>(
  (
    {
      loaderData,
      enableReviewForm = true,
      showWriteReviewButton = true,
      maxReviewsPerPage = 10,
      enableImageModal = true,
      enablePagination = true,
      labels = {
        noReviews: "No reviews yet. Be the first to write a review!",
        loadingReviews: "Loading reviews...",
        errorLoadingReviews: "Failed to load reviews. Please try again later.",
        writeReview: "Write a Review",
        viewAllReviews: "View All Reviews",
        showingReviews: "Showing",
        ofTotalReviews: "of",
        of: "of",
        reviewsTitle: "Customer Reviews",
        summaryTitle: "Reviews Summary",
      },
      className,
      ...props
    },
    ref,
  ) => {
    const { product, productReviews } = useLoaderData<typeof productRouteLoader>();
    const productId = product?.id?.split("gid://shopify/Product/")[1];
    const productHandle = product?.handle;
    console.log("Product handle:", productHandle);
    console.log("ProductReviews from loader:", productReviews);
    console.log("ProductReviews type:", typeof productReviews);
    const [reviews, setReviews] = useState<Review[]>(productReviews?.reviews || []);
    const [summary, setSummary] = useState<ReviewsSummaryType>(
      productReviews?.summary || {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      }
    );
    const [pagination, setPagination] = useState<PaginationInfo>(
      productReviews?.pagination || {
        totalReviews: 0,
        currentPage: 1,
        totalPages: 1,
        perPage: 10,
        hasNextPage: false,
        hasPreviousPage: false,
      }
    );
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Image modal hook
    const {
      selectedImage,
      handleImageClick,
      handleClose: handleImageModalClose,
      handleNext: handleNextImage,
      handlePrevious: handlePreviousImage,
    } = useImageModal();

    // Use the reviews filter hook for URL state management
    const {
      filter: currentFilter,
      setPage: handlePageChange,
      setSort: handleSortChange,
      setRating: handleRatingChange,
    } = useReviewsFilter({
      defaultPerPage: maxReviewsPerPage,
      defaultSort: "newest",
    });

    const fetchReviews = useCallback(
      async (filter: ReviewsFilter) => {
        // Don't fetch if productHandle is not available
        if (!productHandle) {
          return;
        }

        setIsLoading(true);

        try {
          // This will be implemented in the server-side integration phase
          const response = await fetch(
            `/api/reviews/${productHandle}?${new URLSearchParams({
              page: filter.page.toString(),
              perPage: filter.perPage.toString(),
              sort: filter.sortBy,
              rating: filter.rating?.toString() || "",
            })}`,
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch reviews: ${response.status}`);
          }

          const data = await response.json() as {
            reviews: Review[];
            summary: ReviewsSummaryType;
            pagination: PaginationInfo;
          };
          console.log("API Response:", data);
          console.log("Reviews array:", data.reviews);
          setReviews(data.reviews);
          setSummary(data.summary);
          setPagination(data.pagination || {
            totalReviews: 0,
            currentPage: 1,
            totalPages: 1,
            perPage: maxReviewsPerPage,
            hasNextPage: false,
            hasPreviousPage: false,
          });
        } catch (err) {
          // Reset to default values on error to prevent undefined errors
          setReviews([]);
          setSummary({
            totalReviews: 0,
            averageRating: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          });
          setPagination({
            totalReviews: 0,
            currentPage: 1,
            totalPages: 1,
            perPage: maxReviewsPerPage,
            hasNextPage: false,
            hasPreviousPage: false,
          });
          // Error logged but could be sent to error tracking service
        } finally {
          setIsLoading(false);
        }
      },
      [productHandle, maxReviewsPerPage],
    );

    const handleToggleForm = () => {
      setShowForm(!showForm);
    };

    const handleReviewSubmitted = () => {
      // Refresh reviews after submission
      if (productHandle) {
        fetchReviews(currentFilter);
      }
    };


    // Track last fetched filter to prevent duplicate requests
    const lastFetchedFilter = useRef<ReviewsFilter | null>(null);

    // Single effect to handle all review fetching
    useEffect(() => {
      if (!productHandle || isLoading) {
        return;
      }

      // Check if we've already fetched this exact filter
      const filterString = JSON.stringify(currentFilter);
      if (lastFetchedFilter.current === filterString) {
        return;
      }

      // Only fetch if we don't have productReviews OR if filter has changed from defaults
      const shouldFetch = !productReviews || (
        currentFilter.page !== 1 || 
        currentFilter.rating !== undefined || 
        currentFilter.sortBy !== "newest"
      );

      if (shouldFetch) {
        lastFetchedFilter.current = filterString;
        fetchReviews(currentFilter);
      }
    }, [
      currentFilter.page,
      currentFilter.rating,
      currentFilter.sortBy,
      fetchReviews,
      productHandle,
      productReviews,
      isLoading,
    ]);

    const sectionRef = useRef<HTMLElement>(null);

    // Don't render anything if there's no product
    if (!product) {
      return null;
    }

    return (
      <Section
        ref={(node) => {
          if (ref && typeof ref === "object") {
            ref.current = node;
          } else if (typeof ref === "function") {
            ref(node);
          }
          sectionRef.current = node;
        }}
        className={cn("space-y-8", className)}
        {...props}
      >
        {/* Section Header */}
        <div className="space-y-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-3xl text-gray-900">
                {labels.reviewsTitle}
              </h2>
              <p className="mt-2 text-gray-600">
                See what our customers are saying about this product
              </p>
            </div>
          </div>
        </div>

        {/* Top Section - Summary */}
        <div className="space-y-8">
          <ReviewsSummary
            summary={summary || {
              totalReviews: 0,
              averageRating: 0,
              ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            }}
            onToggleForm={handleToggleForm}
            showForm={showForm}
            enableReviewForm={enableReviewForm}
          />

          {enableReviewForm && showForm && (
            <ReviewForm
              product={product}
              onToggle={handleToggleForm}
              onSubmitted={handleReviewSubmitted}
              className="w-full"
            />
          )}

          {/* Bottom Section - Reviews List */}
          <div className="space-y-6">
              {/* Filters */}
              {summary?.totalReviews > 0 && (
                <ReviewsFilters
                  currentFilter={currentFilter}
                  onSortChange={handleSortChange}
                  onRatingChange={handleRatingChange}
                  totalReviews={summary?.totalReviews || 0}
                />
              )}

              {/* No reviews state */}
              {(summary?.totalReviews === 0 || !summary) && !isLoading && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center">
                  <svg
                    className="mx-auto mb-4 h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  <p className="mb-2 font-medium text-gray-900 text-lg">
                    {labels.noReviews}
                  </p>
                  {enableReviewForm && !showForm && (
                    <Button
                      variant="outline"
                      onClick={handleToggleForm}
                      className="mt-4 px-6 py-3"
                    >
                      Be the first to write a review
                    </Button>
                  )}
                </div>
              )}

              {/* Reviews List */}
              <ReviewsList
                reviews={reviews}
                isLoading={isLoading}
                pagination={pagination}
                onPageChange={handlePageChange}
                onImageClick={handleImageClick}
              />

              {/* Pagination */}
              {enablePagination && (pagination?.totalPages || 0) > 1 && (
                <div className="border-gray-200 border-t pt-6">
                  <ReviewPagination
                    currentPage={pagination?.currentPage || 1}
                    totalPages={pagination?.totalPages || 1}
                    onPageChange={handlePageChange}
                    labels={{
                      previous: "Previous page",
                      next: "Next page",
                      page: "Page",
                      of: "of",
                    }}
                  />
                </div>
              )}
          </div>
        </div>

        {/* Reviews Info Footer */}
        {summary?.totalReviews > 0 && (
          <div className="mt-8 border-gray-200 border-t pt-8 text-center text-gray-600 text-sm">
            {labels.showingReviews}{" "}
            <span className="font-semibold text-gray-900">
              {((pagination?.currentPage || 1) - 1) * (pagination?.perPage || 10) + 1}
            </span>{" "}
            {labels.ofTotalReviews}{" "}
            <span className="font-semibold text-gray-900">
              {Math.min(
                (pagination?.currentPage || 1) * (pagination?.perPage || 10),
                pagination?.totalReviews || 0,
              )}
            </span>{" "}
            {labels.of}{" "}
            <span className="font-semibold text-gray-900">
              {pagination?.totalReviews || 0}
            </span>{" "}
            {(summary?.totalReviews || 0) === 1 ? "review" : "reviews"}
          </div>
        )}

        {/* Image Modal */}
        <ImageModal
          selectedImage={selectedImage}
          onClose={handleImageModalClose}
          onNext={handleNextImage}
          onPrevious={handlePreviousImage}
        />
      </Section>
    );
  },
);

JudgemeReviewSectionRedesigned.displayName = "JudgemeReviewSectionRedesigned";

export default JudgemeReviewSectionRedesigned;

export const schema = createSchema({
  type: "judgeme-reviews-redesigned",
  title: "Judge.me Reviews (Redesigned)",
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "switch",
          name: "enableReviewForm",
          label: "Enable review form",
          defaultValue: true,
          helpText: "Allow customers to write reviews",
        },
        {
          type: "switch",
          name: "showWriteReviewButton",
          label: 'Show "Write a Review" button',
          defaultValue: true,
          helpText: "Display button to open review form",
        },
        {
          type: "range",
          name: "maxReviewsPerPage",
          label: "Reviews per page",
          defaultValue: 10,
          helpText: "Number of reviews to show per page",
        },
        {
          type: "switch",
          name: "enableImageModal",
          label: "Enable image modal",
          defaultValue: true,
          helpText: "Allow users to view review images in a modal",
        },
        {
          type: "switch",
          name: "enablePagination",
          label: "Enable pagination",
          defaultValue: true,
          helpText: "Show pagination controls for reviews",
        },
      ],
    },
    {
      group: "Layout",
      inputs: [
        {
          type: "select",
          name: "desktopColumns",
          label: "Desktop columns",
          defaultValue: "1",
          helpText: "Number of columns on desktop",
        },
        {
          type: "select",
          name: "mobileColumns",
          label: "Mobile columns",
          defaultValue: "1",
          helpText: "Number of columns on mobile",
        },
      ],
    },
    ...sectionSettings,
  ],
  presets: {
    children: [
      {
        type: "heading",
        content: "Customer Reviews",
      },
      {
        type: "paragraph",
        content: "Read what our customers are saying about this product.",
      },
    ],
  },
});
