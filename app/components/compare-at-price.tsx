import { useMoney } from "@shopify/hydrogen";
import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";
import { cn } from "~/utils/cn";

export function CompareAtPrice({
  data,
  className,
}: {
  data: MoneyV2;
  className?: string;
}) {
  let { currencyNarrowSymbol, withoutTrailingZerosAndCurrency } =
    useMoney(data);
  return (
    <span
      className={cn("strike text-[var(--color-compare-price-text)]", className)}
    >
      {currencyNarrowSymbol}
      {withoutTrailingZerosAndCurrency}
    </span>
  );
}
