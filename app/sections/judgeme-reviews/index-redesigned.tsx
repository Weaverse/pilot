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
  ReviewImage,
  ReviewsFilter,
  ReviewsSummary as ReviewsSummaryType,
} from "~/types/judgeme-redesigned";
import { cn } from "~/utils/cn";
import { ReviewPagination } from "./components/review-pagination";
import { ReviewsFilters } from "./components/reviews-filters";
import { ReviewsList } from "./components/reviews-list";
import { ReviewsSummary } from "./components/reviews-summary";
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
    
    // Image modal state
    const [selectedImage, setSelectedImage] = useState<{
      image: ReviewImage;
      allImages: ReviewImage[];
      currentIndex: number;
    } | null>(null);

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

    // Image modal handlers
    const handleImageClick = useCallback((image: ReviewImage, allImages: ReviewImage[]) => {
      const currentIndex = allImages.findIndex(img => img.id === image.id);
      setSelectedImage({
        image,
        allImages,
        currentIndex: currentIndex >= 0 ? currentIndex : 0
      });
    }, []);

    const handleImageModalClose = useCallback(() => {
      setSelectedImage(null);
    }, []);

    const handleNextImage = useCallback(() => {
      if (selectedImage) {
        const nextIndex = (selectedImage.currentIndex + 1) % selectedImage.allImages.length;
        setSelectedImage({
          ...selectedImage,
          image: selectedImage.allImages[nextIndex],
          currentIndex: nextIndex
        });
      }
    }, [selectedImage]);

    const handlePreviousImage = useCallback(() => {
      if (selectedImage) {
        const prevIndex = (selectedImage.currentIndex - 1 + selectedImage.allImages.length) % selectedImage.allImages.length;
        setSelectedImage({
          ...selectedImage,
          image: selectedImage.allImages[prevIndex],
          currentIndex: prevIndex
        });
      }
    }, [selectedImage]);

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
              <h2 className="font-bold text-3xl text-gray-900 dark:text-gray-100">
                {labels.reviewsTitle}
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                See what our customers are saying about this product
              </p>
            </div>
            {showWriteReviewButton && enableReviewForm && (
              <Button
                variant="outline"
                onClick={handleToggleForm}
                disabled={showForm}
                className="rounded-lg border-gray-300 px-6 py-3 font-medium text-sm transition-colors hover:bg-gray-50 sm:self-start dark:border-gray-600 dark:hover:bg-gray-800"
              >
                {labels.writeReview}
              </Button>
            )}
          </div>

          {enableReviewForm && (
            <ReviewForm
              productId={productId}
              isOpen={showForm}
              onToggle={handleToggleForm}
              onSubmitted={handleReviewSubmitted}
              className="w-full"
            />
          )}
        </div>

        {/* Two-column Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
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
            </div>
          </div>

          {/* Right Column - Reviews List */}
          <div className="lg:col-span-2">
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
                <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
                  <svg
                    className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500"
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
                  <p className="mb-2 font-medium text-gray-900 text-lg dark:text-gray-100">
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
                maxReviewLength={1000}
              />

              {/* Pagination */}
              {enablePagination && (pagination?.totalPages || 0) > 1 && (
                <div className="border-gray-200 border-t pt-6 dark:border-gray-700">
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
        </div>

        {/* Reviews Info Footer */}
        {summary?.totalReviews > 0 && (
          <div className="mt-8 border-gray-200 border-t pt-8 text-center text-gray-600 text-sm dark:border-gray-700 dark:text-gray-400">
            {labels.showingReviews}{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {((pagination?.currentPage || 1) - 1) * (pagination?.perPage || 10) + 1}
            </span>{" "}
            {labels.ofTotalReviews}{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {Math.min(
                (pagination?.currentPage || 1) * (pagination?.perPage || 10),
                pagination?.totalReviews || 0,
              )}
            </span>{" "}
            {labels.of}{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {pagination?.totalReviews || 0}
            </span>{" "}
            {(summary?.totalReviews || 0) === 1 ? "review" : "reviews"}
          </div>
        )}
        
        {/* Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
            onClick={handleImageModalClose}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                handleImageModalClose();
              }
            }}
            tabIndex={-1}
          >
            <div 
              className="relative max-h-[90vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleImageModalClose}
                className="absolute -top-12 right-0 rounded-full bg-opacity-20 p-2 text-white hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white bg-white"
                aria-label="Close image"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Previous button */}
              {selectedImage.allImages.length > 1 && (
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-opacity-20 p-2 text-white hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white bg-white"
                  aria-label="Previous image"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              
              {/* Image */}
              <img
                src={selectedImage.image.urls.original || selectedImage.image.urls.huge || selectedImage.image.urls.small}
                alt={selectedImage.image.alt_text || "Review image"}
                className="max-h-[85vh] max-w-[85vw] object-contain"
                onError={() => {
                  // Image failed to load
                }}
              />
              
              {/* Next button */}
              {selectedImage.allImages.length > 1 && (
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-opacity-20 p-2 text-white hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white bg-white"
                  aria-label="Next image"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              
              {/* Image counter */}
              {selectedImage.allImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black bg-opacity-50 px-3 py-1 text-white">
                  {selectedImage.currentIndex + 1} / {selectedImage.allImages.length}
                </div>
              )}
            </div>
          </div>
        )}
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
