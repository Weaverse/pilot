import type { MoneyV2 } from "@shopify/hydrogen";

type PredictiveSearchResultItemImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
} | null;

export type NormalizedPredictiveSearch = {
  results: NormalizedPredictiveSearchResults;
  totalResults: number;
};

export type NormalizedPredictiveSearchResults = Array<
  | { type: "queries"; items: NormalizedPredictiveSearchResultItem[] }
  | { type: "products"; items: NormalizedPredictiveSearchResultItem[] }
  | { type: "collections"; items: NormalizedPredictiveSearchResultItem[] }
  | { type: "pages"; items: NormalizedPredictiveSearchResultItem[] }
  | { type: "articles"; items: NormalizedPredictiveSearchResultItem[] }
>;

export type NormalizedPredictiveSearchResultItem = {
  __typename?:
    | "SearchQuerySuggestion"
    | "Product"
    | "Collection"
    | "Page"
    | "Article";
  handle: string;
  id: string;
  image?: PredictiveSearchResultItemImage;
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  styledTitle?: string;
  title: string;
  vendor?: string;
  url?: string;
};
