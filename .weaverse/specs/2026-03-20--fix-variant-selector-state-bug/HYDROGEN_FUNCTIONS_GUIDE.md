# Understanding `getProductOptions`, `firstSelectableVariant`, and `getAdjacentAndFirstAvailableVariants` in @shopify/hydrogen

## Overview

These three functions work together to power dynamic product variant selection in Hydrogen storefronts. They convert raw Storefront API data into a structured format that's easy to use for UI rendering.

## 1. What is `firstSelectableVariant`?

### Location in GraphQL Query
In your `fragments.ts`, you query it like this:
```graphql
fragment ProductOption on ProductOption {
  name
  optionValues {
    name
    firstSelectableVariant {
      ...ProductVariant
    }
    swatch { ... }
  }
}
```

### What it represents
**`firstSelectableVariant` is the first variant (chronologically in the Storefront API) that has that specific option value selected.**

**Important:** It does NOT mean "the first available variant" - it can be an unavailable variant. It's simply the first variant that includes that option value.

### Example
If you have a Color option with values: Red, Blue, Green
- `optionValues[0].name` = "Red"
- `optionValues[0].firstSelectableVariant` = First variant object where `selectedOptions` includes `{name: "Color", value: "Red"}`

This is useful for:
- Showing product images for each color option
- Providing a default variant when that option value is clicked
- Pre-filling variant data before the full variant lookup

---

## 2. What is `getAdjacentAndFirstAvailableVariants`?

### Purpose
Collects all the variants that are likely to be needed for variant selection. Returns a flat array of unique variants.

### Implementation
```javascript
function getAdjacentAndFirstAvailableVariants(product) {
  const availableVariants = {};
  
  // 1. Collect firstSelectableVariant from EVERY option value
  product.options.forEach((option) => {
    option.optionValues.forEach((value) => {
      if (value.firstSelectableVariant) {
        const variantKey = JSON.stringify(value.firstSelectableVariant.selectedOptions);
        availableVariants[variantKey] = value.firstSelectableVariant;
      }
    });
  });
  
  // 2. Add all adjacent variants (related variants based on current selection)
  product.adjacentVariants.forEach((variant) => {
    const variantKey = JSON.stringify(variant.selectedOptions);
    availableVariants[variantKey] = variant;
  });
  
  // 3. Add the currently selected/first available variant
  if (product.selectedOrFirstAvailableVariant) {
    const variantKey = JSON.stringify(product.selectedOrFirstAvailableVariant.selectedOptions);
    availableVariants[variantKey] = product.selectedOrFirstAvailableVariant;
  }
  
  // Return unique variants (duplicates removed by key)
  return Object.values(availableVariants);
}
```

### What it collects
1. **firstSelectableVariant from all option values** - One from each color, size, etc.
2. **adjacentVariants** - Related variants based on current selection
3. **selectedOrFirstAvailableVariant** - The currently selected variant

### Example
```
Product: "T-Shirt"
Colors: Red, Blue, Green
Sizes: S, M, L

Returns array with ~9 unique variants:
- Red + S
- Red + M
- Red + L
- Blue + S
- Blue + M
- Blue + L
- Green + S
- Green + M
- Green + L
```

### Usage in code
```typescript
const selectedVariant = useOptimisticVariant(
  product?.selectedOrFirstAvailableVariant,
  getAdjacentAndFirstAvailableVariants(product),  // ← Cache of likely variants
);
```

---

## 3. What is `getProductOptions`?

### Purpose
Transforms raw product data into a structured format with variant state information for each option value.

### Type Definition
```typescript
export type MappedProductOptions = Omit<ProductOption, 'optionValues'> & {
  optionValues: MappedProductOptionValue[];
};

type MappedProductOptionValue = ProductOptionValue & {
  variant: ProductVariant;              // Best matching variant
  handle: string;                       // Product handle (or different product handle)
  variantUriQuery: string;              // URL search params for this variant
  selected: boolean;                    // Is this value currently selected?
  exists: boolean;                      // Does this option combo exist?
  available: boolean;                   // Is this option combo in stock?
  isDifferentProduct: boolean;          // Does this lead to different product?
  firstSelectableVariant?: ProductVariant;  // Original first selectable variant
};
```

### Implementation Flow

#### Step 1: Prepare Data
```javascript
const productOptionMappings = mapProductOptions(options);
// Creates lookup: { "Color": { "Red": 0, "Blue": 1 }, "Size": { "S": 0, "M": 1 } }

const variants = mapVariants([selectedVariant, ...adjacentVariants]);
// Creates lookup: { '{"Color":"Red","Size":"M"}': variantObj }
```

#### Step 2: Build Encoded Variants
```javascript
// From Storefront API:
encodedVariantExistence = "01010101..."    // Binary flags for which combos exist
encodedVariantAvailability = "01010101..." // Binary flags for which combos are available
```

#### Step 3: For Each Option Value, Create State
```javascript
productOptions.map((option) => ({
  ...option,
  optionValues: option.optionValues.map((value) => {
    // Build target params: e.g., { Color: "Red", Size: "M" }
    const targetOptionParams = { ...selectedOptions };
    targetOptionParams[option.name] = value.name;
    
    // Convert to encoding key for binary lookup
    const encodingKey = buildEncodingArrayFromSelectedOptions(
      targetOptionParams,
      productOptionMappings
    );
    
    // Look up if this combination exists/is available
    const exists = isOptionValueCombinationInEncodedVariant(
      encodingKey,
      encodedVariantExistence
    );
    const available = isOptionValueCombinationInEncodedVariant(
      encodingKey,
      encodedVariantAvailability
    );
    
    // Find best variant: from full variants cache OR fallback to firstSelectableVariant
    const variant = variants[JSON.stringify(targetOptionParams)] 
                    || value.firstSelectableVariant;
    
    // Build URL query string for this variant
    const searchParams = new URLSearchParams(variant.selectedOptions);
    
    return {
      ...value,
      variant,                              // ← Use this to get image, price, etc.
      handle,                               // ← For navigation
      variantUriQuery: searchParams.toString(),  // ← For URL
      selected: selectedOptions[option.name] === value.name,
      exists,                               // ← Show/hide this option
      available,                            // ← Show availability status
      isDifferentProduct,                   // ← For combined listings
    };
  })
}));
```

### What you get back

For a T-Shirt with Colors and Sizes:

```javascript
[
  {
    name: "Color",
    optionValues: [
      {
        name: "Red",
        selected: true,           // Currently selected
        exists: true,             // Can select this
        available: true,          // In stock
        variant: { /* variant object */ },
        variantUriQuery: "Color=Red&Size=M",
        handle: "t-shirt",
        isDifferentProduct: false,
        firstSelectableVariant: { /* fallback */ },
        swatch: { color: "#FF0000" }
      },
      {
        name: "Blue",
        selected: false,
        exists: true,
        available: false,         // Out of stock
        variant: { /* variant object */ },
        variantUriQuery: "Color=Blue&Size=M",
        // ... rest of fields
      }
    ]
  },
  {
    name: "Size",
    optionValues: [
      {
        name: "S",
        selected: false,
        exists: false,            // No combination exists with current color
        available: false,
        variant: { /* variant object */ },
        variantUriQuery: "Color=Red&Size=S",
        // ... rest of fields
      },
      {
        name: "M",
        selected: true,
        exists: true,
        available: true,
        variant: { /* variant object */ },
        variantUriQuery: "Color=Red&Size=M",
        // ... rest of fields
      }
    ]
  }
]
```

---

## How They Work Together

### Data Flow

```
1. GraphQL Query fetches:
   ├── product.options[].optionValues[].firstSelectableVariant
   ├── product.selectedOrFirstAvailableVariant
   ├── product.adjacentVariants
   ├── product.encodedVariantExistence
   └── product.encodedVariantAvailability

2. getAdjacentAndFirstAvailableVariants(product)
   → Returns array of ~6-12 variants for caching
   → Used by useOptimisticVariant() for fast switching

3. getProductOptions(product)
   → Transforms product data
   → Returns MappedProductOptions[] ready for UI
   → Each option value has:
      - variant: specific variant to show (image, price)
      - exists: whether option combination exists
      - available: whether it's in stock
      - variantUriQuery: URL params for navigation
```

### In Your UI Code

```typescript
const productOptions = getProductOptions({
  ...product,
  selectedOrFirstAvailableVariant: selectedVariant,
});

// Loop through options
{productOptions.map((option) => (
  <ProductOptionValues
    option={option}  // Contains name and optionValues[]
  />
))}

// In ProductOptionValues, for each value:
- Render as button/swatch if value.exists
- Disable if !value.exists
- Show strikethrough if !value.available
- Navigate to ?{value.variantUriQuery}
- Or call onVariantChange(value.firstSelectableVariant)
- Show image from value.variant.image
```

---

## Key Insights

### Why three different variant sets?

1. **firstSelectableVariant** 
   - Lightweight, one per option value
   - Guaranteed to be fetched
   - Used as fallback

2. **adjacentVariants**
   - More comprehensive variant data
   - Loaded based on current selection
   - Used to keep UI in sync

3. **getAdjacentAndFirstAvailableVariants()**
   - Combines all the above
   - Deduplicates variants
   - Creates cache for fast lookups

### Why encoded variant existence/availability?

Binary encoding makes it extremely fast to check if an option combination is valid:
- Instead of searching arrays of variants (slow)
- Check a bit position in an encoded string (fast)
- Enables responsive UI without re-querying

### firstSelectableVariant: Available or Not?

**It can be unavailable!** 

The function doesn't check availability. It just returns the first variant with that option value. You must:
1. Check the `available` boolean from `getProductOptions()`
2. Show visual feedback (strikethrough, disabled state)
3. Provide fallback (like showing the variant image anyway, just marked unavailable)

---

## GraphQL Query Requirements

For `getProductOptions` and related functions to work, you MUST query:

```graphql
query {
  product(handle: "...") {
    handle
    encodedVariantExistence        # ← Required for exists check
    encodedVariantAvailability     # ← Required for available check
    
    options {
      name
      optionValues {
        name
        firstSelectableVariant {   # ← Variant fallback
          id
          availableForSale
          selectedOptions {
            name
            value
          }
          product { handle }
          # ... any other data you need (image, price, etc.)
        }
        swatch { ... }
      }
    }
    
    selectedOrFirstAvailableVariant(selectedOptions: [...]) {
      # Same fields as firstSelectableVariant
    }
    
    adjacentVariants(selectedOptions: [...]) {
      # Same fields as firstSelectableVariant
    }
  }
}
```

Missing fields will cause console errors and getProductOptions() to return empty arrays.

