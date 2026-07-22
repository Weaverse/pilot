# PWA Support — Installable Storefront App (Spec)

**Status:** Spec, ready for implementation
**Date:** 2026-07-22
**Owner:** Theme team
**Effort:** ~1.5–2 days including tests/docs

## 1. Summary

Make every Pilot storefront installable as a home-screen app on iOS and Android — branded per merchant, driven entirely by Weaverse theme settings, zero merchant code. Four pieces:

1. A **PWA settings group** in theme inspector (toggle, app name, icon, colors).
2. A **manifest resource route** (`/manifest.webmanifest`) generated from those settings.
3. **Head tags** in `root.tsx` (manifest link, `theme-color`, apple-touch icon).
4. A **minimal service worker** (install-criteria + static-asset caching only).

Android/Chrome then offers a native "Install app" prompt; iOS installs via Share → Add to Home Screen (optional hint banner, see §8). The storefront opens fullscreen standalone.

### Non-goals (phase 2, explicitly out of scope)

- Push notifications (needs a subscription store + sender backend — product decision).
- Offline browsing / offline fallback page.
- App badging, background sync, `beforeinstallprompt` custom install UI.

## 2. Guiding constraints (from codebase analysis)

- **Oxygen full-page caching:** the SSR document is deliberately anonymous (cart hydrates client-side via `/api/cart` + `CartStoreSync` — see comments in `app/root.tsx` and `app/.server/root.ts`). The service worker must preserve this: **no HTML caching in v1 at all.** Nothing personalized may ever enter a SW cache.
- **CSP:** inline scripts need the nonce (`useNonce()`, `app/weaverse/csp.ts`). The SW registration script must carry it.
- **Checkout is cross-origin** (Shopify domain) — outside SW scope by default; do not add any fetch handler logic that touches it.
- **Routing is programmatic** (`app/routes.ts`, `hydrogenRoutes`). The manifest route registers **top-level, outside the `:locale?` prefix**, exactly like `robots.txt`.
- Default **off**. Merchants opt in via the toggle. No behavior change for existing stores on update.

## 3. Theme settings — `app/weaverse/settings/pwa.ts` (new)

New `InspectorGroup`, same style as existing groups (`as const satisfies InspectorGroup`):

```ts
import type { InspectorGroup } from "@weaverse/hydrogen";

export const pwaSettings = {
  group: "Mobile app (PWA)",
  inputs: [
    {
      type: "switch",
      label: "Enable installable app",
      name: "pwaEnabled",
      defaultValue: false,
      helpText:
        "Lets shoppers add your store to their phone's home screen as an app (Android install prompt, iOS via Share → Add to Home Screen).",
    },
    {
      type: "text",
      label: "App name",
      name: "pwaName",
      defaultValue: "",
      helpText: "Shown under the app icon. Leave empty to use your store name.",
      condition: (settings) => settings.pwaEnabled,
    },
    {
      type: "text",
      label: "Short name",
      name: "pwaShortName",
      defaultValue: "",
      helpText: "Max ~12 characters; used where space is limited. Falls back to app name.",
      condition: (settings) => settings.pwaEnabled,
    },
    {
      type: "image",
      label: "App icon",
      name: "pwaIcon",
      helpText:
        "Square PNG, at least 512×512, no transparency for best results. Falls back to your logo if empty (logo aspect ratios may look wrong as an app icon — recommend uploading a dedicated icon).",
      condition: (settings) => settings.pwaEnabled,
    },
    {
      type: "color",
      label: "Theme color",
      name: "pwaThemeColor",
      defaultValue: "#ffffff",
      helpText: "Colors the status bar / window chrome of the installed app.",
      condition: (settings) => settings.pwaEnabled,
    },
    {
      type: "color",
      label: "Splash background",
      name: "pwaBackgroundColor",
      defaultValue: "#ffffff",
      condition: (settings) => settings.pwaEnabled,
    },
    {
      type: "switch",
      label: "Show iOS install hint",
      name: "pwaIosHint",
      defaultValue: true,
      helpText: "One-time dismissible banner for iPhone Safari visitors explaining Add to Home Screen.",
      condition: (settings) => settings.pwaEnabled,
    },
  ],
} as const satisfies InspectorGroup;
```

Wiring (mirror existing groups exactly):

- Register in `app/weaverse/schema.server.ts` → `settings: [...]` array.
- Union the derived type into `ThemeSettings` in `app/types/weaverse.ts` (`ExtractSettings<typeof pwaSettings>`), so `useThemeSettings<ThemeSettings>()` stays typed.

Deliberately **not** configurable in v1: `display` (always `standalone`), `start_url`/`scope`/`id` (always `/`). Fewer knobs, fewer broken configs. Add later only if merchants ask.

## 4. Manifest resource route — `app/routes/pwa/manifest.webmanifest.ts` (new)

Model on `app/routes/seo/robots.ts` + `sitemap-weaverse.xml.ts`. Loader-only resource route:

```ts
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ context }: LoaderFunctionArgs) {
  const [theme, layout] = await Promise.all([
    context.weaverse.loadThemeSettings(),
    getShopBasics(context), // shop.name + brand logo; reuse/extract from .server/root.ts LAYOUT_QUERY
  ]);
  const s = theme ?? {};
  if (!s.pwaEnabled) {
    return new Response("Not found", { status: 404 });
  }

  const iconUrl: string | undefined = s.pwaIcon?.url || layout?.shop?.brand?.logo?.image?.url;
  const name: string = (s.pwaName || "").trim() || layout?.shop?.name || "Store";
  const shortName: string = (s.pwaShortName || "").trim() || name.slice(0, 12);

  const manifest = {
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    name,
    short_name: shortName,
    theme_color: s.pwaThemeColor || "#ffffff",
    background_color: s.pwaBackgroundColor || "#ffffff",
    icons: iconUrl ? buildIcons(iconUrl) : [],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
```

`buildIcons(url)`: Shopify CDN resize params on the uploaded image — square center-crop:

```ts
function cdnSize(url: string, px: number) {
  const u = new URL(url);
  u.searchParams.set("width", String(px));
  u.searchParams.set("height", String(px));
  u.searchParams.set("crop", "center");
  return u.toString();
}
function buildIcons(url: string) {
  return [
    { src: cdnSize(url, 192), sizes: "192x192", type: "image/png" },
    { src: cdnSize(url, 512), sizes: "512x512", type: "image/png" },
    // Same asset reused as maskable; merchants wanting perfect maskable padding upload a padded icon.
    { src: cdnSize(url, 512), sizes: "512x512", type: "image/png", purpose: "maskable" },
  ];
}
```

Notes:

- Register in `app/routes.ts` **top-level** (next to `robots.txt`): `route("manifest.webmanifest", "routes/pwa/manifest.webmanifest.ts")`.
- Cache 1h (not 24h like robots): merchants iterate on branding and expect the change to show up same-session. CDN-cached per Oxygen anyway.
- `crop=center` only guards non-square uploads; the setting's helpText asks for square.
- If the icon URL isn't from `cdn.shopify.com` (edge case), pass it through untouched — `URL` params on foreign hosts are harmless but don't guarantee sizing; acceptable v1.
- Non-PNG uploads: Shopify CDN can force format with `&format=png` if needed; add only if testing shows browsers rejecting WebP icons (Chrome accepts WebP; iOS ignores manifest icons and uses apple-touch-icon anyway — see §5).

## 5. Head tags — `app/root.tsx`

All conditional on `pwaEnabled` and rendered in the `<head>` JSX (they depend on theme settings, so the static `links` export can't carry them). Inside `RootLayout`, `useThemeSettings<ThemeSettings>()` is already called:

```tsx
{settings?.pwaEnabled ? (
  <>
    <link rel="manifest" href="/manifest.webmanifest" />
    <meta name="theme-color" content={settings.pwaThemeColor || "#ffffff"} />
    {/* iOS ignores manifest icons; apple-touch-icon is what Add to Home Screen uses */}
    {appleIconUrl ? <link rel="apple-touch-icon" href={appleIconUrl} /> : null}
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  </>
) : null}
```

`appleIconUrl` = the same icon source as the manifest at 180×180 (`cdnSize(url, 180)`). Source order: `pwaIcon` setting → Shopify brand logo (available from root loader `layout.shop.brand`).

## 6. Service worker — `public/sw.js` (new) + registration

**Purpose in v1:** satisfy Android install criteria and create the update pipeline. It is intentionally boring.

Caching policy (whitelist, not blacklist):

- `GET` same-origin `/assets/*` (Vite-hashed, immutable) → **cache-first**.
- `GET` `cdn.shopify.com` images → **stale-while-revalidate**, dedicated cache, cap ~60 entries (LRU-ish: delete oldest on overflow).
- **Everything else → network, untouched.** No HTML, no `/cart`, no `/account`, no `/api/*`, no cross-origin checkout. Not "never cache cart" as an exclusion list — simply nothing outside the two whitelisted buckets is ever intercepted.

Skeleton:

```js
const VERSION = "pilot-pwa-v1"; // bump on any sw.js change
const ASSET_CACHE = `${VERSION}-assets`;
const IMG_CACHE = `${VERSION}-img`;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.origin === location.origin && url.pathname.startsWith("/assets/")) {
    e.respondWith(cacheFirst(ASSET_CACHE, e.request));
  } else if (url.hostname === "cdn.shopify.com" && e.request.destination === "image") {
    e.respondWith(staleWhileRevalidate(IMG_CACHE, e.request));
  }
  // anything else: fall through to network — do not respondWith
});
```

**Registration:** inline script in `root.tsx` `<head>` (conditional on `pwaEnabled`), with the CSP nonce — not in `entry.client.tsx`, because entry has no access to theme settings:

```tsx
{settings?.pwaEnabled ? (
  <script
    nonce={nonce}
    dangerouslySetInnerHTML={{
      __html: `if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js"))}`,
    }}
  />
) : null}
```

Check `app/weaverse/csp.ts` allows nonce'd inline scripts (it does — same mechanism as existing inline scripts in root).

**Disable path:** if a merchant turns the toggle off, already-installed SWs stay registered. v1 accepts this (SW only caches immutable assets, harmless). Optional hardening: when `pwaEnabled` is off, root renders a nonce'd unregister one-liner instead. Cheap; include it.

## 7. `public/` additions

None required — icons come from the Shopify CDN, manifest is a route. Only `public/sw.js` is added. (Do **not** add static icon PNGs; they'd be Pilot-branded, not merchant-branded.)

## 8. iOS install hint — `app/components/pwa-install-hint.tsx` (new, small)

iOS never prompts, so adoption depends on a hint. Dismissible bottom banner:

- Render conditions (all must hold): `pwaIosHint` on, iOS Safari UA, **not** already standalone (`window.matchMedia("(display-mode: standalone)")` + legacy `navigator.standalone`), not previously dismissed (`localStorage` key `pilot:pwa-hint-dismissed`).
- Content: "Install {appName}: tap Share → Add to Home Screen" with the share glyph, an X to dismiss. Style with existing Tailwind conventions; keep it one file, no new deps.
- Mount in `root.tsx` layout (client-only render guard, like other client-only pieces stubbed in `vite.config.ts`).

Android gets Chrome's native prompt; no custom UI in v1.

## 9. Testing & acceptance

Unit/e2e (Playwright, existing setup):

1. `GET /manifest.webmanifest` with toggle **on** → 200, `application/manifest+json`, valid JSON containing `name`, `display: "standalone"`, 192+512 icons; with toggle **off** → 404.
2. Root document with toggle on contains manifest link, `theme-color`, apple-touch-icon, and the nonce'd SW registration script; with toggle off contains none of them.
3. `GET /sw.js` → 200, `text/javascript` (Vite serves `public/` automatically).

Manual acceptance:

4. Lighthouse: "installable" passes on a preview store.
5. Android Chrome: install prompt appears; installed app opens standalone; icon/name/colors correct.
6. iOS Safari 16.4+: Add to Home Screen uses apple-touch-icon; standalone launch; hint banner shows once and stays dismissed.
7. Regression: cart add/remove and checkout redirect behave identically with SW active (nothing intercepted); Oxygen page cache behavior unchanged (document stays anonymous).

## 10. Docs & rollout

- `README.md`: short "Installable mobile app (PWA)" section under the developer guide — what the toggle does, icon size guidance, iOS caveat.
- `AGENTS.md`: note the manifest resource route + settings group under route/settings conventions.
- `CHANGELOG.md` entry. Default off ⇒ safe minor release.
- Marketing note (outside this repo): "one-toggle installable app" is a differentiator vs other Hydrogen themes — worth a launch post once shipped.

## 11. File inventory

| Action | Path |
|---|---|
| add | `app/weaverse/settings/pwa.ts` |
| add | `app/routes/pwa/manifest.webmanifest.ts` |
| add | `public/sw.js` |
| add | `app/components/pwa-install-hint.tsx` |
| edit | `app/weaverse/schema.server.ts` (register group) |
| edit | `app/types/weaverse.ts` (union settings type) |
| edit | `app/routes.ts` (top-level manifest route) |
| edit | `app/root.tsx` (head tags, SW register/unregister, hint mount) |
| edit | `README.md`, `AGENTS.md`, `CHANGELOG.md` |

## 12. Phase 2 candidates (separate specs)

- **Web push** for back-in-stock / order updates: needs subscription storage + sender (likely a Weaverse platform service, not per-theme) — the reason `sw.js` exists as an update pipeline now.
- Offline fallback page (branded "you're offline").
- Custom Android install UI via `beforeinstallprompt` (measure native prompt conversion first).
