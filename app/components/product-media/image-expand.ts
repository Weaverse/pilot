import { useEffect, useSyncExternalStore } from "react";
import { useLocation } from "react-router";

/**
 * Who owns the shared `image-expand` view-transition name, which only one
 * element per page may carry.
 *
 * The PDP main media carries it so a clicked product card can expand into the
 * next PDP. When a card on a PDP (related products, ...) is clicked, the card
 * takes the name, so the PDP media must give it up before the browser
 * captures the old page. The click is the earliest signal: React Router
 * starts the transition as soon as the next page's loaders resolve, before a
 * low-priority `navigation.state` render reliably reaches the DOM.
 *
 * The claim is tied to the clicked page's `location.key`, so the next page's
 * media carries the name from its very first render.
 */
let claimedOnLocationKey: string | null = null;
const LISTENERS = new Set<() => void>();

function setClaim(locationKey: string | null) {
  if (claimedOnLocationKey === locationKey) return;
  claimedOnLocationKey = locationKey;
  for (const listener of LISTENERS) listener();
}

function subscribe(listener: () => void) {
  LISTENERS.add(listener);
  return () => {
    LISTENERS.delete(listener);
  };
}

/** A product card on this page was clicked: it takes the name. */
export function useClaimImageExpandForCard() {
  const { key } = useLocation();
  return () => setClaim(key);
}

/**
 * Whether the PDP media on this page may carry the name: not while a card
 * clicked on this same page owns it.
 */
export function usePdpMediaOwnsImageExpand() {
  const { key } = useLocation();
  const claimedOn = useSyncExternalStore(
    subscribe,
    () => claimedOnLocationKey,
    () => null,
  );
  // Once another page renders, the claim is spent; clearing it keeps the
  // name on this page if the shopper comes back to it with the same key.
  useEffect(() => {
    if (claimedOnLocationKey !== null && claimedOnLocationKey !== key) {
      setClaim(null);
    }
  }, [key]);
  return claimedOn !== key;
}
