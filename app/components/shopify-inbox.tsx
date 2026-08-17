import {
  ShopifyScripts,
  type ShopifyScriptsProps,
} from "@shopify/hydrogen-preview/react";
import { useEffect, useLayoutEffect } from "react";

export type ShopifyInboxShop = ShopifyScriptsProps["shop"];

type ShopifyInboxProps = {
  shop: ShopifyInboxShop;
  i18n: {
    country: string;
    language: string;
  };
  nonce?: string;
};

type ShopifyChatElement = HTMLElement & {
  open: boolean;
  show: () => ShopifyChatElement;
  close: () => ShopifyChatElement;
};

const HIDDEN_ATTRIBUTE = "data-shopify-inbox-hidden";

// Each mounted overlay owns one token. The widget is shown again only after
// every owner releases its token, so nested/overlapping dialogs cannot reveal
// the launcher while another overlay is still open.
const hiddenRequests = new Set<symbol>();

const useHydrationSafeLayoutEffect =
  typeof document === "undefined" ? useEffect : useLayoutEffect;

/**
 * Loads Shopify Inbox through Hydrogen's official ShopifyScripts integration.
 * Shopify's public web component owns the launcher and chat UI.
 *
 * The preview package is installed under an alias so Pilot can exercise this
 * API without replacing its stable Hydrogen/React Router runtime.
 */
export function ShopifyInbox({ shop, i18n, nonce }: ShopifyInboxProps) {
  // Pilot's Storefront API locale type includes a few legacy Shopify language
  // codes that the preview package's narrower union omits. The runtime accepts
  // those codes and normalizes them to lowercase in the bootstrap script.
  const shopifyI18n = i18n as NonNullable<ShopifyScriptsProps["i18n"]>;

  return (
    <>
      <ShopifyScripts
        consent={{ mode: "no-banner" }}
        i18n={shopifyI18n}
        inbox
        nonce={nonce}
        shop={shop}
        shopifyAnalytics={false}
      />
      <shopify-chat />
    </>
  );
}

function syncShopifyInboxVisibility() {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.toggleAttribute(
    HIDDEN_ATTRIBUTE,
    hiddenRequests.size > 0,
  );
}

/**
 * Hides Shopify Inbox until the returned cleanup function is called.
 *
 * The request is reference-counted, so it is safe for nested or overlapping
 * overlays. CSS applies to `<shopify-chat>` even when its module loads later.
 */
export function hideShopifyInbox(): () => void {
  if (typeof document === "undefined") {
    return () => undefined;
  }

  const request = Symbol("shopify-inbox-hidden");
  hiddenRequests.add(request);
  syncShopifyInboxVisibility();

  let released = false;
  return () => {
    if (released) {
      return;
    }
    released = true;
    hiddenRequests.delete(request);
    syncShopifyInboxVisibility();
  };
}

/**
 * Keeps Shopify Inbox hidden for the lifetime of an overlay's content.
 * Place this inside `Dialog.Content` so Radix Presence retains the guard until
 * the closing animation finishes. Renders no DOM.
 */
export function ShopifyInboxOverlayGuard() {
  useHydrationSafeLayoutEffect(() => hideShopifyInbox(), []);
  return null;
}

/**
 * Opens Shopify Inbox from custom storefront UI through the public
 * `<shopify-chat>` web-component API.
 *
 * Returns `false` while the component or its module has not loaded yet.
 */
export function openShopifyInbox(): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  const chat = document.querySelector<ShopifyChatElement>("shopify-chat");
  if (!chat) {
    return false;
  }
  if (chat.open) {
    return true;
  }
  if (typeof chat.show !== "function") {
    return false;
  }

  chat.show();
  return true;
}
