import type { ProductCardFragment } from "storefront-api.generated";

export type SearchType = "products" | "articles" | "pages" | "collections";

export interface ArticleSearchResult {
  id: string;
  title: string;
  handle: string;
  image?: {
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  };
  publishedAt: string;
  excerpt?: string;
  blog: {
    handle: string;
    title: string;
  };
}

export interface PageSearchResult {
  id: string;
  title: string;
  handle: string;
  body?: string;
}

export interface CollectionSearchResult {
  id: string;
  title: string;
  handle: string;
  image?: {
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  };
}

export interface SearchResults {
  products: {
    nodes: ProductCardFragment[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
      hasPreviousPage: boolean;
      startCursor: string | null;
    } | null;
  };
  articles: ArticleSearchResult[];
  pages: PageSearchResult[];
  collections: CollectionSearchResult[];
}

export interface SearchCounts {
  products: number;
  articles: number;
  pages: number;
  collections: number;
}
