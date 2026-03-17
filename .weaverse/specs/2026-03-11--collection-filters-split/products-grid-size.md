# products-grid-size.ts

This file has two separate stores that solve two different problems. Think of each store as a shared box that multiple components can read from and write to — when one component updates the box, every other component watching it re-renders automatically.

---

## Store 1: `useProductsGridSizeStore` (persisted)

**What it does:** Remembers how many product columns the user wants to see in the grid.

```
┌─────────────────────────────────────────────────┐
│  useProductsGridSizeStore (saved to localStorage) │
│                                                    │
│  gridSizeDesktop: 3    ← columns on desktop        │
│  gridSizeMobile: 1     ← columns on mobile         │
│  userOverride: false   ← has user clicked a layout?│
└─────────────────────────────────────────────────┘
```

### Three actions:

| Action | What it does | Who calls it |
|--------|--------------|--------------|
| `initialize(desktop, mobile)` | Sets default column counts from Weaverse settings, but only if the user hasn't manually changed them | Product grid components on mount |
| `setGridSize(size)` | User clicked a layout button. If size > 2 it's desktop, otherwise mobile. Marks `userOverride: true` | Layout switcher (toolbar) |
| *(reading values)* | Components read `gridSizeDesktop` and `gridSizeMobile` to set CSS grid columns | Product grid + toolbar |

### Why `userOverride` matters:

```
Page loads → initialize(3, 1)     → gridSizeDesktop = 3  ✅ (no override yet)
User clicks 4-column button       → gridSizeDesktop = 4, userOverride = true
User navigates to another page    → initialize(3, 1)     → SKIPPED ✅ (user chose 4, respect that)
```

Without this flag, navigating between collections would reset the user's preference every time.

### Why persist

The store is wrapped in `persist(...)` which saves to localStorage under the key `"collection-grid-size"`. So if the user picks 4 columns, closes the browser, and comes back — it's still 4 columns.

---

## Store 2: `useVisibleCountStore` (NOT persisted)

**What it does:** Tracks how many products are currently visible on screen (including all loaded infinite-scroll pages).

```
┌──────────────────────────────────────────┐
│  useVisibleCountStore (in-memory only)    │
│                                           │
│  visibleCount: 0  ← total visible products│
└──────────────────────────────────────────┘
```

### The data flow:

```
Pagination (Hydrogen)
  └─ renders with accumulated nodes (12 → 24 → 36...)
      └─ ProductsLoadedOnScroll component
          └─ useEffect → setVisibleCount(nodes.length)
              └─ Toolbar reads visibleCount → shows "24 products"
```

### Why not just read `useLoaderData()` in the toolbar?

Because `useLoaderData()` only has the initial page data from the server. When infinite scroll loads more products via client-side `navigate()`, the loader re-runs and returns just the new page's data (e.g., 12 products). It doesn't accumulate. Only Hydrogen's `<Pagination>` component internally accumulates all nodes — so we sync that count to the store via a `useEffect` in `ProductsLoadedOnScroll`.

---

## Who reads what (the full picture)

```
                  ┌──────────────┐
                  │ Product Grid │ (mc--product-grid / ap--product-grid)
                  │              │
                  │ WRITES:      │
                  │  initialize()│──→ GridSizeStore
                  │  setVisible  │──→ VisibleCountStore (nodes.length)
                  │  Count()     │
                  │              │
                  │ READS:       │
                  │  gridSize*   │←── GridSizeStore (for CSS grid columns)
                  └──────────────┘
                  
                  ┌──────────────┐
                  │   Toolbar    │ (mc--toolbar / ap--toolbar)
                  │              │
                  │ READS:       │
                  │  gridSize*   │←── GridSizeStore (for layout switcher UI)
                  │  visibleCount│←── VisibleCountStore (for "24 products")
                  │              │
                  │ WRITES:      │
                  │  setGridSize │──→ GridSizeStore (user clicks layout button)
                  └──────────────┘
```
