# Overview

This prompt describes how to implement "Combined Listings" in the **Pilot theme** — a Weaverse-powered Hydrogen storefront built with React Router 7 and Tailwind CSS v4. Below is a "recipe" that contains the steps to apply to the Pilot theme to achieve the desired outcome.
If there are any prerequisites, the recipe below will explain them; if the user is trying to implement the feature described in this recipe, make sure to prominently mention the prerequisites and any other preliminary instructions, as well as followups.
If the user is asking on how to implement the feature from scratch, please first describe the feature in a general way before jumping into the implementation details.
Please note that the recipe steps below are not necessarily ordered in the way they should be executed, as it depends on the user's needs and the specific details of the project. The recipe steps descriptions should allow you to understand what is required to be done in a certain order and what is not.

**Key Pilot architecture notes:**
- Pilot uses **Weaverse sections** in `app/sections/main-product/` instead of monolithic components. Each section has its own `createSchema` export, `loader` (optional), and default export.
- There is NO single `ProductForm` component. Instead, ATC buttons, quantity selector, variant selector, prices, and media are all separate Weaverse sections.
- Pilot uses Tailwind CSS v4 — no raw CSS files are needed for styling.
- Import paths use `~/.server/`, `~/utils/`, `~/components/`, `~/sections/`, and `~/graphql/`.
- Generated types come from `storefront-api.generated` (not `storefrontapi.generated`).
- Redirects use `import { redirect } from "react-router"` (not `@shopify/remix-oxygen`).
- Pilot uses semicolons and double quotes as its code style convention.

# AI model verification steps

- Never edit generated files (ending with .d.ts) directly; instead, run the `npm run codegen` command to update them (if the command is available).

# Summary

Handle combined listings on product pages and in search results.

# User Intent Recognition

<user_queries>
- How can I show combined listings on product pages and search results using Hydrogen?
- How can I display the featured image of the combined listing parent product instead of the variant image?
- How can I redirect to the first variant of a combined listing when the handle is requested?
- How can I filter out combined listings from the product list when using Shopify headless?
- How can I show the price range for combined listings instead of the variant price?
</user_queries>

# Troubleshooting

<troubleshooting>
- **Issue**: Combined listings are being displayed in the product list.
  **Solution**: Make sure to tag combined listing parent products in the Shopify admin and use that tag to filter out combined listings from the product list in the GraphQL query.
</troubleshooting>

# Recipe Implementation

Here's the combined-listings recipe for the Pilot theme:

<recipe_implementation>

## Description

This recipe lets you more precisely display and manage [combined listings](https://help.shopify.com/en/manual/products/combined-listings-app) on product pages and in search results for your Pilot-powered Hydrogen storefront. A combined listing groups separate products together into a single product listing using a shared option like color or size.
Each product appears as a variant but can have its own title, description, URL, and images.
In this recipe, you'll make the following changes:

1. Set up the Combined Listings app in your Shopify admin and group relevant products together as combined listings.
2. Configure how combined listings will be handled on your storefront.
3. Hide the **Add to cart** button and quantity selector for the parent products of combined listings.
4. Update variant option styling so combined listing parents don't show a "selected" state.
5. Update the product media section to prepend the featured image for combined listings.
6. Show a range of prices for combined listings on both the product page and product cards.

## Requirements

- Your store must be on either a [Shopify Plus](https://www.shopify.com/plus) or enterprise plan.
- Your store must have the [Combined Listings app](https://admin.shopify.com/apps/combined-listings) installed.

## New files added to the template by this recipe

- app/utils/combined-listings.ts

## Steps

### Step 1: Set up the Combined Listings app

1. Install the [Combined Listings app](https://admin.shopify.com/apps/combined-listings).

2. [Create combined listing products in your store](https://help.shopify.com/en/manual/products/combined-listings-app#creating-a-combined-listing).

3. Add tags to the parent products of combined listings to indicate that they're part of a combined listing (for example `combined`).

### Step 2: Configure combined listings behavior

You can customize how the parent products of combined listings are retrieved and displayed.

To make this process easier, we included a configuration object in the `combined-listings.ts` file that you can edit to customize according to your preferences.

```ts
// Edit these values to customize the combined listings behaviors
export const COMBINED_LISTINGS_CONFIGS = {
  // If true, loading the product page will redirect to the first variant
  redirectToFirstVariant: false,
  // The tag that indicates a combined listing
  combinedListingTag: "combined",
  // If true, combined listings will not be shown in the product list
  hideCombinedListingsFromProductList: true,
};
```

### Step 3: Add combined listings utilities

Create a new `combined-listings.ts` file that contains utilities and settings for handling combined listings.

#### File: [combined-listings.ts](app/utils/combined-listings.ts)

```ts
// Edit these values to customize combined listings' behavior
export const COMBINED_LISTINGS_CONFIGS = {
  // If true, loading the product page will redirect to the first variant
  redirectToFirstVariant: false,
  // The tag that indicates a combined listing
  combinedListingTag: "combined",
  // If true, combined listings will not be shown in the product list
  hideCombinedListingsFromProductList: true,
};

export const maybeFilterOutCombinedListingsQuery =
  COMBINED_LISTINGS_CONFIGS.hideCombinedListingsFromProductList
    ? `NOT tag:${COMBINED_LISTINGS_CONFIGS.combinedListingTag}`
    : "";

interface ProductWithTags {
  tags: string[];
}

function isProductWithTags(u: unknown): u is ProductWithTags {
  const maybe = u as ProductWithTags;
  return (
    u != null &&
    typeof u === "object" &&
    "tags" in maybe &&
    Array.isArray(maybe.tags)
  );
}

export function isCombinedListing(product: unknown) {
  return (
    isProductWithTags(product) &&
    product.tags.includes(COMBINED_LISTINGS_CONFIGS.combinedListingTag)
  );
}
```

### Step 4: Hide ATC button, quantity selector, and update variant option styling

In Pilot, the Add to Cart button and quantity selector are separate Weaverse sections. Update each to return `null` for combined listing parent products. Also update the variant selector chain to pass a `combinedListing` prop and adjust styling.

#### File: /app/sections/main-product/product-atc-buttons.tsx

```diff
@@ -8,6 +8,7 @@ import { useLoaderData } from "react-router";
 import { AddToCartButton } from "~/components/product/add-to-cart-button";
 import type { loader as productRouteLoader } from "~/routes/products/product";
+import { isCombinedListing } from "~/utils/combined-listings";
 import { useProductQtyStore } from "./product-quantity-selector";

@@ -30,6 +31,11 @@ export default function ProductATCButtons(props: ProductATCButtonsProps) {
   const { product, storeDomain } = useLoaderData<typeof productRouteLoader>();
   const { quantity } = useProductQtyStore();

+  const combinedListing = isCombinedListing(product);
+
+  if (!product || combinedListing) {
+    return null;
+  }
+
   const selectedVariant = useOptimisticVariant(
```

#### File: /app/sections/main-product/product-quantity-selector.tsx

```diff
@@ -4,6 +4,7 @@ import { create } from "zustand";
 import { Quantity } from "~/components/product/quantity";
 import type { loader as productRouteLoader } from "~/routes/products/product";
+import { isCombinedListing } from "~/utils/combined-listings";

@@ -24,6 +25,12 @@ export default function ProductQuantitySelector(
   const { product } = useLoaderData<typeof productRouteLoader>();
   const { quantity, setQuantity } = useProductQtyStore();

+  const combinedListing = isCombinedListing(product);
+
+  if (!product || combinedListing) {
+    return null;
+  }
+
   return (
```

#### File: /app/sections/main-product/product-variant-selector.tsx

The variant selector section detects if the product is a combined listing and passes the flag down.

```diff
@@ -5,6 +5,7 @@ import {
 import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
 import { useLoaderData } from "react-router";
 import type { loader as productRouteLoader } from "~/routes/products/product";
+import { isCombinedListing } from "~/utils/combined-listings";
 import { ProductVariants } from "./variants";

@@ -27,10 +28,13 @@ export default function ProductVariantSelector(
     selectedOrFirstAvailableVariant: selectedVariant,
   });

+  const combinedListing = isCombinedListing(product);
+
   return (
     <div ref={ref} {...rest}>
       <ProductVariants
         productOptions={productOptions}
         selectedVariant={selectedVariant}
+        combinedListing={combinedListing}
       />
     </div>
```

#### File: /app/sections/main-product/variants.tsx

The `ProductVariants` component passes `combinedListing` through to `ProductOptionValues`.

```diff
@@ -1,5 +1,6 @@
 import type { MappedProductOptions } from "@shopify/hydrogen";
-import type { ProductVariantFragment } from "storefrontapi.generated";
+import type { ProductVariantFragment } from "storefront-api.generated";
 import { ProductOptionValues } from "~/components/product/product-option-values";

 export function ProductVariants({
   productOptions,
   selectedVariant,
+  combinedListing,
 }: {
   productOptions: MappedProductOptions[];
   selectedVariant: ProductVariantFragment;
+  combinedListing?: boolean;
 }) {
@@ -23,6 +25,7 @@ export function ProductVariants({
             <ProductOptionValues
               option={option}
+              combinedListing={combinedListing}
             />
```

#### File: /app/components/product/product-option-values.tsx

Three changes in this file:
1. Add `combinedListing?: boolean` prop to both `ProductOptionValues` and `OptionValue`.
2. Set `replace: !combinedListing` in `linkProps` so navigation to a combined listing child doesn't replace history.
3. Change all `selected` conditions to `selected && !combinedListing` across all 4 rendering modes (swatch, button, image, default).

```diff
@@ -30,9 +30,11 @@ export function ProductOptionValues({
   option,
   onOptionChange,
+  combinedListing,
 }: {
   option: MappedProductOptions;
   onOptionChange?: (optionName: string, value: string) => void;
+  combinedListing?: boolean;
 }) {

@@ -119,6 +121,7 @@ export function ProductOptionValues({
               <OptionValue
                 optionName={optionName}
                 value={optionValue}
                 onOptionChange={onOptionChange}
+                combinedListing={combinedListing}
               />

@@ -143,9 +146,11 @@ function OptionValue({
   optionName,
   value,
   onOptionChange,
+  combinedListing,
 }: {
   optionName: string;
   value: MappedProductOptions["optionValues"][number];
   onOptionChange?: (optionName: string, value: string) => void;
+  combinedListing?: boolean;
 }) {

@@ -170,7 +175,7 @@ function OptionValue({
   const linkProps: LinkProps = {
     to,
     preventScrollReset: true,
     prefetch: "intent",
-    replace: true,
+    replace: !combinedListing,
   };

   // Swatch rendering:
@@ -218,7 +223,7 @@ function OptionValue({
         className={cn(
           "flex aspect-square size-(--option-swatch-size)",
           "overflow-hidden rounded-full",
           "outline-1 outline-offset-2 transition-[outline-color]",
           !exists && "cursor-not-allowed",
-          selected
+          selected && !combinedListing
             ? "outline-line"
             : "outline-transparent hover:outline-line",
           !available && "diagonal",

   // Button rendering:
@@ -252,7 +257,7 @@ function OptionValue({
         className={cn(
           "border border-line-subtle px-4 py-2.5 text-center transition-colors",
           !exists && "cursor-not-allowed",
-          selected
+          selected && !combinedListing
             ? [
                 available ? "bg-body text-body-inverse" : "text-body-subtle",
                 "border-body",

   // Image rendering:
@@ -274,7 +279,7 @@ function OptionValue({
         className={cn(
           "flex h-auto w-(--option-image-width) items-center justify-center p-1",
           "border border-line-subtle text-center transition-colors",
           !exists && "cursor-not-allowed",
-          selected
+          selected && !combinedListing
             ? [
                 available ? "text-body-inverse" : "text-body-subtle",
                 "border-body",

   // Default fallback rendering:
@@ -304,7 +309,7 @@ function OptionValue({
       className={cn(
         "border-b py-0.5",
         !exists && "cursor-not-allowed",
-        selected
+        selected && !combinedListing
           ? [available ? "border-line" : "border-line-subtle"]
           : [
               "border-transparent",
```

### Step 5: Extend the Product Media section

Update `product-media.tsx` to prepend the combined listing parent's featured image to the media list.

#### File: /app/sections/main-product/product-media.tsx

```diff
@@ -6,6 +6,7 @@ import {
 } from "~/components/product-media";
 import type { loader as productRouteLoader } from "~/routes/products/product";
 import { cn } from "~/utils/cn";
+import { isCombinedListing } from "~/utils/combined-listings";

@@ -37,6 +38,20 @@ export default function ProductMediaComponent(
   const selectedVariant = product?.selectedOrFirstAvailableVariant;

+  const combinedListing = isCombinedListing(product);
+  const media =
+    combinedListing && product?.featuredImage
+      ? [
+          {
+            __typename: "MediaImage" as const,
+            id: product.featuredImage.id,
+            mediaContentType: "IMAGE" as const,
+            alt: product.featuredImage.altText,
+            previewImage: product.featuredImage,
+            image: product.featuredImage,
+          },
+          ...(product?.media?.nodes || []),
+        ]
+      : product?.media?.nodes || [];

   return (
     <div ...>
       <ProductMedia
         ...
-        media={product?.media?.nodes || []}
+        media={media}
```

### Step 6: Show a range of prices for combined listings

Update the product prices section to show a "From ... To ..." price range, and update the product card to show price ranges.

#### File: /app/sections/main-product/product-prices.tsx

```diff
@@ -7,6 +7,7 @@ import { useLoaderData } from "react-router";
 import { VariantPrices } from "~/components/product/variant-prices";
 import type { loader as productRouteLoader } from "~/routes/products/product";
+import { isCombinedListing } from "~/utils/combined-listings";

@@ -24,11 +25,28 @@ export default function ProductPrices(props: ProductPricesProps) {
     getAdjacentAndFirstAvailableVariants(product),
   );

+  const combinedListing = isCombinedListing(product);
+
   return (
     <div ref={ref} {...rest}>
-      <VariantPrices
-        variant={selectedVariant}
-        showCompareAtPrice={showCompareAtPrice}
-        className="text-2xl/none"
-      />
+      {combinedListing ? (
+        <div className="flex gap-2 text-2xl/none">
+          <span className="flex gap-1">
+            From
+            <VariantPrices
+              variant={{ price: product.priceRange.minVariantPrice }}
+              showCompareAtPrice={false}
+            />
+          </span>
+          <span className="flex gap-1">
+            To
+            <VariantPrices
+              variant={{ price: product.priceRange.maxVariantPrice }}
+              showCompareAtPrice={false}
+            />
+          </span>
+        </div>
+      ) : (
+        <VariantPrices
+          variant={selectedVariant}
+          showCompareAtPrice={showCompareAtPrice}
+          className="text-2xl/none"
+        />
+      )}
     </div>
```

#### File: /app/components/product-card/index.tsx

```diff
@@ -22,6 +22,7 @@ import { RevealUnderline } from "~/components/reveal-underline";
 import { Spinner } from "~/components/spinner";
 import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
+import { isCombinedListing } from "~/utils/combined-listings";

@@ -270,9 +271,19 @@ export function ProductCard({
-          <div className="flex gap-1">
-            <span>From</span>
-            <Money withoutTrailingZeros data={minVariantPrice} />
-          </div>
+          {pcardShowLowestPrice || isCombinedListing(product) ? (
+            <div className="flex gap-1">
+              <span>From</span>
+              <Money withoutTrailingZeros data={minVariantPrice} />
+              {isCombinedListing(product) && (
+                <>
+                  <span>–</span>
+                  <Money withoutTrailingZeros data={maxVariantPrice} />
+                </>
+              )}
+            </div>
+          ) : (
+            <VariantPrices
+              variant={selectedVariant || firstVariant}
+              showCompareAtPrice={pcardShowSalePrice}
+            />
+          )}
```

### Step 7: (Optional) Add redirect utility to first variant of a combined listing

If you want to redirect automatically to the first variant of a combined listing when the parent handle is selected, add a redirect utility that's called whenever the parent handle is requested.

#### File: /app/.server/redirect.ts

```diff
@@ -1,4 +1,6 @@
 import { redirect } from "react-router";
+import type { ProductQuery } from "storefront-api.generated";
+import { isCombinedListing } from "~/utils/combined-listings";

 export function redirectIfHandleIsLocalized(
   request: Request,
@@ -21,3 +23,23 @@ export function redirectIfHandleIsLocalized(
     throw redirect(url.toString());
   }
 }
+
+export function redirectIfCombinedListing(
+  request: Request,
+  product: ProductQuery["product"],
+) {
+  const url = new URL(request.url);
+  let shouldRedirect = false;
+
+  if (isCombinedListing(product)) {
+    url.pathname = url.pathname.replace(
+      product.handle,
+      product.selectedOrFirstAvailableVariant?.product.handle ?? "",
+    );
+    shouldRedirect = true;
+  }
+
+  if (shouldRedirect) {
+    throw redirect(url.toString());
+  }
+}
```

### Step 8: Update GraphQL queries for combined listings

Add the `tags`, `featuredImage`, and `priceRange` fields to `PRODUCT_QUERY` and `tags` to `PRODUCT_CARD_FRAGMENT`.

#### File: /app/graphql/queries.ts

```diff
@@ -22,6 +22,18 @@ export const PRODUCT_QUERY = `#graphql
       encodedVariantExistence
       encodedVariantAvailability
+      tags
+      featuredImage {
+        id
+        url
+        altText
+      }
+      priceRange {
+        minVariantPrice {
+          amount
+          currencyCode
+        }
+        maxVariantPrice {
+          amount
+          currencyCode
+        }
+      }
       options {
```

#### File: /app/graphql/fragments.ts

```diff
@@ -82,6 +82,7 @@ export const PRODUCT_CARD_FRAGMENT = `#graphql
     handle
     vendor
+    tags
     images(first: 50) {
```

### Step 9: Filter out combined listings from product list pages

Apply the `maybeFilterOutCombinedListingsQuery` to filter combined listings from various product-listing queries.

#### File: /app/utils/featured-products.ts

The `query` variable is passed to the GraphQL query to exclude combined listing parents.

```diff
@@ -3,6 +3,7 @@ import type { FeaturedProductsQuery } from "storefront-api.generated";
 import invariant from "tiny-invariant";
 import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
+import { maybeFilterOutCombinedListingsQuery } from "~/utils/combined-listings";

@@ -13,6 +14,7 @@ export async function getFeaturedProducts(
       variables: {
         pageBy: 16,
+        query: maybeFilterOutCombinedListingsQuery,
         country: storefront.i18n.country,
```

#### File: /app/routes/products/recommended-product.ts

```diff
@@ -5,6 +5,7 @@ import invariant from "tiny-invariant";
 import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
 import type { I18nLocale } from "~/types/others";
+import { maybeFilterOutCombinedListingsQuery } from "~/utils/combined-listings";

@@ -14,6 +15,7 @@ export async function getRecommendedProducts(
       variables: {
         productId,
         count: 12,
+        query: maybeFilterOutCombinedListingsQuery,
       },
```

#### File: /app/routes/products/list.tsx

```diff
@@ -8,6 +8,7 @@ import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
 import type { SortParam } from "~/types/others";
 import { routeHeaders } from "~/utils/cache";
+import { maybeFilterOutCombinedListingsQuery } from "~/utils/combined-listings";

@@ -28,6 +29,7 @@ export async function loader({
       variables: {
         ...getPaginationVariables(request, { pageBy: 16 }),
+        query: maybeFilterOutCombinedListingsQuery,
         sortKey,
```

#### File: /app/routes/api/products.ts

In this file, the combined listings query is merged with any existing user-provided `query` parameter:

```diff
@@ -6,6 +6,7 @@ import type { ApiAllProductsQuery } from "storefront-api.generated";
 import invariant from "tiny-invariant";
 import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
+import { maybeFilterOutCombinedListingsQuery } from "~/utils/combined-listings";

@@ -47,8 +48,12 @@ export async function loader({
+  const combinedQuery = [maybeFilterOutCombinedListingsQuery, query]
+    .filter(Boolean)
+    .join(" ");
+
   const { products } = await storefront.query<ApiAllProductsQuery>(
     API_ALL_PRODUCTS_QUERY,
     {
       variables: {
         count,
-        query,
+        query: combinedQuery,
```

### Step 10: Filter combined listings on the client side

For collection pages where server-side GraphQL query filtering is not possible, filter combined listings after data is loaded.

#### File: /app/components/product-grid/products-loaded-on-scroll.tsx

```diff
@@ -3,6 +3,10 @@ import { useNavigate } from "react-router";
 import type { ProductCardFragment } from "storefront-api.generated";
 import { ProductCard } from "~/components/product-card";
+import {
+  COMBINED_LISTINGS_CONFIGS,
+  isCombinedListing,
+} from "~/utils/combined-listings";

@@ -61,7 +65,14 @@ export function ProductsLoadedOnScroll({
     >
-      {nodes.map((product, index) => (
+      {nodes
+        .filter(
+          (product) =>
+            !(
+              COMBINED_LISTINGS_CONFIGS.hideCombinedListingsFromProductList &&
+              isCombinedListing(product)
+            ),
+        )
+        .map((product, index) => (
           <ProductCard
             key={product.id}
             product={product}
```

### Step 11: Update the product page route

Update the product page route to handle combined listings: redirect to child if configured, skip URL param syncing, and pass combined listing state to Weaverse sections.

#### File: /app/routes/products/product.tsx

```diff
@@ -11,6 +11,14 @@ import type { ProductQuery } from "storefront-api.generated";
 import invariant from "tiny-invariant";
-import { redirectIfHandleIsLocalized } from "~/.server/redirect";
+import {
+  redirectIfCombinedListing,
+  redirectIfHandleIsLocalized,
+} from "~/.server/redirect";
 import { seoPayload } from "~/.server/seo";
 import { PRODUCT_QUERY } from "~/graphql/queries";
 import { routeHeaders } from "~/utils/cache";
+import {
+  COMBINED_LISTINGS_CONFIGS,
+  isCombinedListing,
+} from "~/utils/combined-listings";
 import { WeaverseContent } from "~/weaverse";

@@ -52,6 +60,10 @@ export async function loader({ params, request, context }: LoaderFunctionArgs) {
   redirectIfHandleIsLocalized(request, { handle, data: product });

+  if (COMBINED_LISTINGS_CONFIGS.redirectToFirstVariant) {
+    redirectIfCombinedListing(request, product);
+  }
+
   return {
     shop,
     product,

@@ -78,12 +90,14 @@ export default function Product() {
   const { product } = useLoaderData<typeof loader>();
+  const combinedListing = isCombinedListing(product);

   const selectedVariant = useOptimisticVariant(
     product.selectedOrFirstAvailableVariant,
     getAdjacentAndFirstAvailableVariants(product),
   );

   useEffect(() => {
-    if (!selectedVariant?.selectedOptions) {
+    if (!selectedVariant?.selectedOptions || combinedListing) {
       return;
     }
     // ... URL param sync logic unchanged ...
-  }, [selectedVariant?.selectedOptions]);
+  }, [selectedVariant?.selectedOptions, combinedListing]);
```

</recipe_implementation>

---

Follow this recipe to implement this feature.
