import { Link } from "@remix-run/react";
import { Image, Money, Pagination } from "@shopify/hydrogen";
import { SearchResultItemProps } from "./types";

export function SearchResultItem({
  goToSearchResult,
  item,
}: SearchResultItemProps) {
  return (
    <li key={item.id}>
      <Link
        className="flex gap-4"
        onClick={goToSearchResult}
        to={item.url}
        data-type={item.__typename}
      >
        {item.__typename === "Product" && (
          <div className="h-20 w-20 shrink-0">
            {item.image?.url && (
              <Image
                alt={item.image.altText ?? ""}
                src={item.image.url}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        )}
        <div className="space-y-2">
          {item.vendor && (
            <div>
              <small className="text-foreground-subtle">By {item.vendor}</small>
            </div>
          )}
          {item.styledTitle ? (
            <div
              dangerouslySetInnerHTML={{
                __html: item.styledTitle,
              }}
            />
          ) : (
            <div
              className={
                item.__typename === "Product" ? "line-clamp-1" : "line-clamp-2"
              }
            >
              {item.title}
            </div>
          )}
          <div className="flex gap-2">
            {item?.compareAtPrice && (
              <span className="text-label-sale line-through">
                <Money data={item.compareAtPrice} />
              </span>
            )}
            {item?.price && (
              <span>
                <Money data={item.price} />
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}
