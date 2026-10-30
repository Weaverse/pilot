import type { CartData, CartLineData } from "~/components/cart/cart-store";

/**
 * Pilot's own cart endpoints (registered in `app/.server/cart.ts`). Like
 * Hydrogen's `/api/cart`, they are unprefixed: the market comes from the
 * `Referer`.
 */
export const CART_BUYER_IDENTITY_PATH = "/api/cart/buyer-identity";
export const CART_GIFT_CARDS_PATH = "/api/cart/gift-cards";

type DiscountAllocation = NonNullable<
  CartLineData["discountAllocations"]
>[number];

// Shopify's CartDiscountAllocation.targetType is LINE_ITEM | SHIPPING_LINE.
// Only LINE_ITEM allocations reduce the merchandise prices the cart renders;
// SHIPPING_LINE (free-delivery) allocations are excluded everywhere here because
// the cart shows no shipping charge for them to reconcile against.
function sumLineItemAllocations(
  allocations: readonly DiscountAllocation[] | null | undefined,
): number {
  if (!allocations?.length) {
    return 0;
  }
  return allocations.reduce(
    (sum, { discountedAmount, targetType }) =>
      targetType === "LINE_ITEM"
        ? sum + Number.parseFloat(discountedAmount.amount)
        : sum,
    0,
  );
}

/** Minor-unit precision for a currency (3 for KWD/BHD/TND, 0 for JPY, else 2). */
export function currencyDecimals(currencyCode: string): number {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currencyCode,
  }).resolvedOptions().maximumFractionDigits;
}

/**
 * MoneyV2-shaped value built from a float at the currency's own precision, so
 * the summed amount matches how `<Money>` formats it (no `toFixed(2)` rounding
 * that would corrupt 3-decimal or 0-decimal currencies).
 */
export function toMoney<C extends string>(
  amount: number,
  currencyCode: C,
): { amount: string; currencyCode: C } {
  return {
    amount: amount.toFixed(currencyDecimals(currencyCode)),
    currencyCode,
  };
}

/** Total LINE_ITEM discount applied to a single cart line (0 when none). */
export function lineDiscountTotal(line: CartLineData): number {
  return sumLineItemAllocations(line?.discountAllocations);
}

/**
 * Aggregate discount shown in the cart summary's `Discount` row.
 *
 * Every line's `allDiscountAllocations` (`discountAllocations(lineLevelOnly:
 * false)`) carries both its line-scoped discounts ("X% off <collection>") and
 * its share of order-level ones ("X% off entire order"). Summed over the
 * lines, that is the same total the deprecated `Cart.discountAllocations` plus
 * the line-level allocations gave. Shipping discounts are not product
 * discounts and are left out, as before.
 *
 * Per-line allocations are only as complete as the loaded line window
 * (`lines(first: 250)`). When the cart has more lines than that
 * (`pageInfo.hasNextPage`), a line-scoped discount past the window would be
 * silently omitted, so the summed figure would under-report and no longer
 * reconcile with checkout. In that rare case we return `null` and the caller
 * hides the row rather than render a wrong total — better no figure than a
 * misleading one.
 */
export function cartDiscountTotal(cart: CartData) {
  if (cart.lines.pageInfo?.hasNextPage) {
    return null;
  }
  const amount = cart.lines.nodes.reduce(
    (sum, line) => sum + sumLineItemAllocations(line.allDiscountAllocations),
    0,
  );
  const currencyCode =
    cart.cost?.subtotalAmount?.currencyCode ??
    cart.cost?.totalAmount?.currencyCode;
  if (amount <= 0 || !currencyCode) {
    return null;
  }
  return toMoney(amount, currencyCode);
}
