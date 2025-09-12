import { useSearchParams } from "react-router";
import type { ReviewsFilter } from "~/types/judgeme-redesigned";

type UseReviewsFilterOptions = {
  defaultPerPage?: number;
  defaultSort?: "newest" | "oldest" | "rating_high" | "rating_low";
};

/**
 * Custom hook for managing reviews filter state via URL search parameters
 * This provides a clean interface for filter controls and ensures filters are shareable via URL
 */
export function useReviewsFilter(options: UseReviewsFilterOptions = {}) {
  const { defaultPerPage = 10, defaultSort = "newest" } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  // Get current filter values from URL
  const currentFilter: ReviewsFilter = {
    page: Number.parseInt(searchParams.get("page") || "1", 10),
    perPage: Number.parseInt(
      searchParams.get("perPage") || defaultPerPage.toString(),
      10,
    ),
    sortBy:
      (searchParams.get("sortBy") as ReviewsFilter["sortBy"]) || defaultSort,
    rating: searchParams.get("rating")
      ? Number.parseInt(searchParams.get("rating")!, 10)
      : undefined,
  };

  /**
   * Update filter values and update URL
   */
  const updateFilter = (updates: Partial<ReviewsFilter>) => {
    const newFilter = { ...currentFilter, ...updates };
    const params = new URLSearchParams();

    // Only add params that differ from defaults
    if (newFilter.page > 1) {
      params.set("page", newFilter.page.toString());
    }
    if (newFilter.perPage !== defaultPerPage) {
      params.set("perPage", newFilter.perPage.toString());
    }
    if (newFilter.sortBy !== defaultSort) {
      params.set("sortBy", newFilter.sortBy);
    }
    if (newFilter.rating !== undefined) {
      params.set("rating", newFilter.rating.toString());
    }

    setSearchParams(params, { replace: true });
  };

  /**
   * Set page number
   */
  const setPage = (page: number) => {
    updateFilter({ page });
  };

  /**
   * Set sort option
   */
  const setSort = (sortBy: ReviewsFilter["sortBy"]) => {
    updateFilter({ sortBy, page: 1 }); // Reset to first page when sorting
  };

  /**
   * Set rating filter
   */
  const setRating = (rating: number | undefined) => {
    updateFilter({ rating, page: 1 }); // Reset to first page when filtering
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchParams();
  };

  /**
   * Check if any filters are applied (excluding pagination)
   */
  const hasActiveFilters =
    currentFilter.rating !== undefined ||
    currentFilter.sortBy !== defaultSort ||
    currentFilter.perPage !== defaultPerPage;

  /**
   * Get active filter count (excluding pagination)
   */
  const activeFilterCount = [
    currentFilter.rating !== undefined ? 1 : 0,
    currentFilter.sortBy !== defaultSort ? 1 : 0,
    currentFilter.perPage !== defaultPerPage ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  /**
   * Generate shareable URL with current filters
   */
  const getShareableUrl = (baseUrl: string) => {
    const url = new URL(baseUrl);
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  };

  return {
    // Current filter state
    filter: currentFilter,

    // Actions
    updateFilter,
    setPage,
    setSort,
    setRating,
    clearFilters,

    // Derived state
    hasActiveFilters,
    activeFilterCount,
    getShareableUrl,

    // Raw search params for advanced usage
    searchParams,
    setSearchParams,
  };
}

/**
 * Hook for managing multiple filter states with debouncing
 * Useful for complex filter scenarios
 */
export function useDebouncedReviewsFilter(
  options: UseReviewsFilterOptions & { debounceMs?: number } = {},
) {
  const { debounceMs = 300, ...filterOptions } = options;
  const reviewsFilter = useReviewsFilter(filterOptions);
  const [debouncedFilter, setDebouncedFilter] = useState(reviewsFilter.filter);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(reviewsFilter.filter);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [reviewsFilter.filter, debounceMs]);

  return {
    ...reviewsFilter,
    debouncedFilter,
  };
}

// Import React for the debounce hook
import { useEffect, useState } from "react";
