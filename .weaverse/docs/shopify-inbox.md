# Shopify Inbox (Chat) Integration

Pilot can render the [Shopify Inbox](https://apps.shopify.com/inbox) chat widget on every storefront page, giving shoppers real-time support without leaving the store.

The widget is **opt-in**: it only renders when `PUBLIC_SHOPIFY_INBOX_SHOP_ID` is set, and degrades gracefully (renders nothing) otherwise.

## How it works

- [`app/utils/env.ts`](../../app/utils/env.ts) — `getPublicEnv()` filters the server `Env` down to its `PUBLIC_*` keys so private credentials are never sent to the browser.
- [`app/root.tsx`](../../app/root.tsx) — the root `loader` returns `publicEnv: getPublicEnv(args.context.env)`, and the `Layout` renders `<ShopifyInbox>` when `publicEnv.PUBLIC_SHOPIFY_INBOX_SHOP_ID` is present.
- [`app/components/shopify-inbox.tsx`](../../app/components/shopify-inbox.tsx) — injects the loader `<script>` on the client **after the window `load` event** (see [Why the loader is injected after `load`](#why-the-loader-is-injected-after-load)). The script loads from `cdn.shopify.com`, which the CSP already allow-lists by host, so no nonce is required.

### Global loader — no app-extension UUID required

The component injects the **store-agnostic** loader:

```
https://cdn.shopify.com/shopifycloud/shopify_chat/storefront/shopifyChatV1.js?...&shop_id=<id>&shop=<domain>
```

This loader reads `shop_id`/`shop` from its own `<script>` tag and resolves the
store's widget bundle (`.../storefront/shopifyChatV1Widget.js`) at runtime. It is
the same tag a Liquid Online Store injects into its `<head>`.

> **Do not** hardcode the theme-app-extension URL
> (`cdn.shopify.com/extensions/<uuid>/inbox-<version>/assets/shopifyChatV1Widget.js`).
> That path embeds a store-specific UUID and a pinned version (`inbox-1274`, …)
> that change per store and per app update. The global loader above has no such
> dependency.

### Why the loader is injected after `load`

Shopify's loader bootstraps with `window.onload = handler; window.onload()` — it
**overwrites** `window.onload` and invokes it once immediately. The handler
mounts an `about:blank` bubble iframe and writes the chat button into it.

If the loader runs **before** the page's real `load` event (e.g. as an SSR
`<script async>` or any script that executes during initial load), the browser
fires that reassigned `window.onload` a **second** time on real `load`. The
second invocation re-mounts the bubble iframe, which resets its document and
**wipes the freshly written button** — leaving an empty `#shopify-chat-dummy`
and no visible chat bubble.

Injecting the loader only after `load` (when `document.readyState === "complete"`,
otherwise on the one-shot `load` listener) keeps `window.onload` to a single
invocation, so the button renders and persists.

> **Do not** revert this to an SSR `<Script async>` / `defer` tag, or to
> `waitForHydration` — hydration can finish before `load` on image-heavy pages,
> which re-introduces the double-invocation and the empty button.

## Setup

### 1. Enable Shopify Inbox

1. Install the [Shopify Inbox](https://apps.shopify.com/inbox) app in your Shopify admin.
2. Enable the chat for the **Online Store** sales channel.

### 2. Find your Inbox shop id

1. Open the published Liquid theme preview for your store.
2. Inspect the `<head>` and find the `shopifyChatV1.js` script tag.
3. Copy the value of its `shop_id` query parameter.

(See the [reference walkthrough](https://github.com/juanpprieto/hydrogen-chat-inbox?tab=readme-ov-file#1-find-your-shopify-inbox-shop-id) for screenshots.)

### 3. Configure the environment variable

Add the id to `.env`:

```env
PUBLIC_SHOPIFY_INBOX_SHOP_ID=your-shopify-inbox-shop-id
```

`shop.domain` is sent as the Inbox `shop` parameter and uses `PUBLIC_STORE_DOMAIN` (your store's `*.myshopify.com` domain) — the same value Shopify's injected Inbox tag carries — so no additional variable is required.

## Configuration options

By default the widget uses a black icon button anchored bottom-right. To customize it, pass a `button` prop to `<ShopifyInbox>` in [`app/root.tsx`](../../app/root.tsx):

```tsx
<ShopifyInbox
  shop={{ domain: publicEnv.PUBLIC_STORE_DOMAIN, id: publicEnv.PUBLIC_SHOPIFY_INBOX_SHOP_ID }}
  button={{ color: "#000000", style: "icon", position: "bottom_right", verticalPosition: "lowest", text: "chat_with_us", icon: "chat_bubble" }}
/>
```

| Option | Default | Values |
| --- | --- | --- |
| `color` | `#000000` | Any hex color (e.g. `#202a36`) |
| `style` | `icon` | `icon`, `text` |
| `position` | `bottom_right` | `bottom_left`, `bottom_right` |
| `verticalPosition` | `lowest` | `lowest`, `higher`, `highest` |
| `text` | `chat_with_us` | `chat_with_us`, `assistance`, `contact`, `help`, `support`, `live_chat`, `message_us`, `need_help`, `no_text` |
| `icon` | `chat_bubble` | `chat_bubble`, `agent`, `speech_bubble`, `text_message`, `email`, `hand_wave`, `lifebuoy`, `paper_plane`, `service_bell`, `smiley_face`, `question_mark`, `team`, `no_icon` |

## Opening the chat from a button

Pilot ships a **Contact us** Weaverse section ([`app/sections/contact-us/`](../../app/sections/contact-us)) whose **Message us button** child opens the Inbox widget on click. Add it to any page in Weaverse Studio — it needs no configuration beyond `PUBLIC_SHOPIFY_INBOX_SHOP_ID`.

To open the chat from your own component, import the helper:

```tsx
import { openShopifyInbox } from "~/components/shopify-inbox";

<button type="button" onClick={openShopifyInbox}>
  Message us
</button>;
```

`openShopifyInbox()` opens the widget whatever state it is in: it clicks the loader's placeholder bubble (`#dummy-chat-button`, inside the same-origin `#dummy-chat-button-iframe`) for first-time visitors, or the `[data-spec="toggle-button"]` launcher inside the `<inbox-online-store-chat>` web component's shadow root once the full widget has loaded (skipping the click when the chat is already open, since that launcher toggles). It returns `true` when a launcher was found and clicked or the chat is already open, `false` otherwise (the widget has not rendered yet, or Inbox is not configured). These selectors are **Shopify-internal and undocumented** — they can change when Shopify updates the chat widget.

## Limitations

- **Localhost:** Shopify's bot protection blocks the widget on `localhost`. The loader `<script>` is still injected (after `load`), but the chat UI will not initialize. Verify on a deployed (staging/production) domain.
- **No programmatic send or pre-fill:** there is no supported API to send or pre-fill a message from the storefront. The chat composer runs in a Shopify-hosted, cross-origin frame, and the real send path is an internal, session-bound `postMessage` the widget mints after its own identity/bot checks. Opening the widget (`openShopifyInbox()`) is the only durable programmatic action.

## Content Security Policy

No CSP changes are required for the default setup:

- Pilot ships CSP in **report-only** mode (`app/entry.server.tsx`), so violations are logged but never block.
- The script loads from `cdn.shopify.com`, already allow-listed in `scriptSrc` (`app/weaverse/csp.ts`).
- The widget's iframe/network calls target `*.shopify.com` / `*.myshopify.com`, already covered by `defaultSrc`/`connectSrc`.

If you switch to an enforcing `Content-Security-Policy` header, keep those Shopify domains allow-listed.

## Security

Only `PUBLIC_*` environment variables reach the client. `getPublicEnv()` strips everything else (e.g. `SESSION_SECRET`, `*_PRIVATE_API_TOKEN`) before the loader serializes data to the browser.
