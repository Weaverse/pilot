import { useEffect } from "react";

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

// Shopify renders the chat bubble as a `<button>` inside a same-origin
// `about:blank` iframe. These ids are Shopify-internal (undocumented) and could
// change if Shopify updates the chat loader.
const BUBBLE_IFRAME_ID = "dummy-chat-button-iframe";
const BUBBLE_BUTTON_ID = "dummy-chat-button";

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

/**
 * Opens (toggles) the Shopify Inbox chat by clicking its bubble button. Returns
 * `true` when the button exists and was clicked, `false` otherwise (e.g. the
 * loader has not rendered the button yet, or Inbox is not configured).
 *
 * There is no supported Shopify API to send or pre-fill a message from the
 * storefront — the chat composer runs in a Shopify-hosted, cross-origin context
 * — so opening the widget is the only durable programmatic action.
 */
export function openShopifyInbox(): boolean {
  if (typeof document === "undefined") {
    return false;
  }
  const iframe = document.getElementById(
    BUBBLE_IFRAME_ID,
  ) as HTMLIFrameElement | null;
  const button =
    iframe?.contentWindow?.document?.getElementById(BUBBLE_BUTTON_ID);
  if (button) {
    button.click();
    return true;
  }
  return false;
}
