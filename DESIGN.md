# Pilot Design Guide

How Pilot looks, why it looks that way, and what not to do. Written for both
human contributors and agents making visual changes.

Companion documents:

- `AGENTS.md` — repository architecture and Weaverse component patterns
- `.agents/weaverse.md` — manifest generation, sensitivity, safe composition

## Principles

**The merchant owns the design.** Almost every visual value is a theme setting,
not a constant. Colors, radii, type scale, and section padding are merchant
controls. Hardcoding a value silently removes a merchant's ability to change it.

**Tokens over literals.** Ship a token that reads from theme settings rather
than a raw hex or pixel value.

**Sections compose, they do not assume.** A section may be placed on many page
types in any order. Never depend on what sits above or below you.

## Brand tokens

All tokens live in `app/styles/theme.css` and are driven by theme settings in
`app/weaverse/settings/`. Reference them through Tailwind utilities or
`var(--token)`; never re-declare them in a component.

### Color

Defined in `app/weaverse/settings/general.ts`, surfaced as CSS variables.

| Token | Setting | Default | Use |
| --- | --- | --- | --- |
| `--color-background` | `colorBackground` | `#ffffff` | Page and section background |
| `--color-text` | `colorText` | `#0F0F0F` | Primary body and heading text |
| `--color-text-subtle` | `colorTextSubtle` | `#88847F` | Secondary and supporting text |
| `--color-text-inverse` | `colorTextInverse` | `#ffffff` | Text on dark or image backgrounds |
| `--color-line` | `colorLine` | `#3B352C` | Borders and dividers |
| `--color-line-subtle` | `colorLineSubtle` | `#A19B91` | Low-emphasis separators |

Product-specific colors (sale, compare-at, sold-out, badges) are defined in the
same file. Use those rather than inventing per-section colors.

### Typography

Two families, set in `app/styles/theme.css`:

- `--font-sans`: `Cabin Variable` — body copy, UI, controls
- `--font-serif`: `Newsreader Variable` — all headings (`h1`–`h6`)

Headings receive `font-serif` globally in `app/styles/app.css`. Do not override
the family per section.

Sizes derive from merchant-controlled base sizes rather than fixed pixels:

- `h1BaseSize` (default `60px`) drives the heading scale
- `--body-base-size` drives `--text-xs` through `--text-5xl`
- `headingBaseSpacing`, `bodyBaseSpacing`, and `headingBaseLineHeight` are
  merchant-tunable

Use `text-sm`, `text-lg`, `text-2xl`, and similar. Avoid arbitrary values like
`text-[17px]`, which escape the scale.

### Radius

One merchant control, `radiusBase` (default `12px`), exposed as `--radius` and
scaled:

```
--radius-xs   = radius x 0.5      --radius-lg   = radius x 1.5
--radius-sm   = radius x 0.75     --radius-xl   = radius x 2
--radius-md   = radius            --radius-2xl  = radius x 3
```

Use `rounded-md`, `rounded-lg`, and so on. Never hardcode `rounded-[12px]`;
setting `radiusBase` to `0` must produce square corners everywhere.

### Layout and spacing

- `pageWidth` (default `1440px`, range `1000`–`1600`) is exposed as
  `--page-width`. Fixed-width sections use `max-w-(--page-width)`.
- Nav heights are separately controlled for mobile, tablet, and desktop.
- Section padding uses the `Section` component's `verticalPadding` variants
  (`none`, `small`, `medium`, `large`). Do not hand-roll `py-*` on a section
  root.
- Breakpoints: `sm 32em`, `md 48em`, `lg 64em`, `xl 80em`, `2xl 96em`.

## Accessibility

Non-negotiable requirements:

- **Semantic elements.** Use `button` for actions and `a` for navigation. A
  clickable `div` is not acceptable.
- **Accessible names.** Every icon-only control needs an `aria-label`. Icons
  themselves are decorative and must not announce.
- **Keyboard support.** Every interactive element must be reachable and operable
  by keyboard, with a visible focus indicator. Do not remove focus outlines
  without an equivalent replacement.
- **Heading order.** Sections expose an `as` control (`h1`–`h6`) so merchants
  keep a sane outline. Never hardcode a heading level for visual size; set the
  level semantically and style separately.
- **Contrast.** Text must meet WCAG AA (4.5:1 body, 3:1 large text). When
  placing text over imagery, use the overlay controls rather than hoping the
  image is dark enough.
- **Motion.** Scroll reveals and transitions are opt-in through theme settings,
  so merchants can disable them globally. Pilot does not yet honor
  `prefers-reduced-motion` at the CSS level; new animation work should add that
  media query rather than extend the gap.
- **Images.** Meaningful images need real alt text; decorative images need
  `alt=""`.

Radix UI primitives are used for dialogs, dropdowns, and accordions precisely
because they handle focus trapping and ARIA correctly. Prefer them over custom
implementations.

## Component rules

**Root element.** Every section spreads `{...rest}` on its root and renders
`{children}` when it accepts children. Omitting either breaks Studio selection.

```tsx
export default function MySection(props: MySectionProps & SectionProps) {
  const { children, ...rest } = props;
  return <Section {...rest}>{children}</Section>;
}
```

**Schema.** Export `schema` via `createSchema()` and register the component
exactly once in `app/weaverse/components.ts`.

**Settings shape.** Use `settings`, never the deprecated `inspector`. Group
related inputs and give every input a clear `label`.

**Defaults must be static.** A schema default is serialized into the component
manifest. A computed default such as `Date.now() + ONE_DAY` makes the manifest
non-deterministic and breaks CI. Compute relative values at runtime instead —
see `app/sections/countdown/timer.tsx`.

**Credentials are marked.** Any setting holding a token or key must declare
`sensitive: true` and must not declare a `defaultValue`.

## Prohibited patterns

| Pattern | Why | Instead |
| --- | --- | --- |
| Hardcoded hex colors | Ignores merchant palette | `text-body`, `border-line`, `var(--color-*)` |
| `rounded-[12px]` | Breaks the radius control | `rounded-md` |
| Fixed `text-[17px]` | Escapes the type scale | `text-base`, `text-lg` |
| `framer-motion` | Deliberately removed for bundle size | CSS animations in `app/styles/keyframes.css` |
| `forwardRef` | React 19 passes `ref` as a prop | `ref` prop directly |
| Import from `react-router-dom` | Wrong package for RR7 | `react-router` |
| Clickable `div` | Not keyboard accessible | `button` or `a` |
| Removing focus outlines | Strands keyboard users | Style focus, never delete it |
| Heading level chosen for size | Destroys document outline | Semantic level, visual styling |
| Sequential `await` in a loader | Serial round trips | `Promise.all([...])` |
| Missing `{...rest}` | Breaks Studio selection | Always spread |
| Computed schema defaults | Non-deterministic manifest | Runtime fallback |

## Examples

### Section honoring tokens and merchant controls

```tsx
import { createSchema } from "@weaverse/hydrogen";
import type { SectionProps } from "~/components/section";
import { layoutInputs, Section } from "~/components/section";

interface NoticeProps extends SectionProps {
  message: string;
}

export default function Notice(props: NoticeProps) {
  const { message, children, ...rest } = props;
  return (
    <Section {...rest}>
      <p className="rounded-md border border-line-subtle px-4 py-3 text-body">
        {message}
      </p>
      {children}
    </Section>
  );
}

export const schema = createSchema({
  type: "notice",
  title: "Notice",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "message",
          label: "Message",
          defaultValue: "Free shipping on orders over $50.",
        },
      ],
    },
    { group: "Layout", inputs: layoutInputs },
  ],
});
```

Colors, radius, and padding all follow merchant settings. Nothing is hardcoded.

### Accessible icon-only control

```tsx
<button type="button" aria-label="Close dialog" onClick={onClose}>
  <XIcon aria-hidden="true" />
</button>
```

The control is named for assistive technology; the icon is silent.

### Integration setting holding a credential

```tsx
{
  type: "text",
  name: "aliReviewsApiKey",
  label: "Ali Reviews API key",
  sensitive: true,
  placeholder: "Your Ali Reviews API key",
}
```

`sensitive: true` keeps the value out of the generated manifest. No
`defaultValue` is permitted on a sensitive input.
