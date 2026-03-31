# Plan: Global Border Radius System

## Approach

Single `radiusBase` setting in Weaverse theme config, injected as `--radius` CSS variable on `:root` via `GlobalStyle`. All components use `rounded-(--radius)` instead of hardcoded `rounded-none` / `rounded-sm` / etc.

No component-specific overrides for now — one base value controls everything. Component-level overrides (product cards, badges, sections) that already exist will **fall back** to the global value when their own setting is `0`.

**Why single value?** The issue asks for "a global config for corner radius that applies consistently across all components." Component overrides can be added later if needed.

## Files Touched

### Create

| File | Purpose |
|------|---------|
| `app/weaverse/settings/border-radius.ts` | New settings group with `radiusBase` range input |

### Modify

| File | Changes |
|------|---------|
| `app/weaverse/schema.server.ts` | Import and add `borderRadiusSettings` to the settings array |
| `app/weaverse/style.tsx` | Extract `radiusBase` from settings, inject `--radius` CSS variable |
| `app/components/button.tsx` | `rounded-none` → `rounded-(--radius)` in cva base classes |
| `app/styles/app.css` | `input, textarea` → `rounded-(--radius)` instead of `rounded-none`; wire up `--shop-pay-button-border-radius` and `--option-swatch-radius` to `var(--radius)` |
| `app/components/product-card/index.tsx` | Fall back `--pcard-radius` to `var(--radius)` when `pcardBorderRadius` is 0 |
| `app/components/product/badges.tsx` | Fall back `badgeBorderRadius` to `var(--radius)` when 0 |
| `app/components/section.tsx` | Fall back `--section-radius` to `var(--radius)` when `borderRadius` is 0 |

## Implementation Steps

### Step 1: Create `app/weaverse/settings/border-radius.ts`

```ts
import type { InspectorGroup } from "@weaverse/hydrogen";

export const borderRadiusSettings: InspectorGroup = {
  group: "Border radius",
  inputs: [
    {
      type: "range",
      name: "radiusBase",
      label: "Base radius",
      configs: {
        min: 0,
        max: 40,
        step: 2,
        unit: "px",
      },
      defaultValue: 0,
      helpText: "Global border radius applied to buttons, inputs, cards, modals, and badges. Set to 0 for square corners.",
    },
  ],
};
```

### Step 2: Register in `schema.server.ts`

Import `borderRadiusSettings` and add it to the `settings` array after `typographySettings` (logical placement — layout, colors, typography, then border radius).

### Step 3: Inject CSS variable in `style.tsx`

Extract `radiusBase` from `useThemeSettings()`, add to the `:root` CSS block:
```css
--radius: ${radiusBase || 0}px;
```

### Step 4: Update `button.tsx`

In the `cva` base array, replace `rounded-none` with `rounded-(--radius)`.

### Step 5: Update `app.css`

- `input, textarea` rule: `rounded-none` → `rounded-(--radius)`
- `:root` tokens: `--shop-pay-button-border-radius: var(--radius);`

### Step 6: Wire existing component radius settings to fall back to global

For `product-card/index.tsx`, `product/badges.tsx`, and `section.tsx`:
- When their own radius setting is `0` (default), use `var(--radius)` so the global value applies
- When explicitly set to a non-zero value, use that component-specific value

This ensures backward compatibility: existing stores with custom per-component radius keep their values, while new stores get the global value everywhere.

## Not Changing

These components use `rounded-full` intentionally for circular/pill shapes and should NOT inherit from the global radius:
- Color swatches (`product-card-options.tsx`) — circular by design
- Cart count badge (`cart-drawer.tsx`) — circular badge
- Spinner (`spinner.tsx`) — circular animation
- Close/zoom buttons (`media-zoom.tsx`) — circular icon buttons
- Quick shop icon button (`quick-shop.tsx`) — circular icon button

## Verification

1. `nr typecheck` — types compile
2. `nr format && nr fix` — lint passes
3. Set `radiusBase` to `0` → all elements are square
4. Set `radiusBase` to `8` → buttons, inputs, cards, sections all show 8px radius
5. Override product card radius to `16` while global is `8` → card shows 16px, everything else 8px
