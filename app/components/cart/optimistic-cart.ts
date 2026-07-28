import { CartForm, type OptimisticCartLineInput } from "@shopify/hydrogen";
import type { Fetcher } from "react-router";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { getTimestampMs } from "./cart-baseline";

export type PendingAdd = {
  lines: OptimisticCartLineInput[];
  stagedFromUpdatedAt: string;
};

export type CartWithOptimistic = CartApiQueryFragment & {
  isOptimistic?: boolean;
};

type OptimisticLineNode = CartApiQueryFragment["lines"]["nodes"][number] & {
  isOptimistic?: boolean;
};

type MoneyV2 = { amount: string; currencyCode: string };

/**
 * Removed line IDs remain hidden until an authoritative cart confirms them.
 * React Router can discard a remove fetcher when its line component unmounts,
 * so the pending form is not always observable on the next render.
 */
const REMOVED_LINE_IDS = new Set<string>();

function zeroMoney(currencyCode: string): MoneyV2 {
  return { amount: "0.0", currencyCode };
}

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
      (node) => node.merchandise?.id === selectedVariant.id,
    );
    if (existingIdx !== -1) {
      const cloned = { ...nodes[existingIdx] } as OptimisticLineNode;
      cloned.quantity = (cloned.quantity || 1) + (line.quantity || 1);
      cloned.isOptimistic = true;
      nodes[existingIdx] = cloned;
    } else {
      const currencyCode =
        (selectedVariant as { price?: MoneyV2 }).price?.currencyCode ?? "USD";
      nodes.unshift({
        // This cart is recomposed on every render, so a deterministic ID keeps
        // the line mounted and avoids image and optimistic-data flicker.
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

function zeroCartCost(cart: CartWithOptimistic, currencyCode: string) {
  // Only cart totals are unknown during an add. Existing untouched line prices
  // remain authoritative and must not be blanked with synthetic zero values.
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
    const price = (line.selectedVariant as { price?: MoneyV2 }).price;
    if (price?.currencyCode) {
      return price.currencyCode;
    }
  }
  return fallback ?? "USD";
}

function cartLineQuantity(cart: CartApiQueryFragment, merchandiseId: string) {
  return (
    cart.lines.nodes.find((line) => line.merchandise?.id === merchandiseId)
      ?.quantity ?? 0
  );
}

function baselineIncludesFetcherAdd(
  baseline: CartApiQueryFragment,
  fetcherCart: CartApiQueryFragment | undefined,
  lines: OptimisticCartLineInput[],
) {
  // A loading fetcher already has its action-result cart. If bootstrap
  // revalidation adopted that version, replaying formData would double-count.
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
      (line.selectedVariant as { id?: string }).id ?? line.merchandiseId;
    return (
      cartLineQuantity(baseline, merchandiseId) >=
      cartLineQuantity(fetcherCart, merchandiseId)
    );
  });
}

/**
 * Builds the presentation cart for an add with no authoritative baseline.
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
 * Returns staged lines whose authoritative cart has not landed yet.
 */
export function getActiveStagedLines(
  pendingAdds: Map<string, PendingAdd>,
  baselineTime: number,
) {
  const lines: OptimisticCartLineInput[] = [];
  for (const pending of pendingAdds.values()) {
    if (getTimestampMs(pending.stagedFromUpdatedAt) >= baselineTime) {
      lines.push(...pending.lines);
    }
  }
  return lines;
}

/**
 * Keeps optimistic removals hidden until the baseline confirms their absence.
 */
export function filterRemovedCartLines(
  baseline: CartApiQueryFragment,
): CartApiQueryFragment {
  if (REMOVED_LINE_IDS.size === 0) {
    return baseline;
  }
  const baselineLineIds = new Set(baseline.lines.nodes.map((line) => line.id));
  for (const id of REMOVED_LINE_IDS) {
    if (!baselineLineIds.has(id)) {
      REMOVED_LINE_IDS.delete(id);
    }
  }
  if (REMOVED_LINE_IDS.size === 0) {
    return baseline;
  }
  const nodes = baseline.lines.nodes.filter(
    (line) => !REMOVED_LINE_IDS.has(line.id),
  );
  return {
    ...baseline,
    lines: { ...baseline.lines, nodes },
    totalQuantity: nodes.reduce((sum, line) => sum + line.quantity, 0),
  };
}

/**
 * Returns React keys that survive the synthetic-to-authoritative line handoff.
 *
 * The optimistic pipeline merges lines by merchandise ID, so a unique variant
 * identifies the same visual row before and after Shopify replaces its line ID.
 * Carts with duplicate merchandise fall back to Shopify line IDs to avoid key
 * collisions.
 */
export function getCartLineRenderKeys(
  lines: CartApiQueryFragment["lines"]["nodes"],
) {
  const merchandiseCounts = new Map<string, number>();
  for (const line of lines) {
    const merchandiseId = line.merchandise?.id;
    if (merchandiseId) {
      merchandiseCounts.set(
        merchandiseId,
        (merchandiseCounts.get(merchandiseId) ?? 0) + 1,
      );
    }
  }

  return lines.map((line) => {
    const merchandiseId = line.merchandise?.id;
    return merchandiseId && merchandiseCounts.get(merchandiseId) === 1
      ? `merchandise-${merchandiseId}`
      : line.id;
  });
}

/**
 * Applies in-flight cart inputs not yet represented by the baseline.
 */
export function applyOptimisticMutations(
  baseline: CartApiQueryFragment,
  fetchers: Fetcher<unknown>[],
  stagedLines: OptimisticCartLineInput[],
): CartWithOptimistic | null {
  // Loading remains pending until an authoritative baseline adopts the action
  // result; dropping it unconditionally would flash the line away and back.
  const pendingFetchers = fetchers.filter(
    (fetcher) =>
      (fetcher.state === "submitting" || fetcher.state === "loading") &&
      fetcher.formData,
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

  // Apply click-time stages first, then suppress the matching fetcher add so
  // both representations of the same mutation never increment quantity.
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
            !staged.handled.has((line.selectedVariant as { id: string }).id),
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
        const index = lineNodes.findIndex((line) => line.id === lineId);
        if (index !== -1) {
          lineNodes.splice(index, 1);
          mutated = true;
        }
        REMOVED_LINE_IDS.add(lineId);
      }
    } else if (action === CartForm.ACTIONS.LinesUpdate) {
      for (const update of inputs?.lines ?? []) {
        const index = lineNodes.findIndex((line) => line.id === update.id);
        if (index !== -1) {
          const cloned = { ...lineNodes[index] } as OptimisticLineNode;
          cloned.quantity = update.quantity;
          cloned.isOptimistic = true;
          if (cloned.quantity === 0) {
            lineNodes.splice(index, 1);
          } else {
            lineNodes[index] = cloned;
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
