import { Script } from "@shopify/hydrogen";

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

/**
 * Loads the Shopify Inbox (Shopify Chat) widget via the global loader script.
 * Renders nothing unless a shop domain and id are provided, so it degrades
 * gracefully when the store has not configured `PUBLIC_SHOPIFY_INBOX_SHOP_ID`.
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
  if (!(shop?.domain && shop?.id)) {
    console.error(
      "ShopifyInbox: `shop.domain` and `shop.id` are required. Find them in the Shopify Inbox app settings.",
    );
    return null;
  }

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

  const src = `${LOADER_BASE_URL}/shopifyChat${version}.js?${params}`;

  return <Script async id="shopify-inbox" src={src} suppressHydrationWarning />;
}
