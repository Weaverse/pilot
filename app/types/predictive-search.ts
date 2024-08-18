import type { FormProps, useFetcher } from "@remix-run/react";
import type {
  PredictiveArticleFragment,
  PredictiveCollectionFragment,
  PredictiveProductFragment,
} from "storefrontapi.generated";

export type UseSearchReturn = NormalizedPredictiveSearch & {
  searchInputRef: React.MutableRefObject<HTMLInputElement | null>;
  searchTerm: React.MutableRefObject<string>;
};

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
  __typename: string | undefined;
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

export type SearchResultTypeProps = {
  goToSearchResult: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  items?: NormalizedPredictiveSearchResultItem[];
  searchTerm: UseSearchReturn["searchTerm"];
  type: NormalizedPredictiveSearchResults[number]["type"];
};

export type SearchResultItemProps = Pick<
  SearchResultTypeProps,
  "goToSearchResult"
> & {
  item: NormalizedPredictiveSearchResultItem;
};

type ChildrenRenderProps = {
  fetchResults: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fetcher: ReturnType<typeof useFetcher<NormalizedPredictiveSearchResults>>;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
};

export type SearchFromProps = {
  action?: FormProps["action"];
  method?: FormProps["method"];
  className?: string;
  children: (passedProps: ChildrenRenderProps) => React.ReactNode;
  [key: string]: unknown;
};
