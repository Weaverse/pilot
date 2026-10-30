import { expect, test } from "@playwright/test";
import {
  createElement,
  Fragment,
  type ReactElement,
  type ReactNode,
} from "react";
import { loadAppModule, renderInApp } from "../support/render-app";

/**
 * Purchase quantity on the product page, observed in the markup the real
 * sections render: the quantity input, the hidden `merchandiseId`/`quantity`
 * fields of the main and sticky Add to cart forms, and the variants handed to
 * Shop Pay.
 *
 * The selector and the buttons are separate sections that share one store,
 * and that store survives client-side navigation between products. A
 * quantity chosen on one product used to be what the next product's buttons
 * added to the cart.
 */

type Controls = {
  CartProvider: (props: { children?: ReactNode }) => ReactElement;
  ProductProvider: (props: {
    product: unknown;
    children?: ReactNode;
  }) => ReactElement;
  BuyButtons: (props: Record<string, unknown>) => ReactElement;
  StickyATCBar: (props: Record<string, unknown>) => ReactElement;
  QuantitySelector: (props: Record<string, unknown>) => ReactElement;
  useProductQtyStore: {
    getState: () => {
      setQuantity: (productId: string, quantity: number) => void;
      claim: (productId: string) => void;
    };
    setState: (state: Record<string, unknown>) => void;
    getInitialState: () => Record<string, unknown>;
  };
};

/**
 * Two server-rendering limits replaced by pass-throughs: Radix portals render
 * nothing until mounted, and the Shop Pay wrapper renders nothing until it
 * scrolls into view. The stand-ins print exactly the props they receive.
 */
const STUBS = {
  "@radix-ui/react-dialog": `
    export const Root = ({ children }) => children;
    export const Portal = ({ children }) => children;
    export const Content = ({ children }) => <div data-sticky-bar>{children}</div>;
    export const Title = ({ children }) => children;
  `,
  "~/components/product/shop-pay-button": `
    export function ProductShopPayButton({ variants }) {
      return <div data-shop-pay={JSON.stringify(variants)} />;
    }
  `,
};

let controls: Promise<Controls> | undefined;
function loadControls() {
  controls ??= loadAppModule<Controls>(
    "../tests/support/product-purchase-entry.ts",
    STUBS,
  );
  return controls;
}

function variant(productId: string, name: string) {
  return {
    id: `${productId}/variant-${name}`,
    availableForSale: true,
    selectedOptions: [{ name: "Size", value: name }],
    price: { amount: "10.0", currencyCode: "USD" },
    compareAtPrice: null,
    image: null,
    product: { title: productId, handle: productId },
  };
}

function product(id: string, selected = "S") {
  return {
    id,
    title: id,
    handle: id,
    options: [{ name: "Size", optionValues: [{ name: "S" }, { name: "M" }] }],
    media: { nodes: [] },
    isBundle: null,
    selectedOrFirstAvailableVariant: variant(id, selected),
    adjacentVariants: [],
  };
}

type Purchase = {
  selector: number | null;
  addToCart: number[];
  shopPay: number | null;
};

/** What each purchase control would buy for `productData`. */
async function purchaseFor(
  productData: ReturnType<typeof product>,
  { withSelector = true } = {},
): Promise<Purchase> {
  const {
    CartProvider,
    ProductProvider,
    BuyButtons,
    StickyATCBar,
    QuantitySelector,
  } = await loadControls();
  // As on the product page: the root's cart store, and one product store for
  // every purchase control of the product.
  const html = await renderInApp({ product: productData }, () =>
    createElement(
      CartProvider,
      null,
      createElement(
        ProductProvider,
        { product: productData },
        createElement(
          Fragment,
          null,
          withSelector
            ? createElement(QuantitySelector, { labelText: "Quantity" })
            : null,
          createElement(BuyButtons, {
            addToCartText: "Add",
            soldOutText: "Sold out",
            showShopPayButton: true,
            showStickyBar: false,
          }),
          createElement(StickyATCBar, {}),
        ),
      ),
    ),
  );

  const field = (form: string, name: string) =>
    (new RegExp(`<input[^>]*name="${name}"[^>]*>`).exec(form)?.[0] ?? "").match(
      /value="([^"]*)"/,
    )?.[1];
  const forms = [...html.matchAll(/<form[\s\S]*?<\/form>/g)].map((m) => m[0]);
  const selector = html
    .replace(/<form[\s\S]*?<\/form>/g, "")
    .match(/<input[^>]*value="(\d+)"/);
  const addToCart = forms
    .filter((form) => form.includes('name="merchandiseId"'))
    .map((form) => {
      expect(field(form, "merchandiseId")).toBe(
        productData.selectedOrFirstAvailableVariant.id,
      );
      return Number(field(form, "quantity"));
    });
  const shopPay = html.match(/data-shop-pay="([^"]+)"/);

  return {
    selector: selector ? Number(selector[1]) : null,
    addToCart,
    shopPay: shopPay
      ? JSON.parse(shopPay[1].replaceAll("&quot;", '"'))[0].quantity
      : null,
  };
}

/**
 * Runs store actions, then shows their result to the server render.
 *
 * Zustand renders the store's creation state on the server, which is always
 * "nothing chosen". The defect lives in client renders after the shopper has
 * chosen a quantity, so the state the real actions produced is copied onto
 * the object the server snapshot reads.
 */
async function act(
  run: (store: ReturnType<Controls["useProductQtyStore"]["getState"]>) => void,
) {
  const { useProductQtyStore } = await loadControls();
  run(useProductQtyStore.getState());
  const { productId, quantity } = useProductQtyStore.getState() as unknown as {
    productId: string | null;
    quantity: number;
  };
  Object.assign(useProductQtyStore.getInitialState(), { productId, quantity });
}

test.beforeEach(async () => {
  const { useProductQtyStore } = await loadControls();
  useProductQtyStore.setState({ productId: null, quantity: 1 });
  await act(() => undefined);
});

test("a newly opened product starts every purchase control at 1", async () => {
  await act((store) => store.setQuantity("wine-a", 3));

  const next = await purchaseFor(product("wine-b"));

  expect(next).toEqual({ selector: 1, addToCart: [1, 1], shopPay: 1 });
});

test("every purchase control buys the quantity chosen for the product", async () => {
  await act((store) => store.setQuantity("wine-a", 3));

  const chosen = await purchaseFor(product("wine-a"));

  expect(chosen).toEqual({ selector: 3, addToCart: [3, 3], shopPay: 3 });
});

test("choosing another variant of the same product keeps the quantity", async () => {
  await act((store) => store.setQuantity("wine-a", 3));

  const otherVariant = await purchaseFor(product("wine-a", "M"));

  expect(otherVariant).toEqual({ selector: 3, addToCart: [3, 3], shopPay: 3 });
});

test("the buttons buy 1 for a new product even without a quantity selector", async () => {
  await act((store) => store.setQuantity("wine-a", 3));

  const withoutSelector = await purchaseFor(product("wine-b"), {
    withSelector: false,
  });

  expect(withoutSelector).toEqual({
    selector: null,
    addToCart: [1, 1],
    shopPay: 1,
  });
});

test("returning to a product after opening another starts it at 1 again", async () => {
  // `claim` is what the page runs once the next product is on screen.
  await act((store) => {
    store.setQuantity("wine-a", 3);
    store.claim("wine-b");
  });

  const returned = await purchaseFor(product("wine-a"));

  expect(returned).toEqual({ selector: 1, addToCart: [1, 1], shopPay: 1 });
});

test("opening the product a quantity belongs to does not reset it", async () => {
  await act((store) => {
    store.setQuantity("wine-a", 3);
    store.claim("wine-a");
  });

  const same = await purchaseFor(product("wine-a"));

  expect(same.addToCart).toEqual([3, 3]);
});
