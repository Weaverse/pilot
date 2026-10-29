/**
 * The product page's purchase controls, bundled together with the cart and
 * product providers they read.
 *
 * They share module-level stores (the quantity store, Hydrogen's cart and
 * product stores), so a test has to load them from one bundle: compiling each
 * section separately would give each its own copy of the stores and hide
 * exactly the sharing under test.
 */
export { CartProvider } from "~/components/cart/cart-store";
export { ProductProvider } from "~/components/product/product-form";
export { default as BuyButtons } from "~/sections/main-product/buy-buttons";
export { StickyATCBar } from "~/sections/main-product/buy-buttons/sticky-atc-bar";
export {
  default as QuantitySelector,
  useProductQtyStore,
} from "~/sections/main-product/product-quantity-selector";
