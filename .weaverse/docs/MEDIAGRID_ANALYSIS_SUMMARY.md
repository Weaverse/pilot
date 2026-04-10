# MediaGrid Complete Analysis

> **Last Updated:** 2026-04-03  
> **Status:** ✅ Thorough Analysis Complete  
> **Scope:** Full codebase search for MediaGrid usage

---

## 🎯 Quick Answer

**MediaGrid** is used indirectly through the **ProductMedia** component, which is the actual parent. There are **3 parent contexts** that use ProductMedia:

1. **Main Product Section** (`app/sections/main-product/product-media.tsx`) - Weaverse configurable section
2. **Single Product Page** (`app/sections/single-product/index.tsx`) - Full product page
3. **Quick Shop Modal** (`app/components/product-card/quick-shop.tsx`) - Quick view dialog

---

## 📊 Component Hierarchy

```
ProductMedia (index.tsx) ← THE REAL PARENT
    ├─→ MediaGrid (if mediaLayout === "grid")
    └─→ MediaSlider (if mediaLayout === "slider")
```

**Where ProductMedia comes from:**
- Main Product Section: `useLoaderData<typeof productRouteLoader>()`
- Single Product Page: `loaderData?.product` + local state
- Quick Shop Modal: `props.data.product` + local state

---

## 🔑 How displayMedia and allMedia Are Computed

### In ProductMedia Component (index.tsx, lines 69-114):

```typescript
let displayMedia = media;  // Start with raw media

if (groupMediaByVariant && product && groupByOption) {
  // Apply variant-specific filtering
  let result = getVariantGroupedMedia({
    allMedia: media,
    selectedVariant,
    product,
    groupByOption,
  });
  displayMedia = result.media;  // ← Filtered!
}

// Pass to MediaGrid or MediaSlider
<MediaGrid
  allMedia={media}           // ← ALWAYS unfiltered
  displayMedia={displayMedia} // ← FILTERED or same as above
  {...otherProps}
/>
```

### Key Insight:
- **allMedia** = Complete unfiltered product media (always)
- **displayMedia** = Filtered by variant (only if filtering enabled)
- **Filtering is optional** - happens only when:
  1. `groupMediaByVariant === true`
  2. `product` prop is provided
  3. `groupByOption` is specified (e.g., "Color")

---

## 🔄 Variant-Specific Media Filtering Logic

**Location:** `app/components/product-media/variant-media-group.ts`

**Function:** `getVariantGroupedMedia()`

### Algorithm (5 Steps):

1. **Extract selected option value** from variant
   - Example: Selected variant "Black" → extract "black"

2. **Get known option values** from product
   - Example: `product.options` contains ["Black", "Cream", "Slate Brown"]

3. **Extract option value from each image filename**
   - Looks for patterns: `black_`, `_black`, `-black`, ends with `black`
   - Handles multi-word values: "Slate Brown" → "slate-brown", "slate_brown"

4. **Group images by extracted option**
   - Creates map: `{ "black": [image1, ...], "cream": [image2], ... }`
   - Ungrouped images go to separate list

5. **Return filtered result**
   - Returns: matched images + ungrouped images
   - Fallback: If no matches found, returns all media

### Example:

```
Selected Variant: Black
Images: [black_shirt.jpg, cream_shirt.jpg, product.jpg]

Processing:
  ✓ black_shirt.jpg → matches "black" → include
  ✗ cream_shirt.jpg → matches "cream" → exclude
  ✓ product.jpg → no option found → include (ungrouped)

Result: [black_shirt.jpg, product.jpg]
```

---

## 📝 MediaGrid Props

### Passed from ProductMedia:

**allMedia**
- Type: `MediaFragment[]`
- Purpose: Complete unfiltered media
- Used for: Zoom modal (shows all images regardless of filtering)
- Always: Unfiltered

**displayMedia**
- Type: `MediaFragment[]`
- Purpose: Media to display in grid/slider
- Used for: Main grid/slider rendering
- May be: Filtered by variant (if enabled)

**gridSize**
- Type: `"1x1" | "2x2" | "mix"`
- Purpose: Grid layout configuration
- "1x1": Single column
- "2x2": 2-column layout on 2xl screens
- "mix": Masonry-style layout

**selectedVariant**
- Type: `ProductVariantFragment`
- Purpose: Currently selected variant
- Used for: Resetting "Show more" button state

**initialMediaCount**
- Type: `number` (0-20)
- Purpose: Items to show before "Show more" button
- 0 = Show all items (no button)

---

## 📍 Where displayMedia vs allMedia Are Used

| Component | Uses allMedia | Uses displayMedia |
|-----------|---------------|------------------|
| MediaGrid rendering | ❌ | ✅ Maps and displays |
| Show more button | ❌ | ✅ Counts items |
| Zoom modal | ✅ | ❌ |
| Initial visibility | ❌ | ✅ Sliced for visibility |

---

## ⚙️ Configuration Options (Weaverse)

In `app/sections/main-product/product-media.tsx` schema:

**Media Layout:**
- `mediaLayout`: "grid" | "slider"
- `gridSize`: "1x1" | "2x2" | "mix" (grid only)

**Variant Grouping:**
- `groupMediaByVariant`: boolean (enable filtering)
- `groupByOption`: string (e.g., "Color")

**Grid-Specific:**
- `initialMediaCount`: number (0-20)
- `showMoreText`: string
- `showLessText`: string

**Zoom Settings:**
- `enableZoom`: boolean
- `zoomTrigger`: "image" | "button" | "both"
- `zoomButtonVisibility`: "always" | "hover"

---

## 🔗 Complete Call Chain

```
Parent Component (gets product from loader)
    ↓
ProductMedia Component
  - Receives: media, selectedVariant, groupMediaByVariant, groupByOption, product
  - Computes: displayMedia (with optional filtering)
    ↓
    IF groupMediaByVariant && product && groupByOption:
      Call getVariantGroupedMedia() → filtered displayMedia
    ELSE:
      displayMedia = media (no filtering)
    ↓
MediaGrid or MediaSlider
  - Receives: allMedia (unfiltered), displayMedia (filtered or all)
  - Renders: displayMedia in grid/slider
  - Zooms: allMedia in modal
```

---

## 🧪 Testing Variant Filtering

### Setup:
1. Enable in Weaverse: `groupMediaByVariant = true`
2. Set: `groupByOption = "Color"`
3. Create product with images:
   - `black_shirt.jpg` (matches "Black" color)
   - `cream_shirt.jpg` (matches "Cream" color)
   - `product.jpg` (no color in filename)
4. Product has "Color" option with values: ["Black", "Cream"]

### Expected Behavior:
- Select Black variant → See: black_shirt.jpg + product.jpg (cream excluded)
- Click zoom → See all 3 images (unfiltered)
- Select Cream variant → See: cream_shirt.jpg + product.jpg (black excluded)

---

## ⚠️ Important Gotchas

❌ **Mistake:** Zoom modal respects variant filtering
✅ **Reality:** Zoom modal always shows `allMedia` (unfiltered)

❌ **Mistake:** Variant filtering uses product variant assignments
✅ **Reality:** Filtering uses filename pattern matching

❌ **Mistake:** displayMedia and media are the same
✅ **Reality:** media is raw, displayMedia is filtered (if enabled)

❌ **Mistake:** Show more button counts allMedia
✅ **Reality:** Show more button counts displayMedia

---

## 📂 Files Involved

**Core:**
- `app/components/product-media/index.tsx` - ProductMedia (orchestrator)
- `app/components/product-media/media-grid.tsx` - MediaGrid (grid display)
- `app/components/product-media/variant-media-group.ts` - Filtering logic

**Parents:**
- `app/sections/main-product/product-media.tsx` - Weaverse section
- `app/sections/single-product/index.tsx` - Product page
- `app/components/product-card/quick-shop.tsx` - Quick shop modal

**Supporting:**
- `app/components/product-media/media-slider.tsx` - Slider alternative
- `app/components/product-media/media-zoom.tsx` - Zoom modal
- `app/components/product-media/media-item.tsx` - Single image

---

## 🎓 Summary

**MediaGrid receives:**
- `allMedia`: Unfiltered complete media array
- `displayMedia`: Filtered media (by variant) OR all media if no filtering
- Config for grid layout, zoom, and show-more functionality

**Key distinction:**
- `allMedia` is used only for the zoom modal
- `displayMedia` is used for the main grid display
- Variant filtering is filename-based, not variant-assignment-based

**Filtering is triggered by 3 conditions:**
1. `groupMediaByVariant === true`
2. `product` prop provided
3. `groupByOption` specified

---

## 📚 Documentation

Additional detailed documents available:
- **MEDIAGRID_SUMMARY.txt** - Quick overview with call chain
- **MEDIAGRID_QUICK_REFERENCE.md** - Quick lookup and testing
- **MEDIAGRID_VISUAL_FLOW.txt** - Architecture diagrams
- **MEDIAGRID_CODE_REFERENCE.md** - Code snippets
- **MEDIAGRID_ANALYSIS.md** - Comprehensive reference

