import { Money } from "@shopify/hydrogen";
import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";
import clsx from "clsx";
import type { ProductVariantFragment } from "storefront-api.generated";
import { isDiscounted } from "~/utils/product";
import { CompareAtPrice } from "./compare-at-price";

export function VariantPrices({
  variant,
  showCompareAtPrice = true,
  className,
}: {
  variant: ProductVariantFragment;
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
