import { CartForm } from "@shopify/hydrogen";
import { useEffect, useRef } from "react";
import { useFetchers, useRouteLoaderData } from "react-router";
import type { CartApiQueryFragment } from "storefront-api.generated";
import type { RootLoader } from "~/root";
import { create } from "zustand";

type CartStore = {
  isOpen: boolean;
  serverCart: CartApiQueryFragment | null;
  open: () => void;
  close: () => void;
  toggle: (open?: boolean) => void;
};

export const useCartStore = create<CartStore>()((set) => ({
  isOpen: false,
  serverCart: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: (open) =>
    set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),
}));

type OptimisticLineNode = CartApiQueryFragment["lines"]["nodes"][number] & {
  isOptimistic?: boolean;
};

type CartWithOptimistic = CartApiQueryFragment & { isOptimistic?: boolean };

function findFreshestFetcherCart(
  fetchers: ReturnType<typeof useFetchers>,
): CartApiQueryFragment | null {
  let freshest: CartApiQueryFragment | null = null;
  for (const fetcher of fetchers) {
    if (
      fetcher.state === "idle" &&
      fetcher.data?.cart?.id &&
      fetcher.data?.cart?.lines
    ) {
      freshest = fetcher.data.cart as CartApiQueryFragment;
    }
  }
  return freshest;
}

function applyOptimisticMutations(
  baseline: CartApiQueryFragment,
  fetchers: ReturnType<typeof useFetchers>,
): CartWithOptimistic | null {
  const pendingFetchers = fetchers.filter(
    (f) => f.state !== "idle" && f.formData,
  );
  if (pendingFetchers.length === 0) return null;

  const cart = structuredClone(baseline) as CartWithOptimistic & {
    lines: { nodes: OptimisticLineNode[] };
    totalQuantity: number;
  };
  let mutated = false;

  for (const fetcher of pendingFetchers) {
    const { action, inputs } = CartForm.getFormInput(fetcher.formData!);
    const nodes = cart.lines.nodes;

    if (action === CartForm.ACTIONS.LinesAdd) {
      for (const line of inputs?.lines ?? []) {
        if (!line.selectedVariant) continue;
        const existing = nodes.find(
          (n) => n.merchandise?.id === line.selectedVariant?.id,
        );
        mutated = true;
        if (existing) {
          existing.quantity = (existing.quantity || 1) + (line.quantity || 1);
          (existing as OptimisticLineNode).isOptimistic = true;
        } else {
          nodes.unshift({
            id: `optimistic-${crypto.randomUUID()}`,
            merchandise: line.selectedVariant,
            isOptimistic: true,
            quantity: line.quantity || 1,
          } as OptimisticLineNode);
        }
      }
    } else if (action === CartForm.ACTIONS.LinesRemove) {
      for (const lineId of (inputs?.lineIds as string[]) ?? []) {
        const idx = nodes.findIndex((n) => n.id === lineId);
        if (idx !== -1) {
          nodes.splice(idx, 1);
          mutated = true;
        }
      }
    } else if (action === CartForm.ACTIONS.LinesUpdate) {
      for (const update of inputs?.lines ?? []) {
        const node = nodes.find((n) => n.id === update.id);
        if (node) {
          node.quantity = update.quantity;
          if (node.quantity === 0) {
            nodes.splice(nodes.indexOf(node), 1);
          }
          mutated = true;
        }
      }
    }
  }

  if (!mutated) return null;

  cart.totalQuantity = cart.lines.nodes.reduce(
    (sum, line) => sum + line.quantity,
    0,
  );
  cart.isOptimistic = true;
  return cart;
}

export function useCart(): CartWithOptimistic | null {
  const serverCart = useCartStore((s) => s.serverCart);
  const fetchers = useFetchers();
  const fetcherCart = findFreshestFetcherCart(fetchers);

  // Sync completed fetcher cart data to zustand store via effect
  // so the next render has a fresh baseline after the fetcher is cleaned up.
  const fetcherCartRef = useRef<CartApiQueryFragment | null>(null);
  useEffect(() => {
    if (fetcherCart && fetcherCart !== fetcherCartRef.current) {
      fetcherCartRef.current = fetcherCart;
      useCartStore.setState({ serverCart: fetcherCart });
    }
  }, [fetcherCart]);

  const baseline = fetcherCart ?? serverCart;
  if (!baseline) return null;

  return applyOptimisticMutations(baseline, fetchers) ?? baseline;
}

/**
 * Syncs cart data from root loader's deferred promise into zustand.
 * Uses `updatedAt` to skip stale root loader data when a fetcher
 * already synced fresher post-mutation cart state.
 */
export function CartStoreSync() {
  const rootData = useRouteLoaderData<RootLoader>("root");
  const promiseRef = useRef<unknown>(null);
  const cartPromise = rootData?.cart;

  useEffect(() => {
    if (cartPromise && cartPromise !== promiseRef.current) {
      promiseRef.current = cartPromise;
      Promise.resolve(cartPromise).then((resolved) => {
        if (!resolved) {
          useCartStore.setState({ serverCart: null });
          return;
        }
        const current = useCartStore.getState().serverCart;
        const resolvedTime = new Date(resolved.updatedAt).getTime();
        const currentTime = current?.updatedAt
          ? new Date(current.updatedAt).getTime()
          : 0;
        if (resolvedTime >= currentTime) {
          useCartStore.setState({ serverCart: resolved });
        }
      });
    }
  }, [cartPromise]);

  return null;
}
