# Shopify Inbox (Chat) Integration

Pilot renders Shopify Inbox through Hydrogen's official `ShopifyScripts` integration and the `<shopify-chat>` web component.

The integration degrades safely when the standard Shopify shop identity is incomplete. It does not require an Inbox-specific shop ID.

> **Preview spike:** Hydrogen currently exposes this API only in its July 30, 2026 developer preview. Pilot keeps its stable Hydrogen runtime and installs the preview package as `@shopify/hydrogen-preview` solely to exercise the Inbox API. Replace the alias import with `@shopify/hydrogen/react` and remove the alias dependency when Shopify publishes a compatible stable release.

## How it works

- [`app/.server/root.ts`](../../app/.server/root.ts) builds the Inbox shop identity from `SHOP_ID`, `PUBLIC_STOREFRONT_ID`, and `PUBLIC_STORE_DOMAIN`. It returns `null` if any value is missing.
- [`app/root.tsx`](../../app/root.tsx) renders `<ShopifyInbox>` with the current locale and CSP nonce.
- [`app/components/shopify-inbox.tsx`](../../app/components/shopify-inbox.tsx) renders `<ShopifyScripts inbox>` and `<shopify-chat>`, exposes the custom-trigger helper, and preserves reference-counted overlay visibility.

Hydrogen loads the official module from:

```text
https://cdn.shopify.com/storefront/web-components/agent.js
```

The legacy `shopifyChatV1.js` loader, its query-string configuration, and `PUBLIC_SHOPIFY_INBOX_SHOP_ID` are no longer used.

## Setup

1. Install [Shopify Inbox](https://apps.shopify.com/inbox) in Shopify admin.
2. Enable the Agent feature.
3. Disable **Require sign-in to chat with staff** so shoppers can move from the AI agent to staff without signing in.
4. Configure Pilot's standard Shopify identity:

```env
SHOP_ID=your-shop-id
PUBLIC_STOREFRONT_ID=your-storefront-id
PUBLIC_STORE_DOMAIN=your-store.myshopify.com
```

No Inbox-specific environment variable is needed.

## Opening chat from a custom action

Pilot's **Contact us** section includes a **Message us** child action. It calls `openShopifyInbox()`, which uses the public `<shopify-chat>` API instead of Shopify's internal iframe or Shadow DOM selectors.

```tsx
import { openShopifyInbox } from "~/components/shopify-inbox";

<button type="button" onClick={openShopifyInbox}>
  Message us
</button>
```

The helper calls `shopify-chat.show()` and returns:

- `true` when chat is already open or was opened successfully;
- `false` when the component or its module has not loaded yet.

## Hiding chat during overlays

Drawers, dialogs, and popups should hide Shopify Inbox so the launcher or open panel cannot cover storefront content. For Radix dialogs, render `ShopifyInboxOverlayGuard` inside `Dialog.Content`:

```tsx
import * as Dialog from "@radix-ui/react-dialog";
import { ShopifyInboxOverlayGuard } from "~/components/shopify-inbox";

<Dialog.Content>
  <ShopifyInboxOverlayGuard />
  {/* Dialog content */}
</Dialog.Content>
```

The guard renders no DOM. Visibility requests are reference-counted, so closing one of several nested or overlapping overlays does not reveal chat while another remains open. Global CSS hides the `<shopify-chat>` host and applies even if the component upgrades after the overlay opens.

For an overlay that remains mounted, use the imperative helper:

```tsx
import { useEffect } from "react";
import { hideShopifyInbox } from "~/components/shopify-inbox";

useEffect(() => {
  if (open) {
    return hideShopifyInbox();
  }
}, [open]);
```

## Analytics, consent, and locale

The preview `ShopifyScripts` package is a new framework-agnostic architecture and cannot replace Pilot's current stable Hydrogen package directly. This spike therefore:

- keeps Pilot's existing `Analytics.Provider`;
- passes `shopifyAnalytics={false}` to the preview component to avoid loading the new Shopify analytics destination;
- uses `consent={{mode: "no-banner"}}` while Pilot's stable analytics integration continues to own its existing privacy-banner behavior;
- passes the current country and language to the Shopify bootstrap.

This compatibility bridge must be removed when Pilot migrates fully to the stable API. Re-test analytics events, consent changes, and locale navigation during that migration.

## Content Security Policy

Pilot passes Hydrogen's CSP nonce to `ShopifyScripts`. The Inbox module loads from `cdn.shopify.com`, which is already allowed by Pilot's Shopify CSP configuration.

Verify the deployed response and browser console before enabling an enforcing CSP header. Pilot currently reports CSP violations without blocking them.

## Verification

Local tests can verify rendering, types, overlay state, and the public custom-trigger contract. Shopify may block or limit the full Inbox runtime on localhost, so complete verification requires a deployed domain.

On desktop and mobile, verify:

- initial page load and client-side navigation;
- locale changes;
- custom **Message us** action;
- cart drawer, filters, newsletter popup, and overlapping dialogs;
- CSP and console output;
- AI-agent conversation and staff handoff with sign-in disabled.

## Current preview limitations

- A direct upgrade from stable `@shopify/hydrogen@2026.4.x` to the July 30 preview breaks Pilot because the preview no longer provides Hydrogen's React Router runtime exports, including `@shopify/hydrogen/react-router-types`.
- In Pilot's React 19 production preview, SSR emits one of each `ShopifyScripts` tag, but hydration leaves two DOM scripts for every generated ID (`shopify-inbox`, consent, analytics bus, and related bootstrap scripts). The module registers `<shopify-chat>` successfully, but this duplicate bootstrap must be resolved upstream or during the stable migration before production rollout.
- The preview package types register `<shopify-chat>` as an intrinsic element but do not type its `show()`, `close()`, or `open` members. The shipped `agent.js` runtime exposes those members; this spike supplies a local interface until Shopify publishes complete web-component types and stable migration guidance.
