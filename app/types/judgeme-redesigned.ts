/**
 * TypeScript interfaces for JudgemeReviewSection Redesign
 * Based on data-model.md and contracts/api-contracts.ts
 */

export type Review = {
  id: string;
  title: string;
  body: string;
  rating: number; // 1-5 scale
  created_at: string; // ISO date string
  reviewer: Reviewer;
  pictures: ReviewImage[];
  product_external_id: string;
  verified_buyer: boolean;
  featured: boolean;
};

export type Reviewer = {
  id: number;
  name: string;
  email: string;
  phone?: string;
};

export type ReviewImage = {
  id: string;
  urls: {
    original: string;
    small: string;
    compact: string;
    huge: string;
  };
  alt_text?: string;
};

export type ReviewsSummary = {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
};

export type ReviewsFilter = {
  rating?: number; // 1-5, undefined for all ratings
  sortBy: "newest" | "oldest" | "rating_high" | "rating_low";
  page: number; // 1-based pagination
  perPage: number; // Fixed at 10
};

export type PaginationInfo = {
  totalReviews: number;
  currentPage: number;
  totalPages: number;
  perPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ReviewFormData = {
  rating: number; // 1-5
  title?: string;
  body: string;
  reviewerName: string;
  reviewerEmail: string;
  images?: File[];
};

export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationErrors = {
  rating?: string;
  title?: string;
  body?: string;
  reviewerName?: string;
  reviewerEmail?: string;
  images?: string[];
  general?: string;
};

// API Contract Interfaces
export type GetProductReviewsRequest = {
  productHandle: string;
  page?: number;
  perPage?: number;
  sort?: "newest" | "oldest" | "rating_high" | "rating_low";
  rating?: number;
};

export type GetProductReviewsResponse = {
  reviews: Review[];
  pagination: PaginationInfo;
  summary: ReviewsSummary;
};

export type SubmitReviewRequest = {
  productHandle: string;
  rating: number;
  title?: string;
  body: string;
  reviewerName: string;
  reviewerEmail: string;
  images?: File[];
};

export type SubmitReviewResponse = {
  success: boolean;
  reviewId?: string;
  message: string;
  errors?: ValidationError[];
};

// Component Props Interfaces
export type ReviewsSummaryProps = {
  summary: ReviewsSummary;
  onToggleForm: () => void;
  showForm: boolean;
  enableReviewForm: boolean;
};

export type ReviewsFiltersProps = {
  currentFilter: ReviewsFilter;
  onSortChange: (sortBy: ReviewsFilter["sortBy"]) => void;
  onRatingChange: (rating: number | undefined) => void;
  totalReviews: number;
  isLoading?: boolean;
};

export type ReviewsListProps = {
  reviews: Review[];
  isLoading: boolean;
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onImageClick: (image: ReviewImage, allImages: ReviewImage[]) => void;
  maxReviewLength: number;
};

export type ReviewItemProps = {
  review: Review;
  onImageClick: (image: ReviewImage, allImages: ReviewImage[]) => void;
  showReviewerEmail: boolean;
  showReviewDate: boolean;
  showVerificationBadge: boolean;
  maxReviewLength: number;
};

export type ReviewFormProps = {
  productHandle: string;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  errors?: ValidationErrors;
};

export type ReviewImageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentImage: ReviewImage | null;
  allImages: ReviewImage[];
  onNavigate: (direction: "prev" | "next") => void;
  showNavigation: boolean;
  showCounter: boolean;
};

export type RatingProgressBarProps = {
  rating: number; // 1-5
  count: number;
  totalReviews: number;
  onClick?: () => void;
};

export type ReviewPaginationProps = {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  style: "numbered" | "load_more" | "infinite";
  isLoading: boolean;
};

// Empty and Loading States
export type EmptyStates = {
  noReviews: {
    heading: string;
    message: string;
    showWriteReviewButton: boolean;
  };
  noFilteredReviews: {
    message: string;
    showClearFilters: boolean;
  };
  apiError: {
    message: string;
    showRetryButton: boolean;
  };
};

export type LoadingStates = {
  initialLoad: boolean;
  filterChange: boolean;
  pageChange: boolean;
  formSubmission: boolean;
};

// Weaverse Schema Settings
export type JudgemeReviewSectionSettings = {
  heading: string;
  enableReviewForm: boolean;
  reviewsPerPage: number;
  defaultSort: "newest" | "oldest" | "rating_high" | "rating_low";
  showRatingsBreakdown: boolean;
  showAverageRating: boolean;
  showTotalCount: boolean;
  showReviewerEmail: boolean;
  showReviewDate: boolean;
  showVerificationBadge: boolean;
  maxReviewLength: number;
  enableFiltering: boolean;
  enableSorting: boolean;
  enableImageModal: boolean;
  enablePagination: boolean;
  formButtonText?: string;
  requireLogin?: boolean;
  paginationStyle?: "numbered" | "load_more" | "infinite";
  showImageNavigation?: boolean;
  showImageCounter?: boolean;
};
