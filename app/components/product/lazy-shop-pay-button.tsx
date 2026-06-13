import { ShopPayButton } from "@shopify/hydrogen";
import type { ComponentProps } from "react";
import { useInView } from "react-intersection-observer";

type ShopPayButtonProps = ComponentProps<typeof ShopPayButton>;

/**
 * Defers Shopify's `shop-js` bundle (~860KB) until the Shop Pay button nears the
 * viewport. The `<shop-pay-button>` web component fetches that script the moment
 * it mounts, so rendering it eagerly costs every page the full download even when
 * the button sits far below the fold (e.g. a Featured Product section on the home
 * page). Above-the-fold instances (the product buy box) still mount immediately
 * thanks to the 300px root margin, so accelerated checkout is unaffected.
 *
 * A reserved-height placeholder (matching `--shop-pay-button-height`) keeps the
 * layout stable, so swapping in the real button does not shift content (no CLS).
 */
export function LazyShopPayButton(props: ShopPayButtonProps) {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "300px" });

  if (inView) {
    return <ShopPayButton {...props} />;
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={props.className}
      style={{ width: props.width, height: "var(--shop-pay-button-height)" }}
    />
  );
}
