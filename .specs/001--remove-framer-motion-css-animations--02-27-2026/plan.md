# Remove Framer Motion, Replace with CSS Animations

> **Created**: Feb 27, 2026
> **Updated**: Feb 27, 2026
> **Status**: Phase 1 Complete, Phase 2 In Progress

---

## Original Prompt

Remove the `framer-motion` dependency and replace all scroll-triggered animations with pure CSS keyframes + IntersectionObserver. Use Tailwind CSS custom `@keyframes` (no external animation library). Replace `data-motion` attributes with CSS classes. Use CSS custom properties for stagger delays.

---

## Phase 1 (COMPLETED): Remove framer-motion, use CSS + IntersectionObserver hook

Replaced `framer-motion` with `useAnimation` hook using IntersectionObserver + CSS `@keyframes`. Used `animate-*` CSS classes on elements within a hook-managed scope. ✅ Done and committed.

---

## Phase 2 (CURRENT): Refactor to shared `<ScrollReveal>` wrapper component

### Motivation

The Phase 1 approach has coupling issues:
- `useAnimation` hook creates a scope and queries children for `animate-*` classes — parent controls animation of unaware children
- `animate-*` classes are baked into component classNames — mixed concerns (styling vs animation intent)
- Adding/removing animation requires editing className strings in each component
- No per-element control over duration or delay

### New Approach

Replace the hook + class system with a `<ScrollReveal>` wrapper component that:
1. Uses a **shared singleton IntersectionObserver** (1 observer for all elements, not 1 per component)
2. Takes `animation`, `duration`, `delay`, and `className` as props
3. Reads `revealElementsOnScroll` from theme settings — if disabled, renders children directly (no wrapper overhead)
4. Uses **CSS transitions** (not `@keyframes`) for simpler state management — just toggle classes on intersection

---

## Requirements

### Functional Requirements
- [x] FR1: ~~Elements animate in when scrolled into view~~ (Phase 1)
- [x] FR2: ~~Three animation types: fade-up, zoom-in, slide-in~~ (Phase 1)
- [x] FR7: ~~framer-motion removed~~ (Phase 1)
- [ ] FR3: `<ScrollReveal>` component wraps any element and animates it on scroll
- [ ] FR4: Props: `animation` (type), `duration` (seconds), `delay` (ms), `className`, `as` (element type)
- [ ] FR5: Shared singleton IntersectionObserver — one observer for entire app
- [ ] FR6: `revealElementsOnScroll` theme setting toggles animation — when off, renders children with no wrapper
- [ ] FR7: Remove `useAnimation` hook, `animated-scope` CSS system, and all `animate-*` classes from components

### Non-Functional Requirements
- [ ] NFR1: Zero additional dependencies
- [ ] NFR2: Single observer instance reduces memory usage vs N observers
- [ ] NFR3: No flash of invisible content when animations disabled

### Out of Scope
- Staggered sibling animations (no longer needed — each `<ScrollReveal>` controls its own delay)
- The `animated-scope` parent class pattern (replaced by per-element control)

---

## Technical Approach

### ScrollReveal Component API

```tsx
<ScrollReveal animation="fade-up" duration={0.5} delay={100}>
  <Heading>Title</Heading>
</ScrollReveal>

// With custom element type
<ScrollReveal as="section" animation="slide-in" className="my-class">
  <Content />
</ScrollReveal>

// When revealElementsOnScroll is false → renders children directly, no wrapper
```

### Shared Observer Pattern

```typescript
// Singleton — created once, shared across all ScrollReveal instances
let sharedObserver: IntersectionObserver | null = null;
let callbacks = new Map<Element, (isIntersecting: boolean) => void>();

function getSharedObserver(): IntersectionObserver { ... }
function observe(element: Element, callback): () => void { ... }
```

### How It Works

```
Mount: <ScrollReveal animation="fade-up">
  → Element starts with: opacity-0 translate-y-5 (via CSS transition classes)
  → Registers with shared observer

Intersect: Observer fires callback
  → State: isVisible = true
  → Element transitions to: opacity-100 translate-y-0
  → Unregisters from observer (one-shot)

Disabled: revealElementsOnScroll = false
  → Renders children directly, no wrapper div, no observer
```

### Animation Styles (CSS Transitions, not @keyframes)

Each animation type maps to before/after Tailwind classes:

| Animation | Before (hidden) | After (visible) |
|-----------|-----------------|-----------------|
| `fade-up` | `opacity-0 translate-y-5` | `opacity-100 translate-y-0` |
| `zoom-in` | `opacity-0 scale-80 translate-y-5` | `opacity-100 scale-100 translate-y-0` |
| `slide-in` | `opacity-0 translate-x-5` | `opacity-100 translate-x-0` |

Applied via `transition-all` + `will-change-transform` with `transitionDuration` and `transitionDelay` as inline styles.

---

## Implementation Structure

### Files to Create

| File | Purpose |
|------|---------|
| `app/components/scroll-reveal.tsx` | `<ScrollReveal>` wrapper component with shared observer |

### Files to Modify

| # | File | Changes |
|---|------|---------|
| 1 | `app/styles/app.css` | Remove all `@keyframes` (fade-up, zoom-in, slide-in) and `.animated-scope` / `.in-view` CSS rules added in Phase 1 |
| 2 | `app/components/button.tsx` | Remove `animate-fade-up` class logic, wrap with `<ScrollReveal>` at usage sites (or keep `animate` prop that wraps internally) |
| 3 | `app/components/heading.tsx` | Remove `animate-fade-up` from className merge, wrap with `<ScrollReveal>` at usage sites (or keep `animate` prop that wraps internally) |
| 4 | `app/components/subheading.tsx` | Remove `animate-fade-up` from className, wrap with `<ScrollReveal>` at usage sites (or keep `animate` prop that wraps internally) |
| 5 | `app/components/paragraph.tsx` | Remove `animate-fade-up` from className, wrap with `<ScrollReveal>` at usage sites (or keep `animate` prop that wraps internally) |
| 6 | `app/components/product/quantity.tsx` | Remove `animate-fade-up` class, wrap with `<ScrollReveal>` |
| 7 | `app/sections/main-product/variants.tsx` | Remove `animate-fade-up` class, wrap with `<ScrollReveal>` |
| 8 | `app/sections/countdown/timer.tsx` | Remove `animate-fade-up` class, wrap with `<ScrollReveal>` |
| 9 | `app/sections/newsletter/newsletter-form.tsx` | Remove `animate-fade-up` (2 elements), wrap with `<ScrollReveal>` |
| 10 | `app/sections/featured-collections/collection-items.tsx` | Remove `useAnimation` hook, remove `animate-slide-in` class, wrap items with `<ScrollReveal>` |
| 11 | `app/sections/image-with-text/image.tsx` | Remove `animate-slide-in` class, wrap with `<ScrollReveal>` |
| 12 | `app/sections/image-gallery/image.tsx` | Remove `animate-slide-in` class, wrap with `<ScrollReveal>` |
| 13 | `app/sections/promotion-grid/item.tsx` | Remove `animate-slide-in` class, wrap with `<ScrollReveal>` |
| 14 | `app/sections/testimonials/item.tsx` | Remove `animate-slide-in` class, wrap with `<ScrollReveal>` |
| 15 | `app/sections/columns-with-images/column.tsx` | Remove `animate-slide-in` class, wrap with `<ScrollReveal>` |
| 16 | `app/sections/hotspots/index.tsx` | Remove `animate-zoom-in` class, wrap with `<ScrollReveal>` |
| 17 | `app/sections/single-product/index.tsx` | Remove `useAnimation` hook, remove `animate-*` classes, wrap elements with `<ScrollReveal>` |
| 18 | `app/sections/slideshow/slide.tsx` | Remove `useAnimation` hook usage, wrap animated children with `<ScrollReveal>` |
| 19 | `app/sections/hero-video.tsx` | Remove `useAnimation` hook usage, wrap animated children with `<ScrollReveal>` |
| 20 | `app/sections/ali-reviews/review-list.tsx` | Remove `animate-slide-in` (2 elements), wrap with `<ScrollReveal>` |

### Files to Delete

| File | Reason |
|------|--------|
| `app/hooks/use-animation.ts` | Replaced by `<ScrollReveal>` component — no longer needed |

---

## Step-by-Step Instructions

### Step 1: Create `app/components/scroll-reveal.tsx`

Implement the `<ScrollReveal>` component with:
- Shared singleton `IntersectionObserver` (threshold: 0.1)
- `observe()` / cleanup utility functions
- Props: `as`, `animation`, `duration` (default 0.5), `delay` (default 0), `className`, `children`
- Reads `revealElementsOnScroll` from `useThemeSettings()`
- When disabled: render `children` directly without a wrapper

Animation class mappings:
- `fade-up`: hidden `opacity-0 translate-y-5` → visible `opacity-100 translate-y-0`
- `zoom-in`: hidden `opacity-0 scale-80 translate-y-5` → visible `opacity-100 scale-100 translate-y-0`
- `slide-in`: hidden `opacity-0 translate-x-5` → visible `opacity-100 translate-x-0`

### Step 2: Clean up `app/styles/app.css`

Remove all Phase 1 CSS added at the bottom:
- `@keyframes fade-up`, `zoom-in`, `slide-in`
- `.animated-scope` hiding rules
- `.in-view` trigger rules

### Step 3: Delete `app/hooks/use-animation.ts`

No longer needed — `<ScrollReveal>` handles everything.

### Step 4: Update shared components (button, heading, subheading, paragraph)

These components currently have animation built into their className logic. Two options:

**Option A (Recommended)**: Keep `animate` prop, but wrap with `<ScrollReveal>` internally
```tsx
// heading.tsx
if (animate) {
  return (
    <ScrollReveal animation="fade-up">
      <Tag ref={ref} {...rest} className={cn(...)}>
        {content}
      </Tag>
    </ScrollReveal>
  );
}
return <Tag ref={ref} {...rest} className={cn(...)}>{content}</Tag>;
```

**Option B**: Remove `animate` prop entirely, let parent sections wrap with `<ScrollReveal>`
- Cleaner separation but requires more changes at usage sites

### Step 5: Update section components

For each section, remove `animate-*` classes and wrap with `<ScrollReveal>`:

```tsx
// Before
<div className="animate-slide-in group relative">

// After
<ScrollReveal animation="slide-in">
  <div className="group relative">
</ScrollReveal>
```

For sections that used `useAnimation` hook (collection-items, slideshow, hero-video, single-product):
- Remove `useAnimation` import and `const [scope] = useAnimation(ref)`
- Remove the `ref={scope}` from the parent wrapper
- Wrap individual animated children with `<ScrollReveal>`

### Step 6: Verify

1. Run `npm run typecheck` — no type errors
2. Run `npm run biome:fix` — no lint errors
3. Run `npm run build` — production build succeeds
4. Verify no remaining references: `grep -r "animate-fade-up\|animate-slide-in\|animate-zoom-in\|useAnimation\|animated-scope" app/`

---

## Execution Order

| Phase | Files | Parallel? |
|-------|-------|-----------|
| 1. Create component | `app/components/scroll-reveal.tsx` | - |
| 2. Clean CSS | `app/styles/app.css` | - |
| 3. Delete hook | `app/hooks/use-animation.ts` | - |
| 4. Update shared components | button, heading, subheading, paragraph, quantity | Yes |
| 5a. Update sections (fade-up) | variants, timer, newsletter-form | Yes |
| 5b. Update sections (slide-in) | collection-items, image-with-text, image-gallery, promotion-grid, testimonials, columns-with-images, ali-reviews, single-product | Yes |
| 5c. Update sections (zoom-in) | hotspots | Yes |
| 5d. Update hook-dependent sections | slideshow, hero-video | Yes |
| 6. Verify | typecheck, biome, build, grep | Sequential |

**Total files created**: 1
**Total files modified**: 20
**Total files deleted**: 1
**Estimated effort**: Medium — component creation + mechanical wrapping across 20 files
