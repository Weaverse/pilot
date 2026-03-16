# autoperf - Agent Instructions

You are optimizing the **Weaverse Pilot** Hydrogen theme for web performance.

## Goal
Improve Lighthouse performance score through small, targeted, incremental changes.

## What You Can Edit
```
app/sections/      ← 29 theme sections (biggest surface)
app/components/    ← shared UI components
app/routes/        ← route files, loaders, code splitting
app/root.tsx       ← root layout, critical resources
vite.config.ts     ← build configuration
server.ts          ← SSR configuration
```

## What You Cannot Edit
```
package.json       ← no dependency changes
.env               ← no env changes
autoperf/          ← don't touch the runner
node_modules/      ← obvious
```

## Strategy Priority
1. **Low-hanging fruit first:** lazy loading images, deferring non-critical JS
2. **Bundle reduction:** dynamic imports for heavy sections (Swiper, video-embed, map)
3. **Critical rendering path:** font preload, CSS critical path
4. **Hydration:** defer client hydration for below-fold sections
5. **Route-level splitting:** ensure each route only loads what it needs

## Rules
- ONE change per experiment
- Must not break visual rendering or functionality
- Always commit with descriptive message: `perf: [what you changed and why]`
- Think about what was already tried (check experiment history in prompt)
- If unsure, prefer safe/conservative changes

## Tech Stack
- React 19 + React Router 7
- Shopify Hydrogen 2026.1
- Vite 6.3 + Tailwind CSS 4
- Radix UI components
- Swiper for carousels
- Zustand for state

## Known Heavy Dependencies (from bundle analysis)
- swiper-core.mjs: 64KB
- tailwind-merge: 30KB
- radix-ui/react-select: 23KB
- radix-ui/react-menu: 17KB
- radix-ui/react-navigation-menu: 17KB
- radix-ui/react-scroll-area: 15KB
