import { Await, Link, useRouteLoaderData } from "@remix-run/react";
import { useAnalytics } from "@shopify/hydrogen";
import clsx from "clsx";
import { Suspense, useMemo } from "react";
import { IconHandBag } from "~/components/icons";
import { useIsHydrated } from "~/hooks/use-is-hydrated";
import type { RootLoader } from "~/root";

export function CartCount({
  isHome,
  openCart,
  isTransparent,
}: {
  isHome: boolean;
  openCart: () => void;
  isTransparent: boolean;
}) {
  let rootData = useRouteLoaderData<RootLoader>("root");
  return (
    <Suspense
      fallback={
        <Badge
          count={0}
          dark={isHome}
          openCart={openCart}
          isTransparent={isTransparent}
        />
      }
    >
      <Await resolve={rootData?.cart}>
        {(cart) => (
          <Badge
            dark={isHome}
            openCart={openCart}
            count={cart?.totalQuantity || 0}
            cart={cart}
            isTransparent={isTransparent}
          />
        )}
      </Await>
    </Suspense>
  );
}

function Badge({
  openCart,
  dark,
  count,
  cart,
  isTransparent,
}: {
  count: number;
  dark: boolean;
  openCart: () => void;
  cart?: any;
  isTransparent: boolean;
}) {
  let isHydrated = useIsHydrated();
  let BadgeCounter = useMemo(
    () => (
      <>
        <IconHandBag className="w-5 h-5" />
        {count > 0 && (
          <div
            className={clsx(
              "text-[12px] leading-none text-center font-medium subpixel-antialiased",
              "flex items-center justify-center min-w-4 rounded-full p-0.5",
              "absolute top-0 -right-1",
              "transition-colors duration-300",
              "group-hover/header:bg-[var(--color-header-text)] group-hover/header:text-[var(--color-header-bg)]",
              isTransparent
                ? "text-[var(--color-header-text)] bg-[var(--color-transparent-header-text)]"
                : "bg-[var(--color-header-text)] text-[var(--color-header-bg)]",
            )}
          >
            <span>{count}</span>
          </div>
        )}
      </>
    ),
    [count, isTransparent],
  );

  let { publish } = useAnalytics();

  function handleOpenCart() {
    publish("custom_sidecart_viewed", { cart });
    openCart();
  }

  return isHydrated ? (
    <button
      type="button"
      onClick={handleOpenCart}
      className="relative flex items-center justify-center w-8 h-8 focus:ring-border"
    >
      {BadgeCounter}
    </button>
  ) : (
    <Link
      to="/cart"
      className="relative flex items-center justify-center w-8 h-8 focus:ring-border"
    >
      {BadgeCounter}
    </Link>
  );
}
