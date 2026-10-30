import {
  buildProductSelectionSearchParams,
  type SelectedOption,
} from "@shopify/hydrogen";
import { createProductComponents } from "@shopify/hydrogen/react";
import type { MouseEvent } from "react";
import type { ProductQuery } from "~/graphql/queries";

/**
 * A product as `PRODUCT_QUERY` returns it. Every product form in Pilot (the
 * product page, quick shop, the single-product section) is built from it.
 */
export type ProductFormData = NonNullable<ProductQuery["product"]>;

/**
 * Hydrogen's product form bindings, typed with Pilot's product query.
 *
 * Render one `ProductProvider` per product (inside the root `CartProvider`);
 * every price, badge, option picker and buy button below it reads the
 * selection from the same store, so a variant change updates them all at once
 * without a loader round trip.
 */
export const { ProductProvider, useProduct, useProductForm } =
  createProductComponents<ProductFormData>();

/**
 * The variant to render for `product`.
 *
 * The form's selection when it resolves to a loaded variant. Otherwise the
 * server's `selectedOrFirstAvailableVariant`: while a selection the store can't
 * resolve locally is being loaded, and for the one render after a navigation
 * to another product, before the provider has hydrated the store with it.
 */
export function useSelectedVariant(product: ProductFormData) {
  const { selectedVariant } = useProduct();
  if (selectedVariant && selectedVariant.product?.handle === product.handle) {
    return selectedVariant;
  }
  return product.selectedOrFirstAvailableVariant;
}

/**
 * The product page path for a selection: `/products/{handle}?{options}`.
 *
 * Unrelated params in `base` (`?ref=campaign`, Weaverse preview params) are
 * kept; the product's own option params and a stale `variant` are replaced.
 * The path has no market prefix: Pilot's `Link` adds it, other callers use
 * `localizePath`.
 */
export function productOptionPath(
  product: { handle: string; options: { name: string }[] },
  selectedOptions: readonly SelectedOption[],
  handle: string = product.handle,
  base?: URLSearchParams,
) {
  const params = buildProductSelectionSearchParams({
    selectedOptions,
    optionNames: product.options.map((option) => option.name),
    base,
  });
  const query = params.toString();
  return `/products/${handle}${query ? `?${query}` : ""}`;
}

/**
 * A plain primary click on a link: the only click an option link handles
 * itself. Modified, middle and new-tab clicks keep the browser's behavior
 * (open the option URL elsewhere) and leave this page's selection alone.
 */
export function isPlainClick(event: MouseEvent<HTMLAnchorElement>) {
  const { target } = event.currentTarget;
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    (!target || target === "_self")
  );
}
