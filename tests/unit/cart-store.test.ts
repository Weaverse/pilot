import { expect, test } from "@playwright/test";
import { CartForm, type OptimisticCartLineInput } from "@shopify/hydrogen";
import {
  canApplyNullCartBootstrap,
  markCartBootstrapStarted,
  recordCartMutation,
} from "../../app/components/cart/cart-baseline";
import {
  applyOptimisticMutations,
  buildOptimisticAddCart,
  getCartLineRenderKeys,
} from "../../app/components/cart/optimistic-cart";
import { useCartStore } from "../../app/components/cart/store";

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

function createAuthoritativeCart(quantity: number, updatedAt: string) {
  const cart = buildOptimisticAddCart([createLine(VARIANT_ID, quantity)]);
  if (!cart) {
    throw new Error("Expected test cart");
  }
  return {
    ...cart,
    id: "gid://shopify/Cart/1",
    updatedAt,
    isOptimistic: false,
    lines: {
      ...cart.lines,
      nodes: cart.lines.nodes.map((line) => ({
        ...line,
        id: "gid://shopify/CartLine/1",
        isOptimistic: false,
      })),
    },
  };
}

function createLoadingAddFetcher(
  authoritativeQuantity: number,
  updatedAt = "2026-07-26T10:00:01.000Z",
) {
  const formData = new FormData();
  formData.set(
    CartForm.INPUT_NAME,
    JSON.stringify({
      action: CartForm.ACTIONS.LinesAdd,
      inputs: { lines: [createLine()] },
    }),
  );
  return {
    state: "loading",
    formData,
    data: {
      cart: createAuthoritativeCart(authoritativeQuantity, updatedAt),
    },
  } as Parameters<typeof applyOptimisticMutations>[1][number];
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

test("keeps the line render key through the authoritative handoff", () => {
  const optimisticCart = buildOptimisticAddCart([createLine()]);
  const authoritativeCart = createAuthoritativeCart(
    1,
    "2026-07-27T10:00:00.000Z",
  );

  expect(optimisticCart?.lines.nodes[0].id).not.toBe(
    authoritativeCart.lines.nodes[0].id,
  );
  expect(getCartLineRenderKeys(optimisticCart?.lines.nodes ?? [])).toEqual(
    getCartLineRenderKeys(authoritativeCart.lines.nodes),
  );
});

test("falls back to line IDs for duplicate merchandise render keys", () => {
  const cart = createAuthoritativeCart(1, "2026-07-27T10:00:00.000Z");
  const firstLine = cart.lines.nodes[0];
  const secondLine = {
    ...firstLine,
    id: "gid://shopify/CartLine/2",
  };

  expect(getCartLineRenderKeys([firstLine, secondLine])).toEqual([
    firstLine.id,
    secondLine.id,
  ]);
});

for (const authoritativeQuantity of [1, 2]) {
  test(`does not reapply a loading add after the authoritative cart reaches quantity ${authoritativeQuantity}`, () => {
    const baseline = createAuthoritativeCart(
      authoritativeQuantity,
      "2026-07-26T10:00:01.000Z",
    );
    const fetcher = createLoadingAddFetcher(authoritativeQuantity);

    const cart = applyOptimisticMutations(baseline, [fetcher], []);

    expect(cart?.totalQuantity ?? baseline.totalQuantity).toBe(
      authoritativeQuantity,
    );
  });
}

test("keeps the loading add overlay while the baseline is still older", () => {
  const baseline = createAuthoritativeCart(1, "2026-07-26T10:00:00.000Z");
  const fetcher = createLoadingAddFetcher(2, "2026-07-26T10:00:01.000Z");

  const cart = applyOptimisticMutations(baseline, [fetcher], []);

  expect(cart?.totalQuantity).toBe(2);
  expect(cart?.lines.nodes[0]).toMatchObject({ isOptimistic: true });
});

test("blocks a null bootstrap after a cart mutation lands", () => {
  markCartBootstrapStarted();

  recordCartMutation(createAuthoritativeCart(1, "2026-07-26T10:00:02.000Z"));

  expect(canApplyNullCartBootstrap()).toBe(false);
});
