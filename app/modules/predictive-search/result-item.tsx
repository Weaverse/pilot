import { Image, Money } from "@shopify/hydrogen";
import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";
import clsx from "clsx";
import { Link } from "~/components/link";
import { CompareAtPrice } from "~/components/compare-at-price";
import { getImageAspectRatio, isDiscounted } from "~/lib/utils";
import type { SearchResultItemProps } from "../../types/predictive-search";

export function SearchResultItem({
  goToSearchResult,
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
        onClick={goToSearchResult}
        to={url}
        data-type={__typename}
      >
        {__typename === "Product" && (
          <div className="h-20 w-20 shrink-0">
            {image?.url && (
              <Image
                alt={image.altText ?? ""}
                src={image.url}
                width={200}
                height={200}
                aspectRatio={getImageAspectRatio(image, "adapt")}
                className="h-full w-full object-cover object-center"
              />
            )}
          </div>
        )}
        <div className="space-y-1">
          {vendor && <div className="text-body/50 text-sm">By {vendor}</div>}
          {styledTitle ? (
            <div
              className="underline-animation"
              dangerouslySetInnerHTML={{ __html: styledTitle }}
            />
          ) : (
            <div
              className={clsx(
                __typename === "Product" ? "line-clamp-1" : "line-clamp-2",
              )}
            >
              <span className="underline-animation">{title}</span>
            </div>
          )}
          {price && (
            <div className="flex gap-2 text-sm">
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
