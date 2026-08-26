import { expect, test } from "@playwright/test";
import { TranslationProvider, TranslationStore } from "@weaverse/hydrogen";
import { createElement, type ReactElement } from "react";
import { loadComponent, renderInApp } from "../support/render-app";

/**
 * The quick-shop label, exercised through the component that actually renders
 * it on a storefront.
 *
 * `QuickShopTrigger` resolves its own copy, but nothing about that is visible
 * from a test that constructs the trigger itself: the caller decides which
 * props exist, so a test supplying only `productHandle` and `buttonType` proves
 * the trigger is correct *when called that way*. The regression this guards
 * lived in the call, not the callee — `ProductCard` read the pre-migration
 * `pcardQuickShopButtonText` setting and forwarded it as `buttonText`, and the
 * trigger preferred that prop over the Translation Manager. Every published
 * override, live Studio edit, and deliberate clear was masked by a value the
 * caller had already resolved.
 *
 * So these mount the real `ProductCard` with the legacy setting present, and
 * assert on what a shopper would see. A prop-shaped bypass reappearing anywhere
 * between the theme settings and the button fails them, whether it is spelled
 * as a prop, a default, or a helper.
 */

/**
 * A storefront that set the quick-shop label before the migration.
 *
 * The trigger only renders its label in `text` mode, and only renders at all
 * when quick shop is enabled.
 */
const LEGACY_SETTINGS = {
  pcardEnableQuickShop: true,
  pcardQuickShopButtonType: "text",
  pcardQuickShopButtonText: "PERSISTED LEGACY LABEL",
};

const STATIC_CONTENT = { product: { quickShop: "BUNDLED LABEL" } };

/** The minimum `ProductCardFragment` shape the card reads while rendering. */
const PRODUCT = {
  id: "gid://shopify/Product/1",
  title: "Hoodie",
  handle: "hoodie",
  publishedAt: "2020-01-01T00:00:00Z",
  availableForSale: true,
  images: { nodes: [] },
  badges: [],
  options: [],
  variants: { nodes: [] },
  priceRange: {
    minVariantPrice: { amount: "10.0", currencyCode: "USD" },
    maxVariantPrice: { amount: "10.0", currencyCode: "USD" },
  },
};

/**
 * Renders the shipped `ProductCard` for a merchant carrying `LEGACY_SETTINGS`.
 *
 * `published` is what the Translation Manager has stored; `live` is an
 * unpublished Studio edit. Both are passed as the SDK delivers them, so the
 * precedence under test is the one production runs.
 */
async function renderCard({
  published,
  live,
}: {
  published?: Record<string, unknown> | null;
  live?: Record<string, string>;
}): Promise<string> {
  const { ProductCard } = await loadComponent<{
    ProductCard: (props: Record<string, unknown>) => ReactElement;
  }>("components/product-card/index.tsx");

  const store = new TranslationStore();
  if (live) {
    store.setOverrides(live);
  }

  return renderInApp(
    {
      weaverseTheme: {
        theme: LEGACY_SETTINGS,
        staticContent: STATIC_CONTENT,
        merchantOverrides: published ?? null,
      },
    },
    () =>
      createElement(TranslationProvider, {
        staticContent: STATIC_CONTENT,
        merchantOverrides: published ?? null,
        translationStore: store,
        children: createElement(ProductCard, { product: PRODUCT }),
      }),
  );
}

/** The label the button rendered, or `null` when the button has no text. */
function quickShopLabel(html: string): string | null {
  const match = html.match(
    /quick-shop[^>]*>.*?<span class="px-2">(.*?)<\/span>/,
  );
  return match ? match[1] : null;
}

test("a published translation outranks the legacy quick-shop setting", async () => {
  const html = await renderCard({
    published: { product: { quickShop: "PUBLISHED" } },
  });

  expect(quickShopLabel(html)).toBe("PUBLISHED");
  expect(html).not.toContain("PERSISTED LEGACY LABEL");
});

test("a live Studio edit outranks the legacy quick-shop setting", async () => {
  const html = await renderCard({ live: { "product.quickShop": "LIVE" } });

  expect(quickShopLabel(html)).toBe("LIVE");
  expect(html).not.toContain("PERSISTED LEGACY LABEL");
});

test("a published translation cleared to empty renders empty", async () => {
  // Clearing is an edit: the merchant removed the label deliberately, and
  // resurrecting their pre-migration copy would undo it on a live storefront.
  const html = await renderCard({ published: { product: { quickShop: "" } } });

  expect(quickShopLabel(html)).toBe("");
  expect(html).not.toContain("PERSISTED LEGACY LABEL");
  expect(html).not.toContain("BUNDLED LABEL");
});

test("a live edit cleared to empty previews as empty", async () => {
  const html = await renderCard({ live: { "product.quickShop": "" } });

  expect(quickShopLabel(html)).toBe("");
  expect(html).not.toContain("PERSISTED LEGACY LABEL");
  expect(html).not.toContain("BUNDLED LABEL");
});

test("with nothing translated the merchant's legacy label still renders", async () => {
  // The fallback has to keep working, or the guard above could be satisfied by
  // a component that ignores the legacy setting entirely.
  const html = await renderCard({});

  expect(quickShopLabel(html)).toBe("PERSISTED LEGACY LABEL");
  expect(html).not.toContain("BUNDLED LABEL");
});
