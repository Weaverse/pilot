# Collection Filters Split — Implementation Plan

## Summary

Refactor the monolithic `collection-filters` section (1,397 lines, 9 files) into a composable Weaverse parent-child architecture. The parent becomes a thin layout shell rendering `{children}`, while 4 child components (banner, toolbar, filters, product-pagination) each own their settings and are independently configurable in the Weaverse visual editor.

---

## Requirements

### Functional Requirements

- [ ] FR1: Parent `collection-filters` becomes a layout shell with only layout-level settings (gap, padding, etc.)
- [ ] FR2: `cf--banner` child owns breadcrumb, title, description, and banner image settings
- [ ] FR3: `cf--toolbar` child owns sort, product count, layout switcher, and filter drawer trigger settings
- [ ] FR4: `cf--filters` child owns sidebar filter settings (expand, swatches, display-as-button, item limit, etc.)
- [ ] FR5: `cf--product-pagination` child owns grid columns, load-more/prev text, and product grid rendering
- [ ] FR6: Children are draggable/reorderable in the Weaverse editor
- [ ] FR7: Default presets replicate the current layout (banner → toolbar → filters + products side by side)
- [ ] FR8: Existing collection page functionality is fully preserved (filtering, sorting, pagination, swatches)
- [ ] FR9: Each child is individually removable/addable in the Weaverse editor

### Non-Functional Requirements

- [ ] NFR1: No breaking changes to existing collection page layouts
- [ ] NFR2: Remove the `useClosestWeaverseItem` hack — children get their own settings as props
- [ ] NFR3: Shared utilities (`filter-utils.ts`) remain as-is — no duplication

### Out of Scope

- New UI or styling changes
- Additional filter types
- Changes to the collection route loader or GraphQL queries

---

## Technical Approach

### Current Architecture (monolithic)

```
collection-filters (index.tsx) — ONE section, ALL settings
├── Banner/breadcrumb/title/description   (inline in index.tsx, ~100 lines)
├── ToolsBar (tools-bar.tsx)
│   ├── LayoutSwitcher (layout-switcher.tsx)
│   ├── Sort (sort.tsx)
│   └── FiltersDrawer → Filters (filters.tsx)
│       ├── FilterItem (filter-item.tsx)
│       └── PriceRangeFilter (price-range-filter.tsx)
├── Filters (sidebar mode, same filters.tsx)
└── ProductsPagination (products-pagination.tsx)
```

**Problems:** 30+ settings on one schema, no reorderability, `useClosestWeaverseItem` DOM hack for data flow.

### Target Architecture (composable children)

```
collection-filters (parent shell)
├── cf--banner (breadcrumb + title + description + banner image)
├── cf--toolbar (sort + layout switcher + product count + filter drawer)
├── cf--filters (sidebar filters — only renders when filtersPosition=sidebar)
└── cf--product-pagination (product grid + pagination + applied filter chips)
```

Each child is a registered Weaverse component with its own schema, settings, and props.

### Data Flow

All children read route loader data via `useLoaderData()` (already the pattern). No prop-drilling from parent. Each child reads its own Weaverse settings as props. Shared state (grid size) uses URL params or a lightweight shared context if needed.

### Layout Grid Challenge

Currently, the parent renders a 2-column grid: sidebar filters on the left, product grid on the right. With children, we have two options:

**Recommended: `cf--filters` and `cf--product-pagination` handle their own layout cooperation.**

The parent renders children vertically. The toolbar and pagination form a natural content area, while the sidebar filters component positions itself. The `cf--filters` child controls its own sidebar vs drawer behavior. The product grid area is handled by `cf--product-pagination`.

To preserve the sidebar layout, the parent keeps `filtersPosition` as a setting and passes it via a CSS data attribute or a small React context. Children read this to adjust their rendering.

**Revised parent role:**
- The parent still holds the `filtersPosition` setting ("sidebar" | "drawer") since it affects the overall page layout
- The parent renders a grid when `filtersPosition === "sidebar"`: filters in left column, other children in right column
- The parent renders a single column when `filtersPosition === "drawer"`

This means `cf--filters` and `cf--product-pagination` are rendered within the parent's grid structure, but they still own their individual settings.

---

## Component Schema Design

### Parent: `collection-filters`

| Setting | Type | Default | Notes |
|---------|------|---------|-------|
| `filtersPosition` | `select` | `"sidebar"` | `"sidebar"` or `"drawer"` — affects overall layout |
| Layout settings | (from `layoutInputs`) | — | Shared section layout (padding, etc.) |

**`childTypes`**: `["cf--banner", "cf--toolbar", "cf--filters", "cf--product-pagination"]`

### Child: `cf--banner`

| Setting | Type | Default |
|---------|------|---------|
| `showBreadcrumb` | `switch` | `true` |
| `showDescription` | `switch` | `true` |
| `showBanner` | `switch` | `false` |
| `bannerHeightDesktop` | `range` | `300` |
| `bannerHeightMobile` | `range` | `180` |
| `bannerBorderRadius` | `range` | `0` |

### Child: `cf--toolbar`

| Setting | Type | Default |
|---------|------|---------|
| `enableSort` | `switch` | `true` |
| `showProductsCount` | `switch` | `true` |
| `enableFilter` | `switch` | `true` |
| `productsPerRowDesktop` | `range` | `4` |
| `productsPerRowMobile` | `range` | `2` |

### Child: `cf--filters`

| Setting | Type | Default |
|---------|------|---------|
| `expandFilters` | `switch` | `true` |
| `showFiltersCount` | `switch` | `true` |
| `enableSwatches` | `switch` | `true` |
| `displayAsButtonFor` | `text` | `""` |
| `filterItemsLimit` | `range` | `5` |

### Child: `cf--product-pagination`

| Setting | Type | Default |
|---------|------|---------|
| `loadPrevText` | `text` | `"Load previous"` |
| `loadMoreText` | `text` | `"Load more products"` |
| `productsPerRowDesktop` | `range` | `4` |
| `productsPerRowMobile` | `range` | `2` |

---

## Implementation Structure

### Files to Create

| File | Purpose |
|------|---------|
| `app/sections/collection-filters/banner.tsx` | `cf--banner` child: breadcrumb, title, description, banner image |
| `app/sections/collection-filters/toolbar.tsx` | `cf--toolbar` child: sort, layout switcher, product count, filter drawer trigger |
| `app/sections/collection-filters/collection-filters-context.tsx` | Shared context for grid size state between toolbar ↔ pagination |

### Files to Modify

| File | Changes |
|------|---------|
| `app/sections/collection-filters/index.tsx` | Strip down to layout shell with `{children}`, keep `filtersPosition` setting, add `childTypes` + `presets` |
| `app/sections/collection-filters/filters.tsx` | Convert to Weaverse child (`cf--filters`), export schema, receive settings as props instead of `useClosestWeaverseItem` |
| `app/sections/collection-filters/products-pagination.tsx` | Convert to Weaverse child (`cf--product-pagination`), export schema, receive settings as props |
| `app/sections/collection-filters/tools-bar.tsx` | Refactor to work within `cf--toolbar` (may merge into toolbar.tsx) |
| `app/weaverse/components.ts` | Register 4 new child components |

### Files Unchanged

| File | Reason |
|------|--------|
| `filter-item.tsx` | Internal to filters, not a Weaverse component |
| `filter-utils.ts` | Pure utility, no changes needed |
| `price-range-filter.tsx` | Internal to filters, not a Weaverse component |
| `sort.tsx` | Internal to toolbar, not a Weaverse component |
| `layout-switcher.tsx` | Internal to toolbar, not a Weaverse component |

### Final Folder Structure

```
app/sections/collection-filters/
├── index.tsx                          ← parent shell (slimmed down ~80 lines)
├── banner.tsx                         ← NEW: cf--banner child (~120 lines)
├── toolbar.tsx                        ← NEW: cf--toolbar child (~50 lines, wraps tools-bar)
├── collection-filters-context.tsx     ← NEW: shared grid size context
├── filters.tsx                        ← MODIFIED: cf--filters child with own schema
├── products-pagination.tsx            ← MODIFIED: cf--product-pagination child with own schema
├── tools-bar.tsx                      ← MODIFIED: simplified, used by toolbar.tsx
├── filter-item.tsx                    ← unchanged
├── filter-utils.ts                    ← unchanged
├── price-range-filter.tsx             ← unchanged
├── sort.tsx                           ← unchanged
└── layout-switcher.tsx                ← unchanged
```

---

## Implementation Steps

### Step 1: Create shared context

Create `collection-filters-context.tsx` with a small React context for grid size state that the toolbar (layout switcher) and product pagination need to share.

### Step 2: Create `cf--banner` child

Extract breadcrumb + title + description + banner image rendering from `index.tsx` into `banner.tsx`. Give it its own Weaverse schema with the banner-related settings.

### Step 3: Create `cf--toolbar` child

Create `toolbar.tsx` as a Weaverse child component that wraps the existing `ToolsBar`. Move toolbar-related settings into its schema. The existing `tools-bar.tsx`, `sort.tsx`, and `layout-switcher.tsx` become internal components of this child.

### Step 4: Convert `filters.tsx` to Weaverse child

Add schema export to `filters.tsx`. Move filter-related settings from parent schema to this child's schema. Remove `useClosestWeaverseItem` — settings now come as props.

### Step 5: Convert `products-pagination.tsx` to Weaverse child

Add schema export. Move pagination and grid settings to this child's schema.

### Step 6: Refactor parent `index.tsx`

Strip down to:
- Layout shell with `filtersPosition` setting
- Grid rendering logic (sidebar vs single column)
- `childTypes` and `presets` declarations
- Renders `{children}`

### Step 7: Register all children in `components.ts`

Add imports and register `cf--banner`, `cf--toolbar`, `cf--filters`, `cf--product-pagination`.

### Step 8: Test & verify

- Verify existing collection pages render correctly
- Test filtering, sorting, pagination
- Test sidebar vs drawer mode
- Test in Weaverse editor (drag, reorder, settings per child)
- Run typecheck and linting

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Grid size state shared between toolbar and pagination | Use a lightweight React context (not Weaverse-level) |
| Sidebar layout requires parent knowledge of children positions | Parent retains `filtersPosition` and renders grid layout, children slot into it |
| Breaking existing page configurations | Presets replicate current default layout exactly |
| Filters used in both sidebar AND drawer (toolbar) | `cf--filters` renders in sidebar position; toolbar child internally renders its own drawer with same filter components |

---

## Testing Checklist

- [ ] Collection page renders identically to current version
- [ ] Sidebar filter mode works (filters on left, products on right)
- [ ] Drawer filter mode works (filters slide in from left)
- [ ] Sort dropdown works
- [ ] Price range slider works
- [ ] Filter swatches display correctly
- [ ] Applied filter chips show with remove buttons
- [ ] Pagination (load more, load previous) works
- [ ] Layout switcher changes grid columns
- [ ] Banner image displays when enabled
- [ ] Breadcrumb renders correctly
- [ ] Children are reorderable in Weaverse editor
- [ ] Each child's settings appear in its own inspector panel
- [ ] Removing a child doesn't break the page
- [ ] Typecheck passes (`npm run typecheck`)
- [ ] Linting passes (`npm run fix`)
