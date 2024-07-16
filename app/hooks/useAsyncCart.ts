import { useRouteLoaderData } from "@remix-run/react";
import type { CartReturn } from "@shopify/hydrogen";
import { useEffect, useState } from "react";
import type { RootLoader } from "~/root";

export function useAsyncCart() {
  let [cart, setCart] = useState<CartReturn>();
  let root = useRouteLoaderData<RootLoader>("root");
  useEffect(() => {
    if (typeof root?.cart?.then === "function") {
      root.cart.then((cart: any) => {
        setCart(cart);
      });
    }
  }, [root]);
  return cart;
}
