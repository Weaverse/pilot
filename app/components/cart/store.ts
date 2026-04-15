import { CartForm } from "@shopify/hydrogen";
import { useEffect, useRef } from "react";
import type { Fetcher } from "react-router";
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

/**
 * Syncs cart data from a singular fetcher instance into zustand.
 *
 * WHY: `useFetchers()` (plural) reads from `state.fetchers` map which
 * React Router deletes idle fetchers from on the same synchronous tick
 * as completion. The singular `useFetcher()` preserves data via a
 * `fetcherData` ref that survives cleanup. By syncing from individual
 * fetcher instances, we reliably capture post-mutation cart state.
 */
export function useCartFetcherSync(fetcher: Fetcher<any>) {
  const lastSyncedRef = useRef<string | null>(null);
  useEffect(() => {
    const cart = fetcher.data?.cart;
    if (fetcher.state === "idle" && cart?.id && cart?.lines) {
      // Deduplicate: only sync if updatedAt changed
      const updatedAt = cart.updatedAt;
      if (updatedAt !== lastSyncedRef.current) {
        lastSyncedRef.current = updatedAt;
        const fetcherCart = cart as CartApiQueryFragment;
        const current = useCartStore.getState().serverCart;
        const fetcherTime = new Date(fetcherCart.updatedAt).getTime();
        const currentTime = current?.updatedAt
          ? new Date(current.updatedAt).getTime()
          : 0;
        if (fetcherTime >= currentTime) {
          useCartStore.setState({ serverCart: fetcherCart });
        }
      }
    }
  }, [fetcher.state, fetcher.data]);
}

function applyOptimisticMutations(
  baseline: CartApiQueryFragment,
  fetchers: ReturnType<typeof useFetchers>,
): CartWithOptimistic | null {
  const pendingFetchers = fetchers.filter(
    (f) => f.state !== "idle" && f.formData,
  );
  if (pendingFetchers.length === 0) return null;

  const nodes = [...baseline.lines.nodes] as OptimisticLineNode[];
  const cart = {
    ...baseline,
    lines: { ...baseline.lines, nodes },
    totalQuantity: baseline.totalQuantity,
    isOptimistic: false,
  } as CartWithOptimistic & {
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
        const existingIdx = nodes.findIndex(
          (n) => n.merchandise?.id === line.selectedVariant?.id,
        );
        mutated = true;
        if (existingIdx !== -1) {
          const cloned = { ...nodes[existingIdx] } as OptimisticLineNode;
          cloned.quantity = (cloned.quantity || 1) + (line.quantity || 1);
          cloned.isOptimistic = true;
          nodes[existingIdx] = cloned;
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
        const idx = nodes.findIndex((n) => n.id === update.id);
        if (idx !== -1) {
          const cloned = { ...nodes[idx] } as OptimisticLineNode;
          cloned.quantity = update.quantity;
          cloned.isOptimistic = true;
          if (cloned.quantity === 0) {
            nodes.splice(idx, 1);
          } else {
            nodes[idx] = cloned;
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

  if (!serverCart) return null;

  const result = applyOptimisticMutations(serverCart, fetchers) ?? serverCart;
  return result;
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
      Promise.resolve(cartPromise)
        .then((resolved) => {
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
        })
        .catch(() => {
          // Cart fetch failed — leave current state as-is
        });
    }
  }, [cartPromise]);

  return null;
}
