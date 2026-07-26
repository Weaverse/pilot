import { CartForm, type OptimisticCartLineInput } from "@shopify/hydrogen";
import { useEffect, useLayoutEffect, useRef } from "react";
import type { Fetcher } from "react-router";
import {
  useFetcher,
  useFetchers,
  useLocation,
  useNavigation,
} from "react-router";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { create } from "zustand";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { loader as apiCartLoader } from "~/routes/api/cart";

type CartStore = {
  isOpen: boolean;
  serverCart: CartApiQueryFragment | null;
  /**
   * Customer Account API access token for the Shopify account web component.
   * Bootstrapped client-side via /api/cart — it must never be embedded in
   * the SSR document (see entry.server.tsx full-page cache notes).
   */
  customerAccessToken: string | null;
  /**
   * Unique /api/cart bootstrap request token currently in flight, and the
   * token whose response has been applied. Components whose analytics need an
   * authoritative cart (e.g. <Analytics.CartView>, whose publish effect is
   * keyed on URL and never replays when the cart context updates) must wait
   * until these match. React Router history keys can be reused on back/forward
   * navigation, so a per-request token is required.
   */
  cartBootstrapRequestToken: string | null;
  cartBootstrapResponseToken: string | null;
  /**
   * The locale-prefixed /api/cart path whose bootstrap response has been
   * applied. Cart-presenting UI gates on this matching the ACTIVE locale's
   * path: same-locale navigations keep it resolved (no flicker), while a
   * market switch re-gates until the new market's cart/currency arrives.
   */
  cartBootstrapResolvedPath: string | null;
  /**
   * False while an auth-relevant (non-GET) navigation submission is in
   * flight and until the next bootstrap response applies. The account web
   * component must not stay mounted with a stale customerAccessToken across
   * e.g. the logout redirect — matching the old root-loader behavior where
   * actions revalidated the token promise and re-suspended the widget.
   */
  customerAccessTokenKnown: boolean;
  /**
   * Add-to-cart lines staged synchronously by the initiating click, keyed by
   * an opaque token. `useCart()` composes these over the baseline cart so the
   * drawer can open on the same click with the new line already visible —
   * `useFetchers()`-derived optimism cannot cover that first frame, because
   * React Router only exposes a submitted fetcher on the NEXT render.
   *
   * A map, not a single slot: two add buttons can be in flight at once (sticky
   * ATC bar + quick shop, or two product cards in succession), and each must
   * only ever clear its own entry.
   */
  pendingAdds: Map<string, PendingAdd>;
  /** Message from the most recent failed add, surfaced inside the drawer. */
  lastAddError: string | null;
  open: () => void;
  close: () => void;
  toggle: (open?: boolean) => void;
  /** Returns a token to pass back to `clearPendingAdd`, or null if nothing could be staged. */
  stagePendingAdd: (lines: OptimisticCartLineInput[]) => string | null;
  clearPendingAdd: (token: string) => void;
  setLastAddError: (message: string | null) => void;
};

type PendingAdd = {
  lines: OptimisticCartLineInput[];
  /**
   * `updatedAt` of the cart this add was staged against. Once the resolved
   * baseline is newer, the mutation has landed and the stage is stale — see
   * `getActiveStagedLines`.
   */
  stagedFromUpdatedAt: string;
};

let pendingAddSeq = 0;

export const useCartStore = create<CartStore>()((set) => ({
  isOpen: false,
  serverCart: null,
  customerAccessToken: null,
  cartBootstrapRequestToken: null,
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

const freshestFetcherCartRef = {
  cart: null as CartApiQueryFragment | null,
  updatedAt: "",
};
/**
 * Counts mutation-fetcher cart syncs. CartStoreSync snapshots this before
 * each /api/cart load: a `cart: null` bootstrap response is only allowed to
 * clear the store when no mutation landed in between — otherwise a slow
 * pre-cookie bootstrap would wipe a cart the shopper just created.
 */
let cartMutationEpoch = 0;

let cartBootstrapRequestSeq = 0;
let currentCartBootstrapLocationKey = "";
let currentCartBootstrapPath = "";
let currentCartBootstrapRequestToken: string | null = null;
const cartBootstrapEpochByToken = new Map<string, number>();

function ensureCartBootstrapRequestToken(locationKey: string, path: string) {
  if (typeof document === "undefined") {
    return null;
  }
  if (
    currentCartBootstrapLocationKey !== locationKey ||
    currentCartBootstrapPath !== path
  ) {
    cartBootstrapRequestSeq += 1;
    currentCartBootstrapLocationKey = locationKey;
    currentCartBootstrapPath = path;
    currentCartBootstrapRequestToken = `${locationKey}:${cartBootstrapRequestSeq}`;
  }
  return currentCartBootstrapRequestToken;
}

export function getCurrentCartBootstrapRequestToken() {
  return currentCartBootstrapRequestToken;
}
/**
 * True once the ACTIVE locale's /api/cart bootstrap response has been
 * applied. Pre-bootstrap, `useCart()` returns null for returning shoppers
 * too, so cart-presenting UI (the drawer body) must not render its
 * empty-cart state yet. Same-locale navigations stay resolved — matching
 * the old root-loader behavior where the resolved cart promise persisted —
 * while a market switch re-gates until the new market's cart/currency
 * arrives. (Per-navigation freshness gates like <Analytics.CartView> use
 * the request-token match instead.)
 */
export function useCartBootstrapResolved() {
  const apiCartPath = usePrefixPathWithLocale("/api/cart");
  const resolvedPath = useCartStore((s) => s.cartBootstrapResolvedPath);
  return resolvedPath === apiCartPath;
}

/**
 * True while the bootstrapped customerAccessToken can be trusted: at least
 * one bootstrap response applied, and no auth-relevant (non-GET) navigation
 * submission since. Gates the account web component (see header.tsx).
 */
export function useCustomerAccessTokenKnown() {
  return useCartStore((s) => s.customerAccessTokenKnown);
}

const useHydrationSafeLayoutEffect =
  typeof document === "undefined" ? useEffect : useLayoutEffect;

/**
 * Module-level set of line IDs that have been optimistically removed.
 * These are filtered from the baseline cart until the server cart
 * confirms the lines are gone. This is necessary because React Router
 * cleans up fetchers from unmounted components synchronously — the
 * remove fetcher's response is never visible via useFetchers().
 */
const removedLineIds = new Set<string>();

type OptimisticLineNode = CartApiQueryFragment["lines"]["nodes"][number] & {
  isOptimistic?: boolean;
};

type CartWithOptimistic = CartApiQueryFragment & { isOptimistic?: boolean };

type MoneyV2 = { amount: string; currencyCode: string };

function zeroMoney(currencyCode: string): MoneyV2 {
  return { amount: "0.0", currencyCode };
}

/**
 * Adds `lines` to `nodes` in place and reports which merchandise IDs it
 * handled, so a fetcher-derived add for the same variant is not applied twice
 * (the staged add and its own in-flight fetcher describe the same mutation).
 */
function applyAddLines(
  nodes: OptimisticLineNode[],
  lines: OptimisticCartLineInput[],
) {
  const handled = new Set<string>();
  let mutated = false;

  for (const line of lines) {
    const selectedVariant =
      line.selectedVariant as OptimisticLineNode["merchandise"];
    if (!selectedVariant) {
      continue;
    }
    mutated = true;
    handled.add(selectedVariant.id);
    const existingIdx = nodes.findIndex(
      (n) => n.merchandise?.id === selectedVariant.id,
    );
    if (existingIdx !== -1) {
      const cloned = { ...nodes[existingIdx] } as OptimisticLineNode;
      cloned.quantity = (cloned.quantity || 1) + (line.quantity || 1);
      cloned.isOptimistic = true;
      nodes[existingIdx] = cloned;
    } else {
      const currencyCode =
        (selectedVariant as { price?: MoneyV2 })?.price?.currencyCode ?? "USD";
      nodes.unshift({
        // Derived from the merchandise ID, NOT random: this cart is rebuilt on
        // every render, so a `crypto.randomUUID()` here would hand
        // `<CartLineItem key={line.id}>` a new key each time — remounting the
        // row (image reload, flicker) and re-keying `useOptimisticData(id)`
        // every pass. A cart holds at most one line per merchandise, so this
        // is unique within the list.
        id: `optimistic-${selectedVariant.id}`,
        merchandise: selectedVariant,
        isOptimistic: true,
        quantity: line.quantity || 1,
        cost: {
          totalAmount: zeroMoney(currencyCode),
          amountPerQuantity: zeroMoney(currencyCode),
          compareAtAmountPerQuantity: null,
        },
      } as unknown as OptimisticLineNode);
    }
  }

  return { handled, mutated };
}

/**
 * Cart-level totals genuinely change on an add, so they are zeroed and the
 * cart is flagged optimistic — `cart-summary.tsx` skeletons every money slot
 * while that flag is set, so the zeros are never rendered.
 *
 * Existing lines' own `cost` is deliberately left alone: `cart-line-item.tsx`
 * skeletons per line via `line.isOptimistic`, so an untouched line keeps
 * showing its real, still-correct price.
 */
function zeroCartCost(cart: CartWithOptimistic, currencyCode: string) {
  cart.cost = {
    ...cart.cost,
    subtotalAmount: zeroMoney(currencyCode),
    totalAmount: zeroMoney(currencyCode),
    totalDutyAmount: null,
    totalTaxAmount: null,
  } as CartApiQueryFragment["cost"];
}

function stagedCurrencyCode(
  lines: OptimisticCartLineInput[],
  fallback: string | undefined,
) {
  for (const line of lines) {
    const price = (line.selectedVariant as { price?: MoneyV2 })?.price;
    if (price?.currencyCode) {
      return price.currencyCode;
    }
  }
  return fallback ?? "USD";
}

function cartLineQuantity(
  cart: CartApiQueryFragment,
  merchandiseId: string,
) {
  return (
    cart.lines.nodes.find((line) => line.merchandise?.id === merchandiseId)
      ?.quantity ?? 0
  );
}

/**
 * True when `baseline` already contains the authoritative result of this add.
 *
 * During React Router's `loading` phase, the add fetcher already exposes its
 * action result while `/api/cart` revalidation can update `serverCart` to that
 * same version. Reapplying the fetcher's form input then briefly increments the
 * confirmed quantity a second time. Timestamp equality also checks the touched
 * line quantities, protecting against stores whose cart timestamps have coarse
 * resolution.
 */
function baselineIncludesFetcherAdd(
  baseline: CartApiQueryFragment,
  fetcherCart: CartApiQueryFragment | undefined,
  lines: OptimisticCartLineInput[],
) {
  if (!fetcherCart?.id || fetcherCart.id !== baseline.id) {
    return false;
  }
  const baselineTime = getTimestampMs(baseline.updatedAt);
  const fetcherTime = getTimestampMs(fetcherCart.updatedAt);
  if (baselineTime > fetcherTime) {
    return true;
  }
  if (baselineTime < fetcherTime) {
    return false;
  }
  return lines.every((line) => {
    const merchandiseId =
      (line.selectedVariant as { id?: string })?.id ?? line.merchandiseId;
    return (
      cartLineQuantity(baseline, merchandiseId) >=
      cartLineQuantity(fetcherCart, merchandiseId)
    );
  });
}

/**
 * Builds the cart shown while an add is in flight and there is no baseline at
 * all (a shopper's first-ever add). Without this the drawer would render its
 * empty-cart state on the very click that adds the first item.
 */
export function buildOptimisticAddCart(
  lines: OptimisticCartLineInput[],
): CartWithOptimistic | null {
  const nodes: OptimisticLineNode[] = [];
  const { mutated } = applyAddLines(nodes, lines);
  if (!mutated) {
    return null;
  }
  const currencyCode = stagedCurrencyCode(lines, undefined);
  const cart = {
    id: "optimistic-cart",
    updatedAt: "",
    checkoutUrl: "",
    note: null,
    appliedGiftCards: [],
    discountCodes: [],
    discountAllocations: [],
    attributes: [],
    buyerIdentity: null,
    lines: { nodes, pageInfo: { hasNextPage: false } },
    totalQuantity: nodes.reduce((sum, line) => sum + line.quantity, 0),
    isOptimistic: true,
  } as unknown as CartWithOptimistic;
  zeroCartCost(cart, currencyCode);
  return cart;
}

/**
 * Applies in-flight cart form inputs that are not yet represented by the
 * authoritative baseline.
 */
export function applyOptimisticMutations(
  baseline: CartApiQueryFragment,
  fetchers: ReturnType<typeof useFetchers>,
  stagedLines: OptimisticCartLineInput[],
): CartWithOptimistic | null {
  // A submission goes submitting → loading → idle. `loading` must count as
  // pending too: serverCart is only synced once the response lands, so
  // dropping the overlay at `loading` flashes the line away and back.
  const pendingFetchers = fetchers.filter(
    (f) => (f.state === "submitting" || f.state === "loading") && f.formData,
  );
  if (pendingFetchers.length === 0 && stagedLines.length === 0) {
    return null;
  }

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
  let addedCurrencyCode: string | null = null;

  // Staged lines are applied first; their merchandise IDs are then skipped
  // when walking the fetchers, so the click-time stage and the fetcher that
  // carries the same add do not both bump the quantity.
  const staged = applyAddLines(cart.lines.nodes, stagedLines);
  mutated = staged.mutated;
  if (staged.mutated) {
    addedCurrencyCode = stagedCurrencyCode(
      stagedLines,
      baseline.cost?.totalAmount?.currencyCode,
    );
  }

  for (const fetcher of pendingFetchers) {
    const formData = fetcher.formData;
    if (!formData) {
      continue;
    }
    const { action, inputs } = CartForm.getFormInput(formData);
    const lineNodes = cart.lines.nodes;

    if (action === CartForm.ACTIONS.LinesAdd) {
      const fetcherLines = ((inputs?.lines ?? []) as OptimisticCartLineInput[])
        .filter((line) => line.selectedVariant)
        .filter(
          (line) =>
            !staged.handled.has(
              (line.selectedVariant as { id: string }).id as string,
            ),
        );
      const fetcherCart = (
        fetcher.data as { cart?: CartApiQueryFragment } | undefined
      )?.cart;
      if (baselineIncludesFetcherAdd(baseline, fetcherCart, fetcherLines)) {
        continue;
      }
      const applied = applyAddLines(lineNodes, fetcherLines);
      mutated = mutated || applied.mutated;
      if (applied.mutated && !addedCurrencyCode) {
        addedCurrencyCode = stagedCurrencyCode(
          fetcherLines,
          baseline.cost?.totalAmount?.currencyCode,
        );
      }
    } else if (action === CartForm.ACTIONS.LinesRemove) {
      for (const lineId of (inputs?.lineIds as string[]) ?? []) {
        const idx = lineNodes.findIndex((n) => n.id === lineId);
        if (idx !== -1) {
          lineNodes.splice(idx, 1);
          mutated = true;
        }
        removedLineIds.add(lineId);
      }
    } else if (action === CartForm.ACTIONS.LinesUpdate) {
      for (const update of inputs?.lines ?? []) {
        const idx = lineNodes.findIndex((n) => n.id === update.id);
        if (idx !== -1) {
          const cloned = { ...lineNodes[idx] } as OptimisticLineNode;
          cloned.quantity = update.quantity;
          cloned.isOptimistic = true;
          if (cloned.quantity === 0) {
            lineNodes.splice(idx, 1);
          } else {
            lineNodes[idx] = cloned;
          }
          mutated = true;
        }
      }
    } else {
      mutated = true;
    }
  }

  if (!mutated) {
    return null;
  }

  cart.totalQuantity = cart.lines.nodes.reduce(
    (sum, line) => sum + line.quantity,
    0,
  );
  cart.isOptimistic = true;
  if (addedCurrencyCode) {
    zeroCartCost(cart, addedCurrencyCode);
  }
  return cart;
}

/**
 * Syncs cart data from a singular fetcher instance into zustand.
 *
 * WHY: `useFetchers()` (plural) reads from `state.fetchers` map which
 * React Router deletes idle fetchers from on the same synchronous tick
 * as completion. The singular `useFetcher()` preserves data via a
 * `fetcherData` ref that survives cleanup. By syncing from individual
 * fetcher instances, we reliably capture post-mutation cart state.
 *
 * SYNC DURING RENDER: We sync to zustand during render (not in useEffect)
 * so that `useCart()` reads the fresh serverCart in the same render cycle.
 * Without this, there's a 1-frame flash where optimistic mutations are
 * cleared (fetcher is idle) but serverCart hasn't been updated yet.
 * `queueMicrotask` is used to avoid React's "setState during render" warning.
 */
export function useCartFetcherSync(fetcher: Fetcher<unknown>) {
  const lastSyncedRef = useRef<string | null>(null);
  const fetcherData = fetcher.data as Record<string, unknown> | undefined;
  const cart = fetcherData?.cart as CartApiQueryFragment | undefined;
  if (fetcher.state === "idle" && cart?.id && cart?.lines) {
    const updatedAt = cart.updatedAt;
    if (updatedAt !== lastSyncedRef.current) {
      lastSyncedRef.current = updatedAt;
      cartMutationEpoch += 1;
      const fetcherCart = cart as CartApiQueryFragment;
      const fetcherTime = new Date(fetcherCart.updatedAt).getTime();
      const refTime = freshestFetcherCartRef.updatedAt
        ? new Date(freshestFetcherCartRef.updatedAt).getTime()
        : 0;
      if (fetcherTime >= refTime) {
        freshestFetcherCartRef.cart = fetcherCart;
        freshestFetcherCartRef.updatedAt = fetcherCart.updatedAt;
      }
      const current = useCartStore.getState().serverCart;
      const currentTime = current?.updatedAt
        ? new Date(current.updatedAt).getTime()
        : 0;
      if (fetcherTime >= currentTime) {
        queueMicrotask(() => {
          useCartStore.setState({ serverCart: fetcherCart });
        });
      }
    }
  }
}

function getTimestampMs(dateString: string | undefined): number {
  return dateString ? new Date(dateString).getTime() : 0;
}

/**
 * Scans all sources (zustand, module ref, idle fetchers) and returns the
 * freshest cart to use as a baseline.
 *
 * The fetcher scan here is critical: when a remove button's component
 * unmounts before its fetcher completes, useCartFetcherSync never fires.
 * Scanning useFetchers() in the same render pass catches those completed
 * carts that would otherwise be lost.
 *
 * Only the SINGLE freshest completed cart is used as baseline — not
 * accumulated across multiple fetchers — to avoid double-counting.
 *
 * `serverCart` is passed in rather than read from the store so `useCart()`
 * keeps its zustand subscription; `fetchers` is omitted when called outside
 * render (`stagePendingAdd`), where the idle-fetcher scan has no equivalent.
 * Both callers must agree on the baseline, otherwise a stage built from an
 * older cart makes the drawer jump backwards on the click.
 */
function resolveBaselineCart(
  serverCart: CartApiQueryFragment | null,
  fetchers?: ReturnType<typeof useFetchers>,
) {
  let cart = serverCart;
  let updatedAt = getTimestampMs(serverCart?.updatedAt);

  const refTime = getTimestampMs(freshestFetcherCartRef.updatedAt);
  if (freshestFetcherCartRef.cart && refTime > updatedAt) {
    cart = freshestFetcherCartRef.cart;
    updatedAt = refTime;
  }

  for (const fetcher of fetchers ?? []) {
    if (fetcher.state !== "idle") {
      continue;
    }
    const fetcherData = fetcher.data as Record<string, unknown> | undefined;
    const fetcherCart = fetcherData?.cart as CartApiQueryFragment | undefined;
    if (!fetcherCart?.id || !fetcherCart?.lines) {
      continue;
    }
    const t = getTimestampMs(fetcherCart.updatedAt);
    if (t > updatedAt) {
      cart = fetcherCart;
      updatedAt = t;
      freshestFetcherCartRef.cart = fetcherCart;
      freshestFetcherCartRef.updatedAt = fetcherCart.updatedAt;
      // This fallback scan is the only place that can see completed
      // fetchers after React Router drops their components. Treat it as a
      // real mutation sync for null-bootstrap race guards too.
      cartMutationEpoch += 1;
    }
  }

  return { cart, updatedAt };
}

/**
 * Staged adds whose mutation has not landed yet. A stage older than the
 * resolved baseline has already been confirmed by the server, so applying it
 * again would double-count the line.
 *
 * This comparison — not `clearPendingAdd()` — is what makes the handoff
 * correct: `useCartFetcherSync` writes `serverCart` from a `queueMicrotask`
 * while the clear runs in a passive effect, and pinning the quantity to that
 * ordering would be fragile. The explicit clear is just cleanup.
 */
function getActiveStagedLines(
  pendingAdds: Map<string, PendingAdd>,
  baselineTime: number,
) {
  if (pendingAdds.size === 0) {
    return [];
  }
  const lines: OptimisticCartLineInput[] = [];
  for (const pending of pendingAdds.values()) {
    if (getTimestampMs(pending.stagedFromUpdatedAt) >= baselineTime) {
      lines.push(...pending.lines);
    }
  }
  return lines;
}

/**
 * The cart every consumer renders: freshest baseline, with click-staged adds
 * and pending fetcher mutations layered on top.
 */
export function useCart(): CartWithOptimistic | null {
  const serverCart = useCartStore((s) => s.serverCart);
  const pendingAdds = useCartStore((s) => s.pendingAdds);
  const fetchers = useFetchers();

  const { cart: resolved, updatedAt: baselineTime } = resolveBaselineCart(
    serverCart,
    fetchers,
  );
  let baseline = resolved;
  const stagedLines = getActiveStagedLines(pendingAdds, baselineTime);

  if (!baseline) {
    // First-ever add: there is no cart to build on, so synthesize one from the
    // staged variant rather than letting the drawer paint its empty state on
    // the very click that creates the cart.
    return stagedLines.length > 0 ? buildOptimisticAddCart(stagedLines) : null;
  }

  // Filter tombstoned lines from baseline — prevents flash-back when
  // the remove fetcher's response is lost due to component unmount
  if (removedLineIds.size > 0) {
    const baselineLineIds = new Set(baseline.lines.nodes.map((n) => n.id));
    const confirmedRemovals: string[] = [];
    for (const id of removedLineIds) {
      if (!baselineLineIds.has(id)) {
        confirmedRemovals.push(id);
      }
    }
    for (const id of confirmedRemovals) {
      removedLineIds.delete(id);
    }

    if (removedLineIds.size > 0) {
      const filteredNodes = baseline.lines.nodes.filter(
        (n) => !removedLineIds.has(n.id),
      );
      baseline = {
        ...baseline,
        lines: { ...baseline.lines, nodes: filteredNodes },
        totalQuantity: filteredNodes.reduce(
          (sum, line) => sum + line.quantity,
          0,
        ),
      };
    }
  }

  const optimisticCart =
    fetchers.length > 0 || stagedLines.length > 0
      ? applyOptimisticMutations(baseline, fetchers, stagedLines)
      : null;

  return optimisticCart ?? baseline;
}

/**
 * Bootstraps personalized state (cart + customer access token) client-side
 * from /api/cart after hydration.
 *
 * This data used to come from the root loader's deferred promise, but
 * deferred values stream into the SSR document — personalizing every page
 * and blocking Oxygen's full-page cache (see entry.server.tsx). Fetching
 * after hydration keeps the document anonymous.
 *
 * The load is locale-prefixed so the cart query runs in the active market's
 * i18n context (a bare `/api/cart` would price the cart in the default
 * locale), and it re-runs on every navigation (`location.key`) — matching
 * the old root-loader revalidation that refreshed the token after auth
 * actions (e.g. logout redirect) and picked up carts mutated by GET-loader
 * redirects (e.g. discount-code routes).
 *
 * Post-mutation freshness is handled by `useCartFetcherSync`. Two race
 * guards protect against this bootstrap resolving after a faster mutation
 * fetcher: the `updatedAt` comparison for non-empty carts, and the
 * `cartMutationEpoch` snapshot for `cart: null` responses (which carry no
 * timestamp to compare).
 */
export function CartStoreSync() {
  const fetcher = useFetcher<typeof apiCartLoader>();
  const load = fetcher.load;
  const apiCartPath = usePrefixPathWithLocale("/api/cart");
  const location = useLocation();
  const navigation = useNavigation();
  // Auth state can only change through non-GET navigation submissions
  // (login/logout actions; cart mutations use fetchers). Distrust the
  // bootstrapped customerAccessToken from the moment one starts until the
  // next bootstrap response applies — the account widget must not stay
  // active with a pre-logout token across the redirect.
  const isAuthRelevantSubmission =
    navigation.state !== "idle" &&
    navigation.formMethod != null &&
    navigation.formMethod !== "GET";
  useEffect(() => {
    if (isAuthRelevantSubmission) {
      useCartStore.setState({ customerAccessTokenKnown: false });
    }
  }, [isAuthRelevantSubmission]);
  const cartRequestToken = ensureCartBootstrapRequestToken(
    location.key,
    apiCartPath,
  );
  useHydrationSafeLayoutEffect(() => {
    if (!cartRequestToken) {
      return;
    }
    cartBootstrapEpochByToken.set(cartRequestToken, cartMutationEpoch);
    useCartStore.setState({ cartBootstrapRequestToken: cartRequestToken });
    const url = new URL(apiCartPath, window.location.origin);
    url.searchParams.set("cartRequestToken", cartRequestToken);
    load(url.pathname + url.search);
  }, [load, apiCartPath, cartRequestToken]);
  const payload = fetcher.data;
  useEffect(() => {
    if (!payload) {
      return;
    }
    const responseToken = payload.cartRequestToken ?? null;
    if (
      !responseToken ||
      responseToken !== getCurrentCartBootstrapRequestToken()
    ) {
      return;
    }
    // Apply the response token and the cart state in ONE store update:
    // consumers gate on the token (drawer body, <Analytics.CartView>), so a
    // split update could let them observe "bootstrap complete" while
    // serverCart still holds a stale pre-bootstrap cart (e.g. a cart:null
    // response after checkout completed) and publish/render from it.
    const updates: Partial<CartStore> = {
      customerAccessToken: payload.customerAccessToken,
      cartBootstrapResponseToken: responseToken,
      // The matched response token implies currentCartBootstrapPath is the
      // path this response was requested for.
      cartBootstrapResolvedPath: currentCartBootstrapPath,
      // Trust the fresh token — unless an auth-mutating submission is
      // already in flight again (its redirect will trigger the next load).
      customerAccessTokenKnown: !isAuthRelevantSubmission,
    };
    const resolved = payload.cart;
    if (resolved) {
      const current = useCartStore.getState().serverCart;
      const resolvedTime = new Date(resolved.updatedAt).getTime();
      const currentTime = current?.updatedAt
        ? new Date(current.updatedAt).getTime()
        : 0;
      if (resolvedTime >= currentTime) {
        updates.serverCart = resolved as CartApiQueryFragment;
      }
    } else if (
      // Only clear when no mutation synced since this load was issued —
      // a slow pre-cookie bootstrap must not wipe a just-created cart.
      cartMutationEpoch === cartBootstrapEpochByToken.get(responseToken)
    ) {
      // Reset the module ref too: useCart() consults it before the store,
      // so a surviving entry would keep resurrecting a cart whose cookie
      // expired or was completed at checkout.
      freshestFetcherCartRef.cart = null;
      freshestFetcherCartRef.updatedAt = "";
      updates.serverCart = null;
    }
    useCartStore.setState(updates);
  }, [payload, isAuthRelevantSubmission]);
  return null;
}
