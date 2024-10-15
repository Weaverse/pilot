import { Money } from "@shopify/hydrogen";
import { CompareAtPrice } from "./compare-at-price";
import { isDiscounted } from "~/lib/utils";
import type {
  MoneyV2,
  ProductVariant,
} from "@shopify/hydrogen/storefront-api-types";
import clsx from "clsx";

export function VariantPrices({
  variant,
  showCompareAtPrice = true,
  className,
}: {
  variant: ProductVariant;
  showCompareAtPrice?: boolean;
  className?: string;
}) {
  if (variant) {
    let { price, compareAtPrice } = variant;
    return (
      <div className={clsx("flex gap-2", className)}>
        <Money withoutTrailingZeros data={price} />
        {showCompareAtPrice &&
          isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2) && (
            <CompareAtPrice data={compareAtPrice as MoneyV2} />
          )}
      </div>
    );
  }
  return null;
}
