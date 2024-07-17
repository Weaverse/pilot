import { Await, Link, useRouteLoaderData } from "@remix-run/react";
import { useAnalytics } from "@shopify/hydrogen";
import { Suspense, useMemo } from "react";
import { useIsHydrated } from "~/hooks/useIsHydrated";
import type { RootLoader } from "~/root";
import { IconBag } from "../Icon";

export function CartCount({
  isHome,
  openCart,
}: {
  isHome: boolean;
  openCart: () => void;
}) {
  const rootData = useRouteLoaderData<RootLoader>("root");

  return (
    <Suspense fallback={<Badge count={0} dark={isHome} openCart={openCart} />}>
      <Await resolve={rootData?.cart}>
        {(cart) => (
          <Badge
            dark={isHome}
            openCart={openCart}
            count={cart?.totalQuantity || 0}
            cart={cart}
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
}: {
  count: number;
  dark: boolean;
  openCart: () => void;
  cart?: any;
}) {
  const isHydrated = useIsHydrated();

  const BadgeCounter = useMemo(
    () => (
      <>
        <IconBag />
        <div className="bg-secondary text-inv-body absolute top-1 right-1 text-[0.625rem] font-medium subpixel-antialiased h-3 min-w-[0.75rem] flex items-center justify-center leading-none text-center rounded-full w-auto px-[0.125rem] pb-px">
          <span>{count || 0}</span>
        </div>
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, dark],
  );

  const { publish } = useAnalytics();

  function handleOpenCart() {
    publish("custom_sidecart_viewed", { cart });
    openCart();
  }

  return isHydrated ? (
    <button
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
