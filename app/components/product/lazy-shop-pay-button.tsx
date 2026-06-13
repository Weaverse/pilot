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
 * The wrapper always reserves `--shop-pay-button-height` via `min-height`, so the
 * space stays held both before the button mounts and while `shop-js` is still
 * loading (Hydrogen's `ShopPayButton` renders an empty element until the script
 * resolves). That keeps the layout stable end-to-end — no CLS.
 */
export function LazyShopPayButton({
  className,
  width,
  ...props
}: ShopPayButtonProps) {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "300px" });

  return (
    <div
      ref={ref}
      className={className}
      aria-hidden={inView ? undefined : true}
      style={{ width, minHeight: "var(--shop-pay-button-height)" }}
    >
      {inView ? <ShopPayButton width="100%" {...props} /> : null}
    </div>
  );
}
