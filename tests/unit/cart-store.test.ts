import { expect, test } from "@playwright/test";
import type { OptimisticCartLineInput } from "@shopify/hydrogen";
import {
  buildOptimisticAddCart,
  useCartStore,
} from "../../app/components/cart/store";

const VARIANT_ID = "gid://shopify/ProductVariant/1";

function createLine(
  merchandiseId = VARIANT_ID,
  quantity = 1,
): OptimisticCartLineInput {
  return {
    merchandiseId,
    quantity,
    selectedVariant: {
      id: merchandiseId,
      title: "Default Title",
      availableForSale: true,
      price: { amount: "25.00", currencyCode: "USD" },
      product: {
        id: "gid://shopify/Product/1",
        handle: "test-product",
        title: "Test product",
      },
      selectedOptions: [{ name: "Title", value: "Default Title" }],
    },
  } as OptimisticCartLineInput;
}

function resetCartStore() {
  useCartStore.setState({
    serverCart: null,
    pendingAdds: new Map(),
    lastAddError: null,
    isOpen: false,
  });
}

test.beforeEach(resetCartStore);
test.afterEach(resetCartStore);

test("stages and clears concurrent adds independently", () => {
  const firstToken = useCartStore.getState().stagePendingAdd([createLine()]);
  const secondToken = useCartStore
    .getState()
    .stagePendingAdd([createLine("gid://shopify/ProductVariant/2", 2)]);

  expect(firstToken).not.toBeNull();
  expect(secondToken).not.toBeNull();
  expect(secondToken).not.toBe(firstToken);
  expect(useCartStore.getState().pendingAdds.size).toBe(2);

  useCartStore.getState().clearPendingAdd(firstToken as string);

  expect(useCartStore.getState().pendingAdds.size).toBe(1);
  expect(useCartStore.getState().pendingAdds.has(secondToken as string)).toBe(
    true,
  );
});

test("does not stage a line without selected variant data", () => {
  const token = useCartStore.getState().stagePendingAdd([
    {
      merchandiseId: VARIANT_ID,
      quantity: 1,
    } as OptimisticCartLineInput,
  ]);

  expect(token).toBeNull();
  expect(useCartStore.getState().pendingAdds.size).toBe(0);
});

test("clears the previous add error when a new add is staged", () => {
  useCartStore.getState().setLastAddError("Previous failure");

  useCartStore.getState().stagePendingAdd([createLine()]);

  expect(useCartStore.getState().lastAddError).toBeNull();
});

test("builds a stable first-add cart with skeleton-safe money", () => {
  const firstCart = buildOptimisticAddCart([createLine(VARIANT_ID, 2)]);
  const secondCart = buildOptimisticAddCart([createLine(VARIANT_ID, 2)]);

  expect(firstCart).not.toBeNull();
  expect(firstCart?.isOptimistic).toBe(true);
  expect(firstCart?.totalQuantity).toBe(2);
  expect(firstCart?.cost.totalAmount).toEqual({
    amount: "0.0",
    currencyCode: "USD",
  });
  expect(firstCart?.lines.nodes[0]).toMatchObject({
    id: `optimistic-${VARIANT_ID}`,
    quantity: 2,
    isOptimistic: true,
    cost: {
      totalAmount: { amount: "0.0", currencyCode: "USD" },
      amountPerQuantity: { amount: "0.0", currencyCode: "USD" },
    },
  });
  expect(secondCart?.lines.nodes[0].id).toBe(firstCart?.lines.nodes[0].id);
});
