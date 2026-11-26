# Premium motion and sections

Issue: [#242](https://github.com/Weaverse/pilot/issues/242)

## Outcome

Pilot looks and moves like a premium theme out of the box: motion has a deliberate, configurable character, the homepage has visual rhythm, and merchants get sections that create "wow" moments without custom code.

## Scope & contract

Three parts, shipped in this order: C, then B in small PRs. A is demo content and needs no theme code.

**A. Demo content (Studio only)**
- Fill or unlink the empty `winter-sale` page; rebuild `the-care-program` with sections.
- Rewrite testimonials and newsletter copy in Pilot's own voice (no Weaverse marketing copy); blog content matches the brand.
- Replace the `VENDORX` vendor, seed or hide product reviews, widen boxed sections and alternate section backgrounds.

**C. Motion system**
- `prefers-reduced-motion: reduce` disables every scroll reveal: content renders in place with no transform, opacity or clip animation.
- New theme setting `motionStyle` under "Animations and effects": `subtle` (default, today's reveal with a smoother easing curve) or `expressive` (longer travel and duration, images reveal with a clip-path wipe and settle from a slight zoom). `revealElementsOnScroll` stays the master switch.
- Reveal timing comes from CSS variables (`--reveal-distance`, `--reveal-duration`, `--reveal-ease`) set once on `:root`, not per component.
- Sibling reveal items stagger automatically (CSS `nth-child`, capped), unless a component passes an explicit `delay`.
- New header setting `hideHeaderOnScroll`: the sticky header slides away while scrolling down and returns on scroll up. Default off, so existing stores keep their header.
- Non-goals: JS animation libraries (GSAP, Lenis, Framer Motion), per-section motion overrides.

**B. New sections** (one PR each, prioritized)
1. Scroll-zoom media: an inset image or video grows to full-bleed as it scrolls through the viewport.
2. Sticky scrollytelling: a sticky media column swaps with each text step.
3. Text marquee: large statement text or logos scrolling continuously.
4. Horizontal lookbook: vertical scroll drives a horizontal gallery, with optional hotspots.
5. Shoppable video: vertical videos in a row, each linked to a product.
6. Bento promo grid, tabbed featured products, animated stats.
7. Product page: complete the look, recently viewed.

Every new section uses CSS scroll-driven animations (`animation-timeline`) where possible, falls back to a static layout where unsupported, respects reduced motion, and works on a fresh install: presets never hardcode product or collection handles.

## Acceptance

- With reduced motion on, no element animates on scroll and nothing stays hidden.
- `subtle` looks like today's reveal; `expressive` visibly changes image reveals and timing on the homepage, PDP and collection list.
- Grid items (promotion grid, columns, testimonials, featured collections, gallery) reveal one after another.
- With `hideHeaderOnScroll` on, the header hides after scrolling down past the header and returns on any upward scroll; mega menus and drawers still open.
- Each B section renders in Studio from its preset, on desktop and mobile, with and without motion.

## Approach

- `app/styles/app.css` gains a reveal layer: `[data-reveal]` hidden states per animation type, the stagger rules, and the reduced-motion override.
- `ScrollReveal` and `Section` mark their hidden state with `data-reveal` instead of hard-coded Tailwind transforms, so one CSS layer owns every reveal.
- `GlobalStyle` writes the reveal variables from `motionStyle`.
- `Header` tracks scroll direction from `useWindowScroll` and translates itself up when `hideHeaderOnScroll` is on.
- B sections live in `app/sections/<name>/`, are registered in `app/weaverse/components.ts`, and the component manifest is regenerated.

## Verification

- `npm run typecheck`, `npm run check`, `npm run weaverse:manifest:check`, `npm run build`.
- Manual: homepage, collection list and PDP with each `motionStyle`, with reduced motion emulated, and with `hideHeaderOnScroll`, on desktop and mobile.
