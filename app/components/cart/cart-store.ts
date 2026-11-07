import type { CartDataFromHandlers } from "@shopify/hydrogen";
import { createCartComponents } from "@shopify/hydrogen/react";
import type { cartHandlers } from "~/.server/cart";

/** The cart as Pilot's cart query returns it (Hydrogen's fields + `CartFragment`). */
export type CartData = CartDataFromHandlers<typeof cartHandlers>;
export type CartLineData = CartData["lines"]["nodes"][number];

/**
 * Hydrogen's cart store bindings, typed with Pilot's cart fragment.
 *
 * `CartProvider` is rendered once in `app/root.tsx` without server
 * `initialData`, so documents stay anonymous and full-page cacheable; the
 * store loads `/api/cart` after hydration.
 */
export const {
  CartProvider,
  useCart,
  useSuspenseCart,
  useOptionalCart,
  useCartActions,
  useCartForm,
} = createCartComponents<typeof cartHandlers>();
