import { Money } from "@shopify/hydrogen";
import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";
import clsx from "clsx";
import { CompareAtPrice } from "~/components/compare-at-price";
import { Image } from "~/components/image";
import { Link } from "~/components/link";
import { RevealUnderline } from "~/reveal-underline";
import type {
  NormalizedPredictiveSearchResultItem,
  NormalizedPredictiveSearchResults,
} from "~/types/predictive-search";
import { isDiscounted } from "~/utils/product";

type SearchResultTypeProps = {
  items?: NormalizedPredictiveSearchResultItem[];
  type: NormalizedPredictiveSearchResults[number]["type"];
};

export function PredictiveSearchResult({ items, type }: SearchResultTypeProps) {
  let isSuggestions = type === "queries";

  return (
    <div key={type} className="predictive-search-result flex flex-col gap-4">
      <div className="uppercase font-bold border-b border-line-subtle pb-3">
        {isSuggestions ? "Suggestions" : type}
      </div>
      {items?.length ? (
        <ul
          className={clsx(
            type === "queries" && "space-y-1",
            type === "articles" && "space-y-3",
            type === "products" && "space-y-4",
          )}
        >
          {items.map((item: NormalizedPredictiveSearchResultItem) => (
            <SearchResultItem item={item} key={item.id} />
          ))}
        </ul>
      ) : (
        <div className="text-body-subtle">
          No {isSuggestions ? "suggestions" : type} available.
        </div>
      )}
    </div>
  );
}

type SearchResultItemProps = {
  item: NormalizedPredictiveSearchResultItem;
};

function SearchResultItem({
  item: {
    id,
    __typename,
    image,
    compareAtPrice,
    price,
    title,
    url,
    vendor,
    styledTitle,
  },
}: SearchResultItemProps) {
  return (
    <li key={id}>
      <Link
        className="flex gap-4"
        to={
          __typename === "SearchQuerySuggestion" || !url
            ? `/search?q=${id}`
            : url
        }
        data-type={__typename}
      >
        {__typename === "Product" && (
          <div className="h-20 w-20 shrink-0">
            {image?.url && (
              <Image
                alt={image.altText ?? ""}
                src={image.url}
                width={200}
                aspectRatio="1/1"
              />
            )}
          </div>
        )}
        <div className="space-y-1">
          {vendor && (
            <div className="text-body-subtle text-sm">By {vendor}</div>
          )}
          {styledTitle ? (
            <RevealUnderline as="div">
              <span dangerouslySetInnerHTML={{ __html: styledTitle }} />
            </RevealUnderline>
          ) : (
            <div
              className={clsx(
                __typename === "Product" ? "line-clamp-1" : "line-clamp-2",
              )}
            >
              <RevealUnderline>{title}</RevealUnderline>
            </div>
          )}
          {price && (
            <div className="flex gap-2 text-sm pt-1">
              <Money withoutTrailingZeros data={price as MoneyV2} />
              {isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2) && (
                <CompareAtPrice data={compareAtPrice as MoneyV2} />
              )}
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}
