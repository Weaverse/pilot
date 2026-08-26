import { useEffect, useLayoutEffect } from "react";
import { Button } from "~/components/button";
import { Icon } from "~/components/icon";
import { cn } from "~/utils/cn";

type ShopifyInboxButton = {
  /** Button color as a hex value, e.g. `#000000`. */
  color?: string;
  style?: "icon" | "text";
  position?: "bottom_left" | "bottom_right";
  verticalPosition?: "lowest" | "higher" | "highest";
  text?:
    | "chat_with_us"
    | "assistance"
    | "contact"
    | "help"
    | "support"
    | "live_chat"
    | "message_us"
    | "need_help"
    | "no_text";
  icon?:
    | "chat_bubble"
    | "agent"
    | "speech_bubble"
    | "text_message"
    | "email"
    | "hand_wave"
    | "lifebuoy"
    | "paper_plane"
    | "service_bell"
    | "smiley_face"
    | "question_mark"
    | "team"
    | "no_icon";
};

type ShopifyInboxProps = {
  /** Store myshopify domain and the Inbox shop id from the app settings. */
  shop: { domain: string; id: string };
  /** Chat button appearance. Falls back to `DEFAULT_BUTTON` when omitted. */
  button?: ShopifyInboxButton;
  env?: "production" | "development";
  version?: "V1";
};

const DEFAULT_BUTTON: Required<ShopifyInboxButton> = {
  color: "#000000",
  style: "icon",
  position: "bottom_right",
  verticalPosition: "lowest",
  text: "chat_with_us",
  icon: "chat_bubble",
};

// Shopify's chat loader reads abbreviated query-param keys.
const BUTTON_PARAM_KEYS: Record<keyof ShopifyInboxButton, string> = {
  color: "c",
  style: "s",
  position: "p",
  verticalPosition: "vp",
  text: "t",
  icon: "i",
};

// Global, store-agnostic loader. It reads `shop_id`/`shop` from its own
// `<script>` tag and resolves the store's widget bundle at runtime, so no
// app-extension UUID/version needs to be hardcoded.
const LOADER_BASE_URL =
  "https://cdn.shopify.com/shopifycloud/shopify_chat/storefront";

const SCRIPT_ID = "shopify-inbox";
const HIDDEN_ATTRIBUTE = "data-shopify-inbox-hidden";
// Set while a theme-owned launcher replaces Shopify's bubble. Styling lives in
// `app/styles/app.css` because the closed widget host can only be hidden from
// the light DOM — its launcher sits in a shadow root we must not reach into.
const CUSTOM_LAUNCHER_ATTRIBUTE = "data-shopify-inbox-custom-launcher";

// Each mounted overlay owns one token. The widget is shown again only after
// every owner releases its token, so nested/overlapping dialogs cannot reveal
// the launcher while another overlay is still open.
const hiddenRequests = new Set<symbol>();

const useHydrationSafeLayoutEffect =
  typeof document === "undefined" ? useEffect : useLayoutEffect;

// Shopify-internal (undocumented) selectors for the chat launcher; they could
// change if Shopify updates the chat widget. Before the widget bundle loads the
// launcher is a `<button>` inside a same-origin `about:blank` iframe; once it
// loads the launcher is a `[data-spec="toggle-button"]` in the open shadow root
// of the `<inbox-online-store-chat>` web component.
const BUBBLE_IFRAME_ID = "dummy-chat-button-iframe";
const BUBBLE_BUTTON_ID = "dummy-chat-button";
const WIDGET_TAG = "inbox-online-store-chat";
const TOGGLE_SELECTOR = '[data-spec="toggle-button"]';

/**
 * Loads the Shopify Inbox (Shopify Chat) widget via the global loader script.
 * Renders nothing unless a shop domain and id are provided, so it degrades
 * gracefully when the store has not configured `PUBLIC_SHOPIFY_INBOX_SHOP_ID`.
 *
 * The loader is injected on the client only after the window `load` event.
 * Shopify's script assigns `window.onload` and immediately self-invokes it; if
 * it runs before the page finishes loading, the browser fires that handler a
 * second time on the real `load` event, which re-mounts the chat iframe and
 * wipes the freshly rendered button (leaving an empty `#shopify-chat-dummy`,
 * i.e. no visible bubble). Deferring injection until after `load` keeps the
 * handler to a single invocation so the button persists.
 *
 * Note: the widget is blocked by Shopify's bot protection on localhost — verify
 * on a deployed (staging/production) domain.
 */
export function ShopifyInbox({
  shop,
  button,
  env = "production",
  version = "V1",
}: ShopifyInboxProps) {
  const isConfigured = Boolean(shop?.domain && shop?.id);

  let src = "";
  if (isConfigured) {
    const mergedButton = { ...DEFAULT_BUTTON, ...button };
    const params = new URLSearchParams({
      v: version.replace(/^V/i, ""),
      api_env: env,
      shop_id: shop.id,
      shop: shop.domain,
    });
    for (const [key, paramKey] of Object.entries(BUTTON_PARAM_KEYS)) {
      params.set(paramKey, mergedButton[key as keyof ShopifyInboxButton]);
    }
    src = `${LOADER_BASE_URL}/shopifyChat${version}.js?${params}`;
  }

  useEffect(() => {
    if (!src) {
      console.error(
        "ShopifyInbox: `shop.domain` and `shop.id` are required. Find them in the Shopify Inbox app settings.",
      );
      return;
    }

    function injectLoader() {
      if (document.getElementById(SCRIPT_ID)) {
        return;
      }
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = src;
      document.head.appendChild(script);
    }

    if (document.readyState === "complete") {
      injectLoader();
      return;
    }
    window.addEventListener("load", injectLoader, { once: true });
    return () => window.removeEventListener("load", injectLoader);
  }, [src]);

  return null;
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
 * overlays. It also degrades gracefully when Inbox is not configured or has
 * not mounted yet: CSS keyed by `HIDDEN_ATTRIBUTE` applies when Shopify later
 * injects its placeholder iframe or loaded web component.
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
 * Opens the Shopify Inbox chat from your own UI (e.g. a "Message us" button).
 * Returns `true` when a launcher was found and clicked, or the chat is already
 * open; `false` otherwise (the widget has not rendered yet, or Inbox is not
 * configured).
 *
 * Handles both widget states with Shopify-internal selectors:
 * 1. Before the widget bundle loads, Shopify renders a placeholder bubble in a
 *    same-origin iframe — clicking it lazy-loads and opens the full widget.
 * 2. Once loaded (e.g. for returning visitors), the widget is an
 *    `<inbox-online-store-chat>` web component whose launcher lives in an open
 *    shadow root. The launcher toggles, so the click is skipped when open.
 *
 * There is no supported Shopify API to send or pre-fill a message from the
 * storefront — the chat composer runs in a Shopify-hosted, cross-origin context
 * — so opening the widget is the only durable programmatic action.
 */
export function openShopifyInbox(): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  // 1. Placeholder bubble inside the loader's same-origin iframe.
  const iframe = document.getElementById(
    BUBBLE_IFRAME_ID,
  ) as HTMLIFrameElement | null;
  const bubbleButton =
    iframe?.contentWindow?.document?.getElementById(BUBBLE_BUTTON_ID);
  if (bubbleButton) {
    bubbleButton.click();
    return true;
  }

  // 2. Loaded web component: open it via the launcher in its shadow root,
  //    unless the chat window is already open (the launcher toggles). The host
  //    may be visually hidden by the custom-launcher CSS; a programmatic click
  //    still dispatches, so this works either way.
  const widget = document.querySelector(WIDGET_TAG);
  if (widget) {
    if (widget.getAttribute("is-open") === "true") {
      return true;
    }
    const launcher =
      widget.shadowRoot?.querySelector<HTMLElement>(TOGGLE_SELECTOR);
    if (launcher) {
      launcher.click();
      return true;
    }
  }

  return false;
}

type ShopifyInboxLauncherProps = {
  position?: "bottom_left" | "bottom_right";
  /** Visible label. Omit to render an icon-only circular button. */
  label?: string;
};

/**
 * Theme-styled replacement for Shopify's chat bubble.
 *
 * Shopify renders its launcher in a Shopify-hosted frame (before load) or an
 * `<inbox-online-store-chat>` shadow root (after load), so it cannot be
 * restyled — only positioned and recolored via loader params. This renders a
 * button that matches the theme instead, and suppresses Shopify's own launcher
 * while the chat is closed. Once the chat opens, Shopify's widget is revealed
 * again so its launcher can still act as the close control.
 *
 * Mount this only alongside `<ShopifyInbox>`; it does nothing on its own.
 */
export function ShopifyInboxLauncher({
  position = "bottom_left",
  label,
}: ShopifyInboxLauncherProps) {
  useHydrationSafeLayoutEffect(() => {
    document.documentElement.setAttribute(CUSTOM_LAUNCHER_ATTRIBUTE, "");
    return () =>
      document.documentElement.removeAttribute(CUSTOM_LAUNCHER_ATTRIBUTE);
  }, []);

  return (
    <Button
      variant="primary"
      // `animate` wraps the button in ScrollReveal, which is wrong for a
      // permanently fixed launcher — it would fade in on scroll.
      animate={false}
      onClick={() => openShopifyInbox()}
      aria-label={label || "Chat with us"}
      className={cn(
        "shopify-inbox-launcher",
        "fixed bottom-5 z-9 gap-2 shadow-lg",
        "transition-transform hover:scale-105",
        label ? "px-5 py-3" : "p-4",
        position === "bottom_left" ? "left-5" : "right-5",
      )}
    >
      <Icon name="chat-teardrop-dots" className="size-6 shrink-0" />
      {label && <span className="font-semibold">{label}</span>}
    </Button>
  );
}
