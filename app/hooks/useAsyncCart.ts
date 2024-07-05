import { useEffect, useState } from "react";
import { useRootLoaderData } from "~/root";
import { type CartReturn } from "@shopify/hydrogen";

export function useAsyncCart() {
  let [cart, setCart] = useState<CartReturn>();
  let root = useRootLoaderData();
  useEffect(() => {
    if (typeof root?.cart?.then === "function") {
      root.cart.then((cart: any) => {
        setCart(cart);
      });
    }
  }, [root]);
  return cart;
}
