import { expect, test } from "@playwright/test";
import type {
  CartData,
  CartLineData,
} from "../../app/components/cart/cart-store";
import {
  cartDiscountTotal,
  lineDiscountTotal,
  toMoney,
} from "../../app/utils/cart";

/**
 * The cart summary's `Discount` row and each line's savings.
 *
 * Hydrogen's cart store replaced Pilot's optimistic engine, but these totals
 * are still Pilot's: they are computed from the cart fragment in
 * `app/.server/cart.ts`, where `allDiscountAllocations` (line-level and
 * order-level) replaces the deprecated `Cart.discountAllocations`.
 */

type Allocation = { amount: string; targetType: "LINE_ITEM" | "SHIPPING_LINE" };

function allocations(list: Allocation[], currencyCode: string) {
  return list.map(({ amount, targetType }) => ({
    discountedAmount: { amount, currencyCode },
    targetType,
  }));
}

function line({
  lineLevel = [],
  all = [],
  currencyCode = "USD",
}: {
  lineLevel?: Allocation[];
  all?: Allocation[];
  currencyCode?: string;
}) {
  return {
    discountAllocations: allocations(lineLevel, currencyCode),
    allDiscountAllocations: allocations(all, currencyCode),
  } as unknown as CartLineData;
}

function cart(
  lines: CartLineData[],
  { currencyCode = "USD", hasNextPage = false } = {},
) {
  return {
    lines: { nodes: lines, pageInfo: { hasNextPage } },
    cost: { subtotalAmount: { amount: "100.0", currencyCode } },
  } as unknown as CartData;
}

test("the summary discount sums line and order-level allocations", () => {
  // A line discount (5) plus each line's share of an order discount (3 + 2).
  const total = cartDiscountTotal(
    cart([
      line({
        lineLevel: [{ amount: "5.00", targetType: "LINE_ITEM" }],
        all: [
          { amount: "5.00", targetType: "LINE_ITEM" },
          { amount: "3.00", targetType: "LINE_ITEM" },
        ],
      }),
      line({ all: [{ amount: "2.00", targetType: "LINE_ITEM" }] }),
    ]),
  );

  expect(total).toEqual({ amount: "10.00", currencyCode: "USD" });
});

test("shipping discounts are not product discounts", () => {
  expect(
    cartDiscountTotal(
      cart([line({ all: [{ amount: "7.00", targetType: "SHIPPING_LINE" }] })]),
    ),
  ).toBe(null);
});

test("no discount means no discount row", () => {
  expect(cartDiscountTotal(cart([line({})]))).toBe(null);
});

test("a cart past the loaded line window hides the row instead of under-reporting", () => {
  expect(
    cartDiscountTotal(
      cart([line({ all: [{ amount: "5.00", targetType: "LINE_ITEM" }] })], {
        hasNextPage: true,
      }),
    ),
  ).toBe(null);
});

test("the total keeps the currency's own precision", () => {
  const jpy = cartDiscountTotal(
    cart(
      [
        line({
          all: [{ amount: "500", targetType: "LINE_ITEM" }],
          currencyCode: "JPY",
        }),
      ],
      { currencyCode: "JPY" },
    ),
  );
  const kwd = cartDiscountTotal(
    cart(
      [
        line({
          all: [{ amount: "1.255", targetType: "LINE_ITEM" }],
          currencyCode: "KWD",
        }),
      ],
      { currencyCode: "KWD" },
    ),
  );

  expect({ jpy, kwd }).toEqual({
    jpy: { amount: "500", currencyCode: "JPY" },
    kwd: { amount: "1.255", currencyCode: "KWD" },
  });
  expect(toMoney(12.5, "USD")).toEqual({
    amount: "12.50",
    currencyCode: "USD",
  });
});

test("a line's savings count only its own line-level discounts", () => {
  // The order-level share is shown in the summary, not on the line.
  expect(
    lineDiscountTotal(
      line({
        lineLevel: [
          { amount: "4.00", targetType: "LINE_ITEM" },
          { amount: "9.00", targetType: "SHIPPING_LINE" },
        ],
        all: [
          { amount: "4.00", targetType: "LINE_ITEM" },
          { amount: "6.00", targetType: "LINE_ITEM" },
        ],
      }),
    ),
  ).toBe(4);
});
