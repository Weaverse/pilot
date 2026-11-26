import { canAddToCart } from "@shopify/hydrogen";
import {
  ShopPayButton,
  type ShopPayButtonProps,
} from "@shopify/hydrogen/react";
import { useCart } from "~/components/cart/cart-store";
import {
  type ProductFormData,
  useProduct,
} from "~/components/product/product-form";
import { cn } from "~/utils/cn";

/**
 * Hydrogen's Shop Pay button in Pilot's buy boxes.
 *
 * Hydrogen 2026.10 renders the button on the server (declarative shadow DOM
 * with a link to the same-origin `/cart/<variant>:<qty>` permalink) and no
 * longer loads Shopify's `shop-js` bundle, so it is rendered eagerly: it shows
 * before JavaScript loads and works without it. Classic Pilot deferred the
 * button until it neared the viewport only to postpone that ~860KB script.
 *
 * The wrapper keeps `--shop-pay-button-height` as `min-height` so the buy box
 * layout matches the other buttons. The button's shadow styles hard-code a
 * 12px radius with no CSS variable or `part`, so the wrapper takes over the
 * shape: the button is stretched to fill it, the wrapper is clipped to the
 * theme radius and painted the button's own colors (so the inner 12px corners
 * disappear into it), and it draws the focus ring the clip would cut off.
 *
 * Render it inside the product's `ProductProvider`: like the add-to-cart
 * button, it is disabled when `canAddToCart()` fails or a cart line change is
 * in flight (a disabled button renders without an `href`).
 */
export function ProductShopPayButton({
  className,
  width,
  product,
  ...props
}: ShopPayButtonProps & { className?: string; product: ProductFormData }) {
  const { options } = useProduct();
  const pending = useCart((state) => state.pending.lines.size > 0);
  const disabled = !canAddToCart(product, options) || pending;
  return (
    <div
      className={cn(
        "flex overflow-hidden rounded-(--shop-pay-button-border-radius) bg-[#5433eb] transition-colors duration-150 *:flex *:w-full",
        "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#9c83f8]",
        disabled ? "opacity-50" : "hover:bg-[#4524db]",
        className,
      )}
      style={{ width, minHeight: "var(--shop-pay-button-height)" }}
    >
      <ShopPayButton width="100%" {...props} disabled={disabled} />
    </div>
  );
}
