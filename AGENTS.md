# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository.

## Project Overview

Personal blog and portfolio for **leohuynh.dev**, rebuilt as **v4** on **Astro 6**
(was Next.js + Contentlayer — fully migrated, no Next.js code remains).

- **Framework**: Astro 6 (SSR via the Vercel adapter), React 19 islands
- **Styling**: Tailwind CSS v4 (through `@tailwindcss/vite`, not a config file)
- **Content**: MDX via `@astrojs/mdx` + Astro content collections (`astro:content`)
- **Code blocks**: `astro-expressive-code` (owns rendering; runs before MDX)
- **Database**: Supabase PostgreSQL, accessed with the raw `postgres` client
  (no ORM — Drizzle/Contentlayer are gone)
- **Deploy**: Vercel (`@astrojs/vercel`), config in `vercel.json`
- **Package manager**: **Bun** (`bun.lock` is the tracked lockfile)

## Commands

Use **bun**. Do NOT introduce `pnpm`/`npm` lockfiles (only `bun.lock` is tracked).

```bash
bun install            # install deps
bun dev                # dev server on http://localhost:4321
bun run build          # production build
bun run preview        # preview the build (no Vercel Functions — see Stats note)
bun run check          # astro check (also the typecheck script)
bun run test           # run the Bun test suite
```

Lint/format with Biome (config in `biome.json`; not a project dep — run via bunx):

```bash
bunx @biomejs/biome check --write .
```

Biome style: 2-space indent, single quotes (JS/TS), double quotes (JSX attrs),
80-col line width, LF, semicolons as needed, import organization on.

## Directory Layout

```
data/                     # MDX content — the single source of truth
  blog/                   #   blog posts  -> /blog/<slug>   (slug = filename)
  snippets/               #   snippets     -> /snippets/<slug>
  authors/                #   author data
src/
  content.config.ts       # collection schemas (mirror legacy frontmatter 1:1)
  pages/                   # routes; pages/api/* are endpoints
  layouts/                # .astro layouts
  components/             # .astro + React; mdx/, studio/, widgets/, icons/
  lib/                    # runtime helpers (runtime.ts, stats.ts, github.ts, …)
  plugins/               # remark/rehype plugins
  styles/  types/
public/                  # static assets -> /static/...
json/                    # generated/static JSON (e.g. tag data)
```

Path alias: **`~/*` → `src/*`** (e.g. `import { SITE } from '~/lib/site'`).

## Generated JSON snapshots

Some UI data is checked in as generated JSON so page render does not depend on
live third-party APIs. When the source data changes, refresh the snapshot and
commit the generated JSON with the code change:

```bash
bun run dotfiles:refresh  # refresh json/dotfiles-tree.json from hta218/dotfiles
bun run heatmap:refresh   # refresh json/heatmap-map.json from GeoJSON + places
```

- `json/dotfiles-tree.json` powers the DOTFILES sidebar tree. Individual
  `/dotfiles/*` file content still fetches GitHub on demand.
- `json/heatmap-map.json` powers the interactive travel map geometry.

## Content

- Posts/snippets are MDX in `data/` and loaded by collections via `glob({ base: './data/... })`.
  Content is NOT duplicated into `src/content/` — `data/` stays the source of truth.
- **Slug = filename**, so URLs map 1:1 to the legacy site. Don't rename files casually.
- Frontmatter schema lives in `src/content.config.ts`. Keep it in sync with existing
  frontmatter; blog requires `title`, snippets require `heading`/`title`/`icon`.

## Environment Variables (READ THIS — Astro ≠ Next.js)

**Astro/Vite loads `.env*` files into `import.meta.env`, NOT `process.env`.**
`process.env` only holds the real shell/runtime env (e.g. vars Vercel injects at
build/runtime). This bites server code that worked on Next.js.

Rules:

1. **Vars defined in `.env`** (DATABASE_URL, API tokens, …): read them so both
   `astro dev` (local) and Vercel Functions (prod) work. Prefer the shared helper:

   - In `src/lib/runtime.ts` there is an `env(name)` helper doing
     `import.meta.env[name] ?? process.env[name]` (with trim). Use it for
     integrations (Spotify, GitHub, Umami).
   - Standalone Vercel Functions that can't import that helper (e.g.
     `src/pages/api/stats.ts`) read `import.meta.env.FOO ?? process.env.FOO` directly.

2. **Vercel system vars** (`VERCEL_GIT_COMMIT_SHA`, `VERCEL_GIT_COMMIT_AUTHOR_DATE`, …):
   read `process.env` directly — they are never in `.env`. Provide a local fallback
   (e.g. shelling out to `git`), see `src/components/studio/StudioShell.astro`.

3. **Client exposure**: only vars prefixed **`PUBLIC_`** reach the browser bundle.
   Anything without the prefix stays server-only — safe to read in API routes and
   `.astro` frontmatter. Never prefix a secret with `PUBLIC_`.

Pull env from Vercel locally:

```bash
vercel link            # once, links to the Vercel project
vercel env pull .env   # writes development env into .env (gitignored)
```

## Database / Stats

- `src/pages/api/stats.ts` is a Vercel Function for views + reactions, backed by the
  Supabase `stats` table via the `postgres` client. It needs `DATABASE_URL`.
- `bun run preview` (plain `astro preview`) does NOT serve Vercel Functions, so
  `/api/stats` is absent there; client code in `src/lib/stats.ts` degrades gracefully
  (reads → `null`, writes → `false`) instead of throwing.
- There are no migrations in this repo — the schema lives in Supabase.

## Deploy Notes (vercel.json)

- 301 redirects and rewrites are defined in both `vercel.json` and Astro config
  (`redirects`) — keep canonical URLs intact when touching routes.
- `/stats/*` is rewritten to the self-hosted Umami analytics host.
- Strict CSP + security headers are set in `vercel.json`; update the CSP allowlist
  when adding a new third-party script/frame/origin.

## Coding Conventions

Follow `biome.json` and match surrounding code. In addition:

- `const` for module-level constants (`ALL_CAPS` for true constants); `let` otherwise.
- Function declarations (`function foo()`) over arrow consts for top-level functions.
- Named exports only (Astro route/React component default exports where required are fine).
- No `useMemo`/`useCallback` — React 19 compiler handles memoization.
- File names: kebab-case (`product-card.tsx`); components PascalCase; functions camelCase.
- Tailwind for styling; use a `cn()` helper for conditional classes, not string templates.

## Spec-Driven Development

Specs live under `.docs/specs/{YYYY-MM-DD}--{kebab-title}/`, each with a
`README.md` (status, owner, original prompt) and `plan.md`. The v4 rebuild and
legacy-deployments specs are tracked there. Read the relevant spec before
changing a feature it covers.

## Don't

- Don't reintroduce Next.js / Contentlayer / Drizzle patterns.
- Don't create `pnpm`/`npm` lockfiles — this repo uses Bun.
- Don't read `process.env` for `.env`-defined vars in server code without the
  `import.meta.env` fallback (see Environment Variables).
- Don't commit `.env`, secrets, or `dist/`.
