<h1 align="center">Pilot — Production-ready Shopify Hydrogen theme</h1>

<div align="center">

A lightning-fast, fully-customizable Shopify storefront built with **Hydrogen**, **React Router 7**, and **Weaverse**.

📚 [Docs](https://weaverse.io/docs) · 🚀 [Live demo](https://pilot.weaverse.dev) · 🎨 [Customize in Weaverse Studio](https://studio.weaverse.io/demo?theme=pilot) · 🗣 [Slack community](https://join.slack.com/t/weaversecommunity/shared_invite/zt-235bv7d80-velzJU8CpZIHWdrzFwAdXg) · 🐞 [Report a bug](https://github.com/weaverse/pilot/issues)

</div>

![Weaverse + Hydrogen + Shopify](https://cdn.shopify.com/s/files/1/0838/0052/3057/files/weaverse-x-hydrogen-x-shopify.png?v=1755245801)

Pilot pairs a hand-tuned Hydrogen storefront (SSR, streaming, edge-ready) with **Weaverse Studio**, so developers keep full control of the code while merchants edit every page visually — no redeploys. It ships with the routes, sections, and integrations a real store needs on day one.

---

## Quick start

Pick the path that fits you. All three end at a running storefront on **http://localhost:3456**.

### Option A — Let your AI coding agent do it (fastest)

Pilot is built to be set up by an agent (Cursor, Claude Code, Codex, opencode, …). Add the Weaverse skills, then ask your agent to set up the project:

```bash
npx skills add Weaverse/shopify-hydrogen-skills
```

> "Use the `setup-weaverse-project` skill to set up this Weaverse Hydrogen storefront."

The agent boots a **live preview on the bundled demo store first** (≈2 minutes, zero credentials), then helps you swap in your own store and project. See [AI coding agent support](#ai-coding-agent-support) below.

### Option B — Weaverse Studio (no code)

1. Install the [Weaverse Hydrogen Customizer](https://apps.shopify.com/weaverse) from the Shopify App Store.
2. Create a new Hydrogen storefront in Weaverse and pick **Pilot**.
3. Follow the in-Studio instructions to initialize the project locally with `@weaverse/cli`.
4. Open **Weaverse Studio** and start customizing.

### Option C — Clone and run it yourself

```bash
git clone https://github.com/weaverse/pilot my-storefront
cd my-storefront
cp .env.example .env   # ships working demo-store tokens + a demo WEAVERSE_PROJECT_ID
npm install
npm run dev            # → http://localhost:3456
```

`.env.example` contains a live demo store's tokens, so the storefront runs immediately. Swap in your own values (see [Environment](#environment)) when you're ready to make it yours.

---

## Requirements

- **Node.js** ≥ 22.12.0
- **npm** (the repo ships a `package-lock.json`)
- A **Shopify** store and the [Weaverse app](https://apps.shopify.com/weaverse) to customize visually and get a `WEAVERSE_PROJECT_ID`

---

## AI coding agent support

Pilot is designed to be developed *with* an agent:

- **`AGENTS.md`** — committed to the repo with inline Weaverse component patterns, the schema/input-type reference, loader patterns, and common pitfalls. Cursor, Claude Code, Windsurf, Codex, and GitHub Copilot read it automatically.
- **Weaverse MCP** — give your agent first-class access to your Weaverse account (search the docs, list projects/pages, read a page as Portable Text, theme settings, locales) over the read-only Content API:

  ```bash
  npx -y @weaverse/mcp
  ```

  Docs search needs no key; account tools use `WEAVERSE_API_KEY` (account tools require `@weaverse/mcp` ≥ 2.2.0). Per-client setup (Cursor, Claude Code, Codex, opencode, VS Code, …): **https://weaverse.io/docs/developer-tools/weaverse-mcp**
- **`setup-weaverse-project` skill** — the demo-first onboarding flow used in Option A, from [`Weaverse/shopify-hydrogen-skills`](https://github.com/Weaverse/shopify-hydrogen-skills).

---

## What's included

**Stack**
- [Shopify Hydrogen](https://hydrogen.shopify.dev/) on Oxygen, with the Shopify CLI
- [React Router 7](https://reactrouter.com/) — routing, SSR, and data loading
- [TailwindCSS v4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) + [class-variance-authority](https://cva.style/)
- TypeScript (strict) and GraphQL codegen
- [Biome](https://biomejs.dev/) for linting/formatting
- [Swiper](https://swiperjs.com/) carousels, [Playwright](https://playwright.dev/) E2E tests

**Commerce features**
- [Customer Account API](https://www.shopify.com/partners/blog/introducing-customer-account-api-for-headless-stores) (OAuth-based login)
- [Combined Listings](https://shopify.dev/docs/apps/build/product-merchandising/combined-listings) and [product bundles](https://help.shopify.com/en/manual/products/bundles)
- Predictive search, cart, markets/localization, SEO, and analytics
- [Judge.me](https://judge.me/) reviews, [Klaviyo](https://www.klaviyo.com/) email, and [Shopify Inbox](https://apps.shopify.com/inbox) chat ([setup guide](.weaverse/docs/shopify-inbox.md))

**And** every section is editable in [Weaverse Studio](https://weaverse.io) — no redeploy to change content or layout.

---

## Getting started

## Commands

```bash
npm run dev          # dev server + codegen on http://localhost:3456
npm run build        # production build (shopify hydrogen build --codegen)
npm run preview      # build, then preview the production bundle
npm run typecheck    # tsc --noEmit
npm run biome:fix    # lint + format (write)
npm run e2e          # Playwright end-to-end tests
```

Run `npm run biome:fix && npm run typecheck` before committing.

---

## Environment

The minimum variables needed to render a storefront (the rest are feature-complete extras):

| Variable | Required | Source |
|---|---|---|
| `SESSION_SECRET` | yes | any random string |
| `PUBLIC_STORE_DOMAIN` | yes | Shopify (Hydrogen sales channel / Headless app) |
| `PUBLIC_STOREFRONT_API_TOKEN` | yes | Shopify (Hydrogen sales channel / Headless app) |
| `WEAVERSE_PROJECT_ID` | yes | Weaverse Studio (or the agent handshake) |
| `SHOP_ID`, customer-account, checkout, analytics, reviews | no | Shopify / integrations, add after first success |

If your store is already linked to a Hydrogen channel, `npx shopify hydrogen env pull` fills these in. See [`.env.example`](.env.example) for the full list.

---

## Project structure

```
app/
├── components/   # Reusable UI components
├── sections/     # Weaverse sections (visually editable)
├── routes/       # React Router routes (locale-prefixed)
├── graphql/      # GraphQL queries & fragments
├── hooks/        # Shared React hooks
├── utils/        # Helpers
├── weaverse/     # Weaverse client, component registry, theme schema
└── .server/      # Server-only context (Hydrogen + Weaverse client)
```

Key config: `react-router.config.ts`, `vite.config.ts`, `codegen.ts`, `biome.json`, `AGENTS.md`.

---

## Developer guide

### Load page data in parallel

Every route loads Weaverse data alongside its Storefront queries with `Promise.all()`:

```tsx
// app/routes/home.tsx
import type { LoaderFunctionArgs } from 'react-router';

export async function loader({ context }: LoaderFunctionArgs) {
  const { storefront, weaverse } = context;
  const [weaverseData, { shop }] = await Promise.all([
    weaverse.loadPage({ type: 'INDEX' }),
    storefront.query(SHOP_QUERY),
  ]);
  return { weaverseData, shop };
}
```

`context.weaverse` is a `WeaverseClient` injected in `app/.server/context.ts` (`new WeaverseClient({ ...hydrogenContext, request, cache, themeSchema, components })`).

### Render a page

```tsx
// app/routes/home.tsx
import { WeaverseContent } from '~/weaverse';

export default function Homepage() {
  return <WeaverseContent />;
}
```

`WeaverseContent` wraps `WeaverseHydrogenRoot` from `@weaverse/hydrogen` with the project's component registry.

### Installable mobile app (PWA)

Pilot can make the storefront installable as a home-screen app on iOS and Android — no app store, branded per merchant. Enable it in theme settings under **Mobile app (PWA)** and optionally upload a square app icon (512×512 PNG recommended; falls back to the Shopify brand logo).

- `/manifest.webmanifest` is generated from theme settings (`app/routes/pwa/manifest.webmanifest.ts`).
- A minimal service worker (`public/sw.js`) caches only hashed build assets and Shopify CDN images. HTML, cart, account, and checkout are never intercepted.
- iOS shows no install prompt, so an optional one-time hint banner explains Share → Add to Home Screen (`app/components/pwa-install-hint.tsx`).
- Push notifications are intentionally not included.

### Use global theme settings

Theme settings load in `root.tsx` and are read anywhere with `useThemeSettings`:

```tsx
import { useThemeSettings } from '@weaverse/hydrogen';

function Logo() {
  const { logo } = useThemeSettings();
  return <img src={logo} alt="Logo" />;
}
```

### Create a section

Add a file under `app/sections/`, export a component (it **must** accept `ref` and extend `HydrogenComponentProps`) and a `schema`, then register it in `app/weaverse/components.ts`.

```tsx
// app/sections/video/index.tsx
import { createSchema, type HydrogenComponentProps } from '@weaverse/hydrogen';

interface VideoProps extends HydrogenComponentProps {
  ref: React.Ref<HTMLElement>;
  heading: string;
  videoUrl: string;
}

export default function Video({ ref, heading, videoUrl, ...rest }: VideoProps) {
  return (
    <section ref={ref} {...rest}>
      <h2>{heading}</h2>
      <iframe src={videoUrl} title="Video" allowFullScreen />
    </section>
  );
}

export const schema = createSchema({
  type: 'video',
  title: 'Video',
  settings: [
    {
      group: 'Video',
      inputs: [
        { type: 'text', name: 'heading', label: 'Heading', defaultValue: 'Learn more' },
        { type: 'text', name: 'videoUrl', label: 'Video URL', defaultValue: 'https://www.youtube.com/embed/-akQyQN8rYM' },
      ],
    },
  ],
});
```

Need data from Shopify or a third-party API? Export a **server-side** `loader` from the section and read it via `Component.props.loaderData`:

```tsx
import type { ComponentLoaderArgs } from '@weaverse/hydrogen';

export const loader = async ({ weaverse, data }: ComponentLoaderArgs) => {
  const result = await weaverse.storefront.query(HOMEPAGE_SEO_QUERY, {
    variables: { handle: data.collection?.handle || 'frontpage' },
  });
  return result.data;
};
```

```ts
// app/weaverse/components.ts
import * as Video from '~/sections/video';
export const components: HydrogenComponent[] = [/* …existing, */ Video];
```

### Dev tools

- Storefront: http://localhost:3456
- GraphiQL: http://localhost:3456/graphiql
- Network inspector: http://localhost:3456/debug-network

---

## Deployment

- [Shopify Oxygen](https://weaverse.io/docs/deployment/oxygen) (recommended)
- [Vercel](https://wvse.cc/deploy-pilot-to-vercel)

> [!NOTE]
> Large storefronts can hit a `JavaScript heap out of memory` error (exit code 134) during the Oxygen build. If that happens, raise Node's heap limit on the deploy step in the generated GitHub Actions workflow (`.github/workflows/oxygen-deployment-*.yml`):
>
> ```yaml
> - name: Build and Publish to Oxygen
>   run: npx shopify hydrogen deploy
>   env:
>     SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN: ${{ secrets.OXYGEN_DEPLOYMENT_TOKEN_... }}
>     NODE_OPTIONS: --max-old-space-size=8192
> ```
>
> Production sourcemaps are already disabled in `vite.config.ts` (`build.sourcemap: false`) to keep build memory down.

---

## Who's using Pilot

These **Shopify (Plus)** brands run on Weaverse/Pilot in production:

- [Huckleberry Roasters](https://www.huckleberryroasters.com/) — award-winning Colorado coffee, ethically sourced since 2011.
- [Bubble Goods](https://bubblegoods.com/) — 2,000+ healthy foods from independent U.S. makers.
- [Karma and Luck](https://www.karmaandluck.com) — lifestyle brand rooted in timeless traditions.
- [Baltzar](https://baltzar.com/) — curated menswear from world-renowned specialists.
- [iROCKER](https://irockersup.com/) — premium paddle boards and water gear.
- [Roland (Brazil)](https://store.roland.com.br/) — electronic musical instruments.
- [Timothy London](https://timothy.london/) — premium British travel goods.
- [Vasuma Eyewear](https://vasuma.com/) — Stockholm eyewear inspired by the 50s–60s.

…and many more.

---

## References

- [Weaverse docs](https://weaverse.io/docs) · [Weaverse MCP](https://weaverse.io/docs/developer-tools/weaverse-mcp)
- [Hydrogen](https://shopify.dev/custom-storefronts/hydrogen) · [React Router 7](https://reactrouter.com/)
- [Tailwind CSS v4](https://tailwindcss.com/) · [Radix UI](https://www.radix-ui.com/) · [Biome](https://biomejs.dev/)

Contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). Licensed under [MIT](LICENSE.md).

---

Let **Weaverse** & **Pilot** power your Shopify store with top-tier performance and unmatched customization. 🚀
