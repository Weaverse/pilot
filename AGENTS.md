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

## AI Skills (Extended Reference)

For deep-dive Weaverse + Hydrogen patterns, install the Weaverse AI Skills:

```bash
bash install-ai-skills.sh
```

This clones [github.com/Weaverse/skills](https://github.com/Weaverse/skills) into `.weaverse-skills/` (gitignored).

**Key reference docs after install:**

| File | Contents |
|------|----------|
| `.weaverse-skills/SKILL.md` | Core patterns cheat sheet |
| `.weaverse-skills/references/02-creating-components.md` | Component creation guide |
| `.weaverse-skills/references/03-component-schema.md` | All schema input types |
| `.weaverse-skills/references/05-data-fetching.md` | Component loaders & caching |
| `.weaverse-skills/references/06-styling-theming.md` | Theme schema & CSS variables |
| `.weaverse-skills/references/10-weaverse-api.md` | Full Weaverse API reference |
| `.weaverse-skills/references/12-pilot-theme.md` | Pilot-specific patterns |
