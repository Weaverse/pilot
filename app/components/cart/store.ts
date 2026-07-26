import type { OptimisticCartLineInput } from "@shopify/hydrogen";
import { useFetchers } from "react-router";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { create } from "zustand";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import { resolveBaselineCart } from "./cart-baseline";
import {
  applyOptimisticMutations,
  buildOptimisticAddCart,
  type CartWithOptimistic,
  filterRemovedCartLines,
  getActiveStagedLines,
  type PendingAdd,
} from "./optimistic-cart";

export type CartStore = {
  isOpen: boolean;
  serverCart: CartApiQueryFragment | null;
  /**
   * Customer Account API access token for the Shopify account web component.
   * It is bootstrapped client-side and must never be embedded in the cached SSR
   * document.
   */
  customerAccessToken: string | null;
  cartBootstrapResponseToken: string | null;
  /**
   * Locale-prefixed cart endpoint whose bootstrap response has been applied.
   */
  cartBootstrapResolvedPath: string | null;
  /**
   * False during an auth-relevant navigation and until the next bootstrap
   * confirms the customer token.
   */
  customerAccessTokenKnown: boolean;
  /**
   * Click-time additions keyed by owner token so concurrent buttons settle
   * independently.
   */
  pendingAdds: Map<string, PendingAdd>;
  lastAddError: string | null;
  open: () => void;
  close: () => void;
  toggle: (open?: boolean) => void;
  stagePendingAdd: (lines: OptimisticCartLineInput[]) => string | null;
  clearPendingAdd: (token: string) => void;
  setLastAddError: (message: string | null) => void;
};

let pendingAddSeq = 0;

/**
 * Shared cart presentation and personalized bootstrap state.
 */
export const useCartStore = create<CartStore>()((set) => ({
  isOpen: false,
  serverCart: null,
  customerAccessToken: null,
  cartBootstrapResponseToken: null,
  cartBootstrapResolvedPath: null,
  customerAccessTokenKnown: false,
  pendingAdds: new Map(),
  lastAddError: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, lastAddError: null }),
  toggle: (open) =>
    set((state) => ({
      isOpen: open !== undefined ? open : !state.isOpen,
      lastAddError: null,
    })),
  stagePendingAdd: (lines) => {
    const usableLines = lines.filter((line) => line.selectedVariant);
    if (usableLines.length === 0) {
      return null;
    }
    pendingAddSeq += 1;
    const token = `add-${pendingAddSeq}`;
    const { cart } = resolveBaselineCart(useCartStore.getState().serverCart);
    set((state) => {
      const pendingAdds = new Map(state.pendingAdds);
      pendingAdds.set(token, {
        lines: usableLines,
        stagedFromUpdatedAt: cart?.updatedAt ?? "",
      });
      return { pendingAdds, lastAddError: null };
    });
    return token;
  },
  clearPendingAdd: (token) =>
    set((state) => {
      if (!state.pendingAdds.has(token)) {
        return {};
      }
      const pendingAdds = new Map(state.pendingAdds);
      pendingAdds.delete(token);
      return { pendingAdds };
    }),
  setLastAddError: (message) => set({ lastAddError: message }),
}));

/**
 * True once the active locale's cart bootstrap response has been applied.
 */
export function useCartBootstrapResolved() {
  const apiCartPath = usePrefixPathWithLocale("/api/cart");
  const resolvedPath = useCartStore((state) => state.cartBootstrapResolvedPath);
  return resolvedPath === apiCartPath;
}

/**
 * True while the bootstrapped customer access token can be trusted.
 */
export function useCustomerAccessTokenKnown() {
  return useCartStore((state) => state.customerAccessTokenKnown);
}

/**
 * Returns the freshest authoritative cart with all active optimistic mutations
 * composed over it.
 */
export function useCart(): CartWithOptimistic | null {
  const serverCart = useCartStore((state) => state.serverCart);
  const pendingAdds = useCartStore((state) => state.pendingAdds);
  const fetchers = useFetchers();
  const { cart: resolved, updatedAt: baselineTime } = resolveBaselineCart(
    serverCart,
    fetchers,
  );
  const stagedLines = getActiveStagedLines(pendingAdds, baselineTime);

  if (!resolved) {
    return stagedLines.length > 0 ? buildOptimisticAddCart(stagedLines) : null;
  }

  const baseline = filterRemovedCartLines(resolved);
  const optimisticCart =
    fetchers.length > 0 || stagedLines.length > 0
      ? applyOptimisticMutations(baseline, fetchers, stagedLines)
      : null;

  return optimisticCart ?? baseline;
}
