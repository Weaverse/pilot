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
  PredictiveProductFragment["variants"]["nodes"][0]["price"];

export type NormalizedPredictiveSearch = {
  results: NormalizedPredictiveSearchResults;
  totalResults: number;
};

export type NormalizedPredictiveSearchResults = Array<
  | { type: "queries"; items: Array<NormalizedPredictiveSearchResultItem> }
  | { type: "products"; items: Array<NormalizedPredictiveSearchResultItem> }
  | { type: "collections"; items: Array<NormalizedPredictiveSearchResultItem> }
  | { type: "pages"; items: Array<NormalizedPredictiveSearchResultItem> }
  | { type: "articles"; items: Array<NormalizedPredictiveSearchResultItem> }
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
