import {
  ShopPayButton,
  type ShopPayButtonProps,
} from "@shopify/hydrogen/react";

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
 * layout matches the other buttons.
 */
export function ProductShopPayButton({
  className,
  width,
  ...props
}: ShopPayButtonProps & { className?: string }) {
  return (
    <div
      className={className}
      style={{ width, minHeight: "var(--shop-pay-button-height)" }}
    >
      <ShopPayButton width="100%" {...props} />
    </div>
  );
}
