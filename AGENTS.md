# AGENTS.md

This file provides guidance to AI agents (Claude, GitHub Copilot, Cursor, etc.) when working with code in this repository.

## Project Overview

This is **Pilot**, a Shopify Hydrogen theme powered by Weaverse - a visual page builder for Hydrogen storefronts. The project is built with React 19, TypeScript, React Router 7, and Tailwind CSS v4. It runs on Node.js 20+ and uses Biome for linting/formatting.

## Architecture Overview

### Route Structure
Routes are defined in `app/routes.ts` using React Router v7's programmatic routing with Hydrogen's `hydrogenRoutes` wrapper (migrated from flat file-based routing in v7.0.0). All routes support internationalization via the `:locale?` prefix:
- Homepage: `routes/home.tsx`
- Products: `routes/products/product.tsx` (`:productHandle`)
- Collections: `routes/collections/collection.tsx` (`:collectionHandle`)
- Account: `routes/account/*` (layout-based with nested routes)
- API routes: `routes/api/*`
- Cart operations: `routes/cart/*`
- Policies & Pages: `routes/pages/regular-page.tsx`, `routes/policies/policy.tsx`
- Blogs: `routes/blogs/blog.tsx`, `routes/blogs/article.tsx`
- SEO: `routes/seo/robots.ts`, `routes/seo/sitemap.ts`

**Adding New Routes**: Always add new routes to `app/routes.ts` using the `route()`, `index()`, `layout()`, and `prefix()` helpers from `@react-router/dev/routes`.

### Key Architectural Patterns

1. **Parallel Data Loading**: Every page route loads Weaverse data alongside GraphQL queries using `Promise.all()`:
   ```typescript
   const [{ shop, product }, weaverseData, productReviews] = await Promise.all([
     storefront.query(PRODUCT_QUERY, { variables }),
     weaverse.loadPage({ type: "PRODUCT", handle }),
     getJudgeMeProductReviews({ context, handle }),
   ]);
   ```

2. **Component Structure**:
   - `/app/sections/` - Weaverse visual builder sections with schema exports and optional loaders
   - `/app/components/` - Reusable UI components organized by feature (cart/, product/, layout/, customer/)
   - Each Weaverse section must export: default component + schema + optional loader

3. **Data Fetching**:
   - GraphQL fragments in `/app/graphql/fragments.ts`
   - Complete queries in `/app/graphql/queries.ts`
   - Route loaders handle all data fetching server-side
   - Use `routeHeaders` for consistent cache control

4. **Styling**:
   - Tailwind CSS v4 with custom utilities
   - class-variance-authority (cva) for component variants
   - Use the `cn()` utility from `/app/utils/cn.ts` for class merging
   - Biome's `useSortedClasses` enabled for `clsx`, `cva`, and `cn` functions

5. **Type Safety**:
   - GraphQL types are auto-generated via codegen
   - Path alias `~/` maps to `/app/` directory
   - Strict TypeScript configuration
   - Two separate codegen outputs:
     - `storefront-api.generated.d.ts` - For all storefront queries (excludes account routes)
     - `customer-account-api.generated.d.ts` - For customer account queries (only in `*.account*.{ts,tsx,js,jsx}` files)

### Important Integrations

- **Weaverse**: Visual page builder - sections must be registered in `/app/weaverse/components.ts`
- **Judge.me**: Product reviews integration via utilities in `/app/utils/judgeme.ts`
- **Combined Listings**: Product grouping system via `/app/utils/combined-listings.ts`
- **Customer Accounts**: New Shopify Customer Account API support (OAuth-based)
- **Radix UI**: For accessible UI primitives (accordion, dialog, dropdown, etc.)
- **Swiper**: For carousel/slideshow functionality
- **Zustand**: For lightweight state management

### Weaverse Section Development

1. **Creating a New Section**:
  ```typescript
  // app/sections/my-section/index.tsx
  import { createSchema, type HydrogenComponentProps } from '@weaverse/hydrogen';
  import type { ComponentRef } from 'react';

  interface MyProps extends HydrogenComponentProps {
    heading: string;
    ref?: React.Ref<HTMLDivElement>;
  }

  const MySection = ({ ref, ...props }: MyProps) => {
    // Component implementation
  };

  export default MySection;

  export const schema = createSchema({
    type: 'my-section',
    title: 'My Section',
    settings: [/* ... */]
  });

  // Optional loader for server-side data fetching
  export const loader = async ({ weaverse, data }) => {
    // Fetch data
  };
  ```

2. **Register in `/app/weaverse/components.ts`**:
   ```typescript
   import * as MySection from "~/sections/my-section";
   export const components = [
     // ... existing components
     MySection,
   ];
   ```

### Environment Configuration

Required environment variables are defined in `env.d.ts`. The project uses `@shopify/hydrogen` and `@shopify/remix-oxygen` for environment handling.

### Biome Configuration

The project extends from `ultracite` and `@weaverse/biome` configurations with these customizations:
- Double quotes for strings
- Semicolons always
- Trailing commas
- Max cognitive complexity: 50
- Sorted Tailwind classes in `clsx`, `cva`, and `cn` functions

## Code Conventions

### Critical Rules (Always Check)

- Use `const` for constants with `ALL_CAPS` naming and `let` for everything else
- Use `cn()` utility for dynamic classes, never template strings
- Use function declarations `function foo()` not arrow expressions (exception: route `meta`/`loader`/`action` exports follow React Router conventions)
- Named exports only, no default exports (exceptions: Route components, Weaverse sections, and Weaverse-registered components)
- No `useMemo` or `useCallback` (React 19 compiler handles it)

### File Organization

- Co-locate related files (component, styles, types, utils)
- No barrel exports (index.ts re-export files)
- Use kebab-case for filenames: `product-card.tsx`

### Naming

- Components: PascalCase (`ProductCard`)
- Files: kebab-case (`product-card.tsx`)
- Functions: camelCase (`getProduct`)
- Constants: UPPER_SNAKE_CASE (`REVIEWS_PER_PAGE`)
- Types: PascalCase (`Product`, `Cart`)

### Styling

- Use Tailwind CSS
- Use `cn()` from `lib/cn` for conditional classes (No string templates)
- Use `cva` for building component class variants, not objects or arrays

## Common Pitfalls to Avoid

1. **GraphQL Codegen**: Always run `npm run codegen` after modifying GraphQL queries/fragments
2. **Route Registration**: New routes must be added to `/app/routes.ts` (not file-based routing anymore)
3. **Weaverse Registration**: New sections must be registered in `/app/weaverse/components.ts`
4. **Route Caching**: Use `routeHeaders` export for consistent cache control
5. **Customer Account Queries**: Only use in `*.account*.{ts,tsx,js,jsx}` files - this naming pattern is critical
6. **Parallel Loading**: Always use `Promise.all()` for multiple data fetches in loaders
7. **Type Safety**: Avoid `any` type when possible, use `unknown` if escape hatch needed, properly type all Weaverse section props
8. **Combined Listings**: Use utility functions from `/app/utils/combined-listings.ts` for product filtering and grouping logic
9. **Package Manager**: Use npm (not pnpm) - the project is configured for npm package management

## Release Process

To release a new version of Pilot:

```bash
# 1. Switch to main and pull latest
git checkout main && git pull origin main

# 2. Regenerate package-lock.json (REQUIRED — ensures lockfile matches after merges)
npm i --package-lock-only --workspaces=false

# 3. Bump version (use calver: YYYY.M.D, e.g. 2026.4.7)
npm version <version> --no-git-tag-version

# 4. Commit, tag, and push via PR (main is protected)
git add package.json package-lock.json
git commit -m "chore: release v<version>"
git tag v<version>
git push origin main:release/v<version> --tags
gh pr create --head release/v<version> --base main --title "chore: release v<version>"
gh pr merge <pr-number> --squash --delete-branch

# 5. Create GitHub release with changelog
gh release create v<version> --title "v<version>" --notes "<changelog>"
```

**Important**: Step 2 (`npm i --package-lock-only --workspaces=false`) is critical. Without it, the lockfile may be stale after PR merges, causing dependency drift on CI/deploy.

---

## Spec-Driven Development (SDD)

> **If you are an AI coding agent, you MUST FOLLOW THESE CONVENTIONS. This is PROJECT-SPECIFIC, so NO NEGOTIATION!**

### ONLY 3 Core Principles

- The spec is the SOURCE OF TRUTH for a feature, not the code
- Specs describe PROBLEM, PLAN, and PROGRESS
- Every feature MUST have a spec folder

---

### Spec Structure

All specs live in a `.weaverse/specs/` folder at the project root. Each feature gets its own subfolder inside `.weaverse/specs/`.

#### Folder Naming Pattern

```
{YYYY-MM-DD}--{kebab-case-title}
```

- `YYYY-MM-DD`: creation date (ISO format), fixed at the time the spec was created
- `title`: kebab-case feature name
- Separators: double dashes `--`

Examples:

- `2026-03-01--user-authentication`
- `2026-03-05--billing-integration`
- `2026-03-15--dark-mode-toggle`

#### Folder Structure

```
project-root/
├── .weaverse/
│   ├── README.md              📄 Explains this folder's purpose
│   └── specs/
│       ├── 2026-03-01--user-authentication/
│       │   ├── README.md          📋 Status, owner, original prompt
│       │   ├── plan.md            🗺️ Agent-generated implementation plan
│       │   └── work-logs.md       📝 Timeline & change history (optional)
│       │
│       ├── 2026-03-05--billing-integration/
│           └── ...
│
├── src/                        ← your codebase (untouched by this convention)
└── ...
```

---

### Files Inside Each Feature Folder

#### README.md (required)

This is the feature's identity card. Short, scannable, no fluff. Strongly intended for humans, but AI agents should read it as well.

MUST contain:

- **Status**: one of `draft`, `in-progress`, `completed`, `on-hold`, `deprecated`
- **Owner**: who is responsible for this feature
- **Created**: creation date (same as folder name)
- **Last Updated**: date of last modification
- **Original prompt/requirement**: the exact prompt or requirement that initiated this feature. This is the most important field in the entire spec. It preserves original intent. MUST NOT be edited or paraphrased.
- **Summary**: 2-3 sentences max describing what this feature does and why it exists

Template:

```markdown
# Feature: [Name]

| Field            | Value                                                    |
| ---------------- | -------------------------------------------------------- |
| **Status**       | status                                                   |
| **Owner**        | @developer                                               |
| **Created**      | YYYY-MM-DD                                               |
| **Last Updated** | YYYY-MM-DD                                               |

## Original Prompt

> [Paste the exact original prompt or requirement here. Do not edit or paraphrase.]

## Summary

[2-3 sentences. What this feature does and why it exists.]
```

#### plan.md (required)

Generated by the dev's preferred agent, framework, or workflow (Cursor, Claude Code, BMAD, spec-kit, superpowers...). The convention does NOT dictate format. Each dev uses whatever planning tool they prefer.

**IMPORTANT**: `plan.md` does NOT contain status, created date, or other metadata - those live in `README.md`.

The plan MUST meet these constraints:

- MUST be under 500 lines
- MUST include a section listing all files and folders this feature touches, so other agents know the scope

#### work-logs.md (optional)

A timeline of work done on this feature. Useful when:

- The feature spans multiple days or sessions
- Multiple devs contribute to the same feature
- You want to track what was tried, what failed, what changed

Append-only format:

```markdown
# Work Logs

## YYYY-MM-DD — @developer
- What was done
- Decisions made
- Blockers encountered

## YYYY-MM-DD — @other-developer
- Continued from previous session
- Updated plan to reflect new approach
```

---

### Rules

1. **New feature?** Create a spec folder following the convention above before writing any code.
2. **Existing feature?** Read the spec first. Update it if your changes affect the plan, status, or scope.

---

---

## Weaverse Component Development Guide

> Build Shopify Hydrogen storefronts with Weaverse visual page builder.
> Docs: https://docs.weaverse.io | GitHub: https://github.com/Weaverse/pilot

**This section covers the most common patterns inline.** For the full, always-up-to-date reference (including advanced features, migration guides, and copy-paste examples), see the [Weaverse Hydrogen Skills repo](https://github.com/Weaverse/skills):

```
references/01-project-structure.md     — Project structure & file anatomy
references/02-creating-components.md   — Component creation & registration
references/03-component-schema.md      — createSchema(), settings, childTypes, presets
references/04-input-settings.md        — All input types & configurations
references/05-data-fetching.md         — Loaders, Storefront API, caching
references/06-styling-theming.md       — Tailwind, theme settings, CVA, CSS variables
references/07-react-router-7.md        — React Router v7 conventions
references/08-hydrogen-fundamentals.md — Hydrogen framework essentials
references/09-deployment.md            — Oxygen, Docker, env vars
references/10-weaverse-api.md          — All hooks & WeaverseClient API
references/11-advanced-features.md     — Localization, data connectors, CSP
references/12-pilot-theme.md           — Pilot-specific patterns & conventions
references/13-migration-v5.md          — Remix → React Router v7 migration
```

> **Tip for agents:** If anything below is insufficient or outdated, fetch the relevant file directly from:
> `https://raw.githubusercontent.com/Weaverse/skills/main/references/<filename>`

### Component Anatomy

Every Weaverse section has up to 3 exports from `app/sections/<name>/index.tsx`:

```tsx
// 1. Default export — React component
function MySection(props: MySectionProps) { ... }
export default MySection;

// 2. Schema export — editor configuration
export let schema = createSchema({ ... });

// 3. Loader export (optional) — server-side data fetching
export let loader = async (args: ComponentLoaderArgs<DataType>) => { ... };
```

**Key rules:**
- **Spread `{...rest}`** on root element — required for Weaverse Studio interaction
- **Render `{children}`** if the component accepts child components
- **`type` must be unique**, use kebab-case (e.g., `hero-banner`)
- **React 19**: use `ref` prop directly — `forwardRef` is deprecated
- **Register** every new section in `app/weaverse/components.ts` using `import * as MySection from '~/sections/my-section'`

### Minimal Section Example

```tsx
import { createSchema, type HydrogenComponentProps } from '@weaverse/hydrogen';

interface BannerProps extends HydrogenComponentProps {
  heading: string;
  description: string;
}

function Banner({ heading, description, children, ...rest }: BannerProps) {
  return (
    <section {...rest} className="py-16 px-4 text-center">
      <h2 className="text-3xl font-bold">{heading}</h2>
      <p className="mt-4 text-lg text-gray-600">{description}</p>
      {children}
    </section>
  );
}
export default Banner;

export let schema = createSchema({
  type: 'banner',
  title: 'Banner',
  settings: [
    {
      group: 'Content',
      inputs: [
        { type: 'text', name: 'heading', label: 'Heading', defaultValue: 'Hello World' },
        { type: 'textarea', name: 'description', label: 'Description' },
      ],
    },
  ],
  presets: { heading: 'Hello World' },
});
```

### Component Registration (`app/weaverse/components.ts`)

```tsx
// MUST use namespace imports — NOT default imports
import * as MySection from '~/sections/my-section';
import * as HeroBanner from '~/sections/hero-banner';

export let components: HydrogenComponent[] = [
  HeroBanner,
  MySection,
  // ...
];
```

### Schema Quick Reference

```tsx
export let schema = createSchema({
  type: 'my-component',        // Unique kebab-case ID
  title: 'My Component',       // Studio display name
  limit: 1,                    // Max instances per page (optional)
  enabledOn: {                 // Restrict to page types (optional)
    pages: ['PRODUCT', 'COLLECTION'],
    // Page types: INDEX | PRODUCT | ALL_PRODUCTS | COLLECTION |
    //             COLLECTION_LIST | PAGE | BLOG | ARTICLE | CUSTOM
  },
  settings: [
    {
      group: 'Content',
      inputs: [
        { type: 'text',         name: 'heading',     label: 'Heading', defaultValue: 'Title' },
        { type: 'richtext',     name: 'body',        label: 'Body' },
        { type: 'image',        name: 'image',       label: 'Image' },
        { type: 'switch',       name: 'fullWidth',   label: 'Full Width', defaultValue: false },
        { type: 'range',        name: 'gap',         label: 'Gap',
          configs: { min: 0, max: 40, step: 4, unit: 'px' }, defaultValue: 16 },
        { type: 'select',       name: 'layout',      label: 'Layout',
          configs: { options: [{ value: 'grid', label: 'Grid' }, { value: 'list', label: 'List' }] },
          defaultValue: 'grid' },
        { type: 'color',        name: 'bgColor',     label: 'Background' },
      ],
    },
  ],
  childTypes: ['product-card'],  // Allowed child component types
  presets: {
    heading: 'Title',
    children: [{ type: 'product-card' }, { type: 'product-card' }],
  },
});
```

**Note:** `inspector` is deprecated — always use `settings`.

### Input Types

| Type | Returns | Use For |
|------|---------|---------|
| `text` | `string` | Single-line text |
| `textarea` | `string` | Multi-line text |
| `richtext` | `string` (HTML) | Rich text |
| `url` | `string` | URLs/links |
| `image` | `WeaverseImage` | Image picker |
| `video` | `WeaverseVideo` | Video picker |
| `color` | `string` (#hex) | Color picker |
| `range` | `number` | Slider |
| `switch` | `boolean` | Toggle |
| `select` | `string` | Dropdown |
| `toggle-group` | `string` | Button group |
| `datepicker` | `number` (timestamp) | Date/time |
| `product` | Shopify product | Product picker |
| `collection` | Shopify collection | Collection picker |
| `product-list` | `product[]` | Multi-product picker |
| `collection-list` | `collection[]` | Multi-collection picker |
| `metaobject` | Shopify metaobject | Metaobject picker |

### Data Fetching with Loaders

```tsx
import type { ComponentLoaderArgs, HydrogenComponentProps } from '@weaverse/hydrogen';

type MyData = { collectionHandle: string };

export let loader = async ({ weaverse, data }: ComponentLoaderArgs<MyData>) => {
  let { storefront } = weaverse;
  return await storefront.query(COLLECTION_QUERY, {
    variables: { handle: data.collectionHandle },
  });
};

// Derive props type from loader return
type Props = HydrogenComponentProps<Awaited<ReturnType<typeof loader>>> & MyData;

function MyComponent({ loaderData, collectionHandle, ...rest }: Props) {
  let collection = loaderData?.collection;
  return <section {...rest}>{collection?.title}</section>;
}
export default MyComponent;
```

**Key patterns:**
- `weaverse.storefront.query()` — Shopify Storefront API
- `weaverse.fetchWithCache(url, options)` — External APIs with caching
- Add `shouldRevalidate: true` on schema inputs that affect the loader

### Weaverse API Reference

| API | Purpose |
|-----|---------|
| `createSchema()` | Define component schema |
| `WeaverseClient` | Server-side client (initialized in `server.ts`) |
| `weaverse.loadPage({ type, handle })` | Load page data in route loaders |
| `weaverse.loadThemeSettings()` | Load global theme settings |
| `weaverse.fetchWithCache(url)` | Cached external API fetching |
| `withWeaverse(App)` | HOC wrapping root `App` in `root.tsx` |
| `useThemeSettings()` | Access global theme settings in components |
| `useWeaverse()` | Access global Weaverse instance |
| `useItemInstance()` | Access a specific component instance |
| `useParentInstance()` | Access parent component instance |

### Theme Settings Pattern

```tsx
// app/components/GlobalStyle.tsx
import { useThemeSettings } from '@weaverse/hydrogen';

export function GlobalStyle() {
  let settings = useThemeSettings();
  if (!settings) return null;
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      :root {
        --color-primary: ${settings.colorPrimary};
        --body-base-size: ${settings.bodyBaseSize}px;
      }
    `}} />
  );
}
```

### Route Loader Pattern

```tsx
export async function loader({ context, params }: LoaderFunctionArgs) {
  const { storefront, weaverse } = context;

  const [shopifyData, weaverseData] = await Promise.all([
    storefront.query(PRODUCT_QUERY, { variables: { handle: params.productHandle } }),
    weaverse.loadPage({ type: 'PRODUCT', handle: params.productHandle }),
  ]);

  if (!shopifyData.product) throw new Response('Not found', { status: 404 });

  return data({ shopifyData, weaverseData });
}
```

### Common Mistakes to Avoid

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| `import MySection from '~/sections/...'` | `import * as MySection from '~/sections/...'` |
| Using `inspector` in schema | Use `settings` |
| Missing `{...rest}` on root element | Always spread rest props |
| Skipping `{children}` for parent components | Render children |
| `forwardRef` in React 19 | Use `ref` prop directly |
| Import from `'react-router-dom'` | Import from `'react-router'` |
| Forgetting to register in `components.ts` | Always register new sections |
| Multiple `Promise` calls in loader | Use `Promise.all([...])` |
