import type {
  PredictiveArticleFragment,
  PredictiveCollectionFragment,
  PredictiveProductFragment,
} from "storefront-api.generated";

type PredictiveSearchResultItemImage =
  | PredictiveCollectionFragment["image"]
  | PredictiveArticleFragment["image"]
  | PredictiveProductFragment["featuredImage"];

type PredictiveSearchResultItemPrice =
  PredictiveProductFragment["selectedOrFirstAvailableVariant"]["price"];

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
  __typename?: "SearchQuerySuggestion" | "Product" | "Article";
  handle: string;
  id: string;
  image?: PredictiveSearchResultItemImage;
  price?: PredictiveSearchResultItemPrice;
  compareAtPrice?: PredictiveSearchResultItemPrice;
  styledTitle?: string;
  title: string;
  vendor: string;
  url: string;
};
