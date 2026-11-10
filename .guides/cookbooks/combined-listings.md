# Overview

This prompt describes how to implement "Combined Listings" in the **Pilot theme** — a Weaverse-powered storefront on Hydrogen 2026.10 (`@shopify/hydrogen` as a request-handler library), React Router 7 and Tailwind CSS v4. Below is a "recipe" that contains the steps to apply to the Pilot theme to achieve the desired outcome.
If there are any prerequisites, the recipe below will explain them; if the user is trying to implement the feature described in this recipe, make sure to prominently mention the prerequisites and any other preliminary instructions, as well as followups.
If the user is asking on how to implement the feature from scratch, please first describe the feature in a general way before jumping into the implementation details.
Please note that the recipe steps below are not necessarily ordered in the way they should be executed, as it depends on the user's needs and the specific details of the project. The recipe steps descriptions should allow you to understand what is required to be done in a certain order and what is not.

**Key Pilot architecture notes:**
- Product page parts are separate Weaverse sections in `app/sections/main-product/` (buy buttons, quantity selector, variant selector, prices, media). Each has its own `createSchema` export and default export.
- Every product form reads the selection from Hydrogen's product store: the product route renders `ProductProvider` (`app/components/product/product-form.tsx`, built with `createProductComponents` from `@shopify/hydrogen/react`), and sections read it with `useProduct()`, `useProductForm()` and `useSelectedVariant(product)`.
- GraphQL documents are `gql()` documents run with `storefront.graphql(doc, { variables, cache })`. Result types are inferred from the documents (`ProductQuery` in `~/graphql/queries`, `ProductCardFragment` in `~/graphql/fragments`); there is no codegen step.
- Don't pass `country`/`language` in `variables`: the client injects them.
- Pilot uses semicolons and double quotes.

**Already built into Pilot:** option values that belong to another product of a combined listing link to that product (`app/components/product/product-option-values.tsx`, where `value.handle !== product.handle`). This recipe adds what Pilot leaves out: detecting the parent product, hiding it from product lists, and rendering its page as a listing rather than a purchasable product.

# AI model verification steps

- Run `npm run typecheck` after applying the recipe. It runs `react-router typegen`, `tsc` and `hydrogen gql check --fail-on-warn`, which validates the GraphQL fields added below.
- Never call hooks after an early `return` in a section: guard after the last hook, as the steps below do.

# Summary

Handle combined listings on product pages and in product lists.

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
  **Solution**: Make sure to tag combined listing parent products in the Shopify admin (the tag in `COMBINED_LISTINGS_CONFIGS.combinedListingTag`) and that `hideCombinedListingsFromProductList` is `true`.
- **Issue**: The parent product page still shows Add to cart.
  **Solution**: `isCombinedListing()` reads `product.tags`. Check that `tags` was added to `PRODUCT_QUERY` (product page) and `PRODUCT_CARD_FRAGMENT` (cards and lists).
</troubleshooting>

# Recipe Implementation

Here's the combined-listings recipe for the Pilot theme:

<recipe_implementation>

## Description

This recipe lets you more precisely display and manage [combined listings](https://help.shopify.com/en/manual/products/combined-listings-app) on product pages and in product lists for your Pilot storefront. A combined listing groups separate products together into a single product listing using a shared option like color or size.
Each product appears as a variant but can have its own title, description, URL, and images.
In this recipe, you'll make the following changes:

1. Set up the Combined Listings app in your Shopify admin and group relevant products together as combined listings.
2. Add a configuration and helper file.
3. Query the parent's tags (and the featured image size).
4. Hide the buy buttons and quantity selector, and the "selected" state of option values, for parent products.
5. Prepend the parent's featured image to the product media.
6. Show a range of prices for parents on the product page and product cards.
7. Optionally redirect the parent page to its first child product.
8. Filter parents out of product lists.

## Requirements

- Your store must be on either a [Shopify Plus](https://www.shopify.com/plus) or enterprise plan.
- Your store must have the [Combined Listings app](https://admin.shopify.com/apps/combined-listings) installed.

## New files added to the template by this recipe

- `app/utils/combined-listings.ts`

## Steps

### Step 1: Set up the Combined Listings app

1. Install the [Combined Listings app](https://admin.shopify.com/apps/combined-listings).

2. [Create combined listing products in your store](https://help.shopify.com/en/manual/products/combined-listings-app#creating-a-combined-listing).

3. Add a tag to the parent products of combined listings to mark them (for example `combined`).

### Step 2: Add the combined listings helpers

Create `app/utils/combined-listings.ts`. Edit `COMBINED_LISTINGS_CONFIGS` to customize the behavior.

#### File: app/utils/combined-listings.ts

```ts
// Edit these values to customize combined listings' behavior
export const COMBINED_LISTINGS_CONFIGS = {
  // If true, loading a parent product page redirects to its first variant's product
  redirectToFirstVariant: false,
  // The tag that marks the parent product of a combined listing
  combinedListingTag: "combined",
  // If true, combined listing parents are hidden from product lists
  hideCombinedListingsFromProductList: true,
};

/** A Storefront API `query` filter that drops combined listing parents. */
export const maybeFilterOutCombinedListingsQuery =
  COMBINED_LISTINGS_CONFIGS.hideCombinedListingsFromProductList
    ? `NOT tag:${COMBINED_LISTINGS_CONFIGS.combinedListingTag}`
    : "";

/** Whether `product` is the parent product of a combined listing. */
export function isCombinedListing(product: unknown): boolean {
  if (!product || typeof product !== "object" || !("tags" in product)) {
    return false;
  }
  const { tags } = product;
  return (
    Array.isArray(tags) &&
    tags.includes(COMBINED_LISTINGS_CONFIGS.combinedListingTag)
  );
}
```

### Step 3: Query the tags

Add `tags` to the product page query and the product card fragment. The featured image also needs its size so it can be rendered as a media item (Step 5). `PRODUCT_QUERY` already selects `priceRange`.

#### File: app/graphql/queries.ts

```diff
@@ -25,10 +25,13 @@ export const PRODUCT_QUERY = gql(
       requiresSellingPlan
       encodedVariantExistence
       encodedVariantAvailability
+      tags
       featuredImage {
         id
         url
         altText
+        width
+        height
       }
       priceRange {
         minVariantPrice {
```

#### File: app/graphql/fragments.ts

```diff
@@ -91,6 +91,7 @@ export const PRODUCT_CARD_FRAGMENT = gql(
     publishedAt
     handle
     vendor
+    tags
     images(first: 50) {
       nodes {
         id
```

### Step 4: Hide the buy buttons and the selected state for parents

A parent product isn't purchasable: shoppers pick a child product through the variant selector, whose values already link to the child products. The sticky add-to-cart bar is rendered by the buy buttons section, so it's hidden too. Return after the section's hooks, never before them.

#### File: app/sections/main-product/buy-buttons/index.tsx

```diff
@@ -9,6 +9,7 @@ import { AddToCartButton } from "~/components/product/add-to-cart-button";
 import { ProductShopPayButton } from "~/components/product/shop-pay-button";
 import { useSelectedVariant } from "~/components/product/product-form";
 import type { loader as productRouteLoader } from "~/routes/products/product";
+import { isCombinedListing } from "~/utils/combined-listings";
 import { useProductQuantity } from "../product-quantity-selector";
 import { StickyATCBar } from "./sticky-atc-bar";
 import { useATCVisibilityStore } from "./store";
@@ -57,6 +58,12 @@ export default function ProductATCButtons(props: ProductATCButtonsProps) {
 
   const selectedVariant = useSelectedVariant(product);
 
+  // A combined listing parent isn't purchasable: shoppers pick a child
+  // product through the variant selector. Also hides the sticky bar.
+  if (isCombinedListing(product)) {
+    return null;
+  }
+
   const isBundle = Boolean(product.isBundle?.requiresComponents);
 
   let atcButtonText = "Add to cart";
```

#### File: app/sections/main-product/product-quantity-selector.tsx

```diff
@@ -7,6 +7,7 @@ import { useLoaderData } from "react-router";
 import { create } from "zustand";
 import { Quantity } from "~/components/product/quantity";
 import type { loader as productRouteLoader } from "~/routes/products/product";
+import { isCombinedListing } from "~/utils/combined-listings";
 
 /**
  * The quantity chosen on the product page, and the product it belongs to.
@@ -75,7 +76,7 @@ export default function ProductQuantitySelector(
   const { product } = useLoaderData<typeof productRouteLoader>();
   const { quantity, setQuantity } = useProductQuantity(product?.id);
 
-  if (!product) {
+  if (!product || isCombinedListing(product)) {
     return null;
   }
 
```

A parent has no variant of its own, so no option value should look selected and the option legend shouldn't name one.

#### File: app/components/product/product-option-values.tsx

```diff
@@ -12,6 +12,7 @@ import {
 import { ShopifyImage } from "~/components/shopify-image";
 import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
 import { cn } from "~/utils/cn";
+import { isCombinedListing } from "~/utils/combined-listings";
 import { localizePath, resolveLocale } from "~/utils/locale";
 import { isLightColor, isValidColor } from "~/utils/misc";
 
@@ -258,7 +259,9 @@ function getOptionValueAppearance(
   optionName: string,
   value: OptionValueState,
 ): { className: string; label?: string; children: ReactNode } {
-  const { name, selected, available, exists, swatch } = value;
+  const { name, available, exists, swatch } = value;
+  // A combined listing parent has no variant of its own to mark as selected.
+  const selected = value.selected && !isCombinedListing(product);
 
   if (OPTIONS_AS_SWATCH.includes(optionName)) {
     const swatchColor = swatch?.color || name;
```

#### File: app/sections/main-product/variants.tsx

```diff
@@ -4,6 +4,7 @@ import {
   useProduct,
 } from "~/components/product/product-form";
 import { ScrollReveal } from "~/components/scroll-reveal";
+import { isCombinedListing } from "~/utils/combined-listings";
 import { hasOnlyDefaultVariant } from "~/utils/product";
 
 /**
@@ -13,6 +14,7 @@ import { hasOnlyDefaultVariant } from "~/utils/product";
  */
 export function ProductVariants({ product }: { product: ProductFormData }) {
   const { options } = useProduct();
+  const combinedListing = isCombinedListing(product);
 
   if (hasOnlyDefaultVariant(product.options)) {
     return null;
@@ -21,7 +23,9 @@ export function ProductVariants({ product }: { product: ProductFormData }) {
   return (
     <ScrollReveal className="product-form space-y-5">
       {options.map((option) => {
-        const selected = option.values.find((value) => value.selected);
+        const selected = combinedListing
+          ? undefined
+          : option.values.find((value) => value.selected);
         return (
           <div className="product-options space-y-2" key={option.name}>
             <legend className="leading-tight">
```

### Step 5: Prepend the parent's featured image

#### File: app/sections/main-product/product-media.tsx

```diff
@@ -10,6 +10,7 @@ import {
 import { useSelectedVariant } from "~/components/product/product-form";
 import type { loader as productRouteLoader } from "~/routes/products/product";
 import { cn } from "~/utils/cn";
+import { isCombinedListing } from "~/utils/combined-listings";
 
 interface ProductMediaComponentProps
   extends
@@ -38,7 +39,23 @@ export default function ProductMediaComponent(
   const { product } = useLoaderData<typeof productRouteLoader>();
 
   const selectedVariant = useSelectedVariant(product);
-  const media = product?.media?.nodes || [];
+  const productMedia = product?.media?.nodes || [];
+  // Show a combined listing parent's own featured image first.
+  const featuredImage = product?.featuredImage;
+  const media =
+    isCombinedListing(product) && featuredImage
+      ? [
+          {
+            __typename: "MediaImage" as const,
+            mediaContentType: "IMAGE" as const,
+            id: featuredImage.id ?? "featured-image",
+            alt: featuredImage.altText,
+            previewImage: featuredImage,
+            image: featuredImage,
+          },
+          ...productMedia,
+        ]
+      : productMedia;
 
   return (
     <div
```

### Step 6: Show a range of prices

#### File: app/sections/main-product/product-prices.tsx

```diff
@@ -6,6 +6,7 @@ import { useLoaderData } from "react-router";
 import { useSelectedVariant } from "~/components/product/product-form";
 import { VariantPrices } from "~/components/product/variant-prices";
 import type { loader as productRouteLoader } from "~/routes/products/product";
+import { isCombinedListing } from "~/utils/combined-listings";
 
 interface ProductPricesProps extends WeaverseComponentProps {
   showCompareAtPrice: boolean;
@@ -16,6 +17,28 @@ export default function ProductPrices(props: ProductPricesProps) {
   const { product } = useLoaderData<typeof productRouteLoader>();
   const selectedVariant = useSelectedVariant(product);
 
+  if (isCombinedListing(product)) {
+    const { minVariantPrice, maxVariantPrice } = product.priceRange;
+    return (
+      <div {...rest} className="flex gap-2 text-2xl/none">
+        <span className="flex gap-1">
+          From
+          <VariantPrices
+            variant={{ price: minVariantPrice }}
+            showCompareAtPrice={false}
+          />
+        </span>
+        <span className="flex gap-1">
+          To
+          <VariantPrices
+            variant={{ price: maxVariantPrice }}
+            showCompareAtPrice={false}
+          />
+        </span>
+      </div>
+    );
+  }
+
   return (
     <div {...rest}>
       <VariantPrices
```

#### File: app/components/product-card/index.tsx

```diff
@@ -27,6 +27,7 @@ import type {
 import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
 import JudgemeStarsRating from "~/sections/main-product/judgeme-stars-rating";
 import type { ThemeSettings } from "~/types/weaverse";
+import { isCombinedListing } from "~/utils/combined-listings";
 import { calculateAspectRatio } from "~/utils/image";
 import { ProductCardOptions } from "./product-card-options";
 import { QuickShopTrigger } from "./quick-shop";
@@ -264,10 +265,16 @@ export function ProductCard({
               {product.title}
             </RevealUnderline>
           </Link>
-          {pcardShowLowestPrice ? (
+          {pcardShowLowestPrice || isCombinedListing(product) ? (
             <div className="flex gap-1">
               <span>From</span>
               <Money withoutTrailingZeros data={minVariantPrice} />
+              {isCombinedListing(product) && (
+                <>
+                  <span>–</span>
+                  <Money withoutTrailingZeros data={maxVariantPrice} />
+                </>
+              )}
             </div>
           ) : (
             <VariantPrices
```

### Step 7: (Optional) Redirect parents to their first child product

When `redirectToFirstVariant` is `true`, the parent's page redirects to the product of its first available variant.

#### File: app/.server/redirect.ts

```diff
@@ -1,4 +1,6 @@
 import { redirect } from "react-router";
+import type { ProductQuery } from "~/graphql/queries";
+import { isCombinedListing } from "~/utils/combined-listings";
 
 export function redirectIfHandleIsLocalized(
   request: Request,
@@ -21,3 +23,20 @@ export function redirectIfHandleIsLocalized(
     throw redirect(url.toString());
   }
 }
+
+/**
+ * Sends a combined listing parent's page to the product of its first
+ * available variant (one of the listing's child products).
+ */
+export function redirectIfCombinedListing(
+  request: Request,
+  product: NonNullable<ProductQuery["product"]>,
+) {
+  const childHandle = product.selectedOrFirstAvailableVariant?.product?.handle;
+  if (!isCombinedListing(product) || !childHandle) {
+    return;
+  }
+  const url = new URL(request.url);
+  url.pathname = url.pathname.replace(product.handle, childHandle);
+  throw redirect(url.toString());
+}
```

The product route calls it, and stops writing the variant's options into the parent's URL: a parent's `selectedOrFirstAvailableVariant` belongs to a child product.

#### File: app/routes/products/product.tsx

```diff
@@ -7,7 +7,10 @@ import { useEffect, useState } from "react";
 import type { LoaderFunctionArgs, MetaArgs } from "react-router";
 import { useLoaderData, useLocation, useNavigate } from "react-router";
 import invariant from "tiny-invariant";
-import { redirectIfHandleIsLocalized } from "~/.server/redirect";
+import {
+  redirectIfCombinedListing,
+  redirectIfHandleIsLocalized,
+} from "~/.server/redirect";
 import { seoPayload } from "~/.server/seo";
 import {
   type ProductFormData,
@@ -18,6 +21,10 @@ import {
 import { ProductView } from "~/components/root/analytics-views";
 import { PRODUCT_QUERY } from "~/graphql/queries";
 import { CACHE_DEFAULT, routeHeaders } from "~/utils/cache";
+import {
+  COMBINED_LISTINGS_CONFIGS,
+  isCombinedListing,
+} from "~/utils/combined-listings";
 import { localizePath, resolveLocale } from "~/utils/locale";
 import { seoMetaFromMatches } from "~/utils/seo";
 import { unwrapStorefront } from "~/utils/storefront";
@@ -48,6 +55,9 @@ export async function loader({ params, request, context }: LoaderFunctionArgs) {
     throw new Response("product", { status: 404 });
   }
   redirectIfHandleIsLocalized(request, { handle, data: product });
+  if (COMBINED_LISTINGS_CONFIGS.redirectToFirstVariant) {
+    redirectIfCombinedListing(request, product);
+  }
 
   // Use Hydrogen/Remix streaming for recommended products
   const recommended = getRecommendedProducts(storefront, product.id);
@@ -161,9 +171,12 @@ function ProductAnalytics({ product }: { product: ProductFormData }) {
  */
 function useSyncSelectionToUrl(product: ProductFormData) {
   const variant = product.selectedOrFirstAvailableVariant;
+  // A combined listing parent's variant belongs to a child product, so its
+  // options don't describe the parent's URL.
+  const combinedListing = isCombinedListing(product);
 
   useEffect(() => {
-    if (!variant) {
+    if (!variant || combinedListing) {
       return;
     }
     const url = new URL(window.location.href);
@@ -183,5 +196,5 @@ function useSyncSelectionToUrl(product: ProductFormData) {
       "",
       `${url.pathname}?${params}${url.hash}`,
     );
-  }, [variant, product.options]);
+  }, [variant, product.options, combinedListing]);
 }
```

### Step 8: Filter parents out of product lists

Pass `maybeFilterOutCombinedListingsQuery` as the `query` of the product list queries. `FEATURED_PRODUCTS_QUERY` (best sellers, used by the featured products section, cart, account, search and 404 recommendations) needs a `$query` variable first; the other queries already declare one.

#### File: app/utils/featured-products.ts

```diff
@@ -6,6 +6,7 @@ import {
 } from "@shopify/hydrogen";
 import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
 import { CACHE_DEFAULT } from "~/utils/cache";
+import { maybeFilterOutCombinedListingsQuery } from "~/utils/combined-listings";
 import { unwrapStorefront } from "~/utils/storefront";
 
 /**
@@ -18,7 +19,7 @@ export async function getFeaturedProducts(
 ) {
   return unwrapStorefront(
     await storefront.graphql(FEATURED_PRODUCTS_QUERY, {
-      variables: { pageBy: 16 },
+      variables: { pageBy: 16, query: maybeFilterOutCombinedListingsQuery },
       cache: CACHE_DEFAULT,
     }),
   );
@@ -34,8 +35,13 @@ export const FEATURED_PRODUCTS_QUERY = gql(
     $country: CountryCode
     $language: LanguageCode
     $pageBy: Int = 16
+    $query: String
   ) @inContext(country: $country, language: $language) {
-    featuredProducts: products(first: $pageBy, sortKey: BEST_SELLING) {
+    featuredProducts: products(
+      first: $pageBy
+      sortKey: BEST_SELLING
+      query: $query
+    ) {
       nodes {
         ...ProductCard
       }
```

#### File: app/routes/products/recommended-product.ts

```diff
@@ -2,6 +2,7 @@ import { gql } from "@shopify/hydrogen";
 import type { Storefront } from "~/.server/storefront";
 import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
 import { CACHE_DEFAULT } from "~/utils/cache";
+import { maybeFilterOutCombinedListingsQuery } from "~/utils/combined-listings";
 import { unwrapStorefront } from "~/utils/storefront";
 
 export async function getRecommendedProducts(
@@ -13,6 +14,7 @@ export async function getRecommendedProducts(
       variables: {
         productId,
         count: 12,
+        query: maybeFilterOutCombinedListingsQuery,
       },
       cache: CACHE_DEFAULT,
     }),
```

#### File: app/routes/products/list.tsx

```diff
@@ -13,6 +13,7 @@ import { CollectionBrowseProvider } from "~/components/product-grid/collection-browse";
 import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
 import { getLegacyBrowseRedirect } from "~/routes/collections/utils";
 import { CACHE_DEFAULT, routeHeaders } from "~/utils/cache";
+import { maybeFilterOutCombinedListingsQuery } from "~/utils/combined-listings";
 import { getPaginationVariables } from "~/utils/pagination";
 import { seoMetaFromMatches } from "~/utils/seo";
 import { unwrapStorefront } from "~/utils/storefront";
@@ -37,6 +38,7 @@ export async function loader({
       .graphql(ALL_PRODUCTS_QUERY, {
         variables: {
           ...getPaginationVariables(request, { pageBy: 16 }),
+          query: maybeFilterOutCombinedListingsQuery,
           sortKey: toProductSortKey(browse.sortKey),
           reverse: browse.reverse,
         },
```

In the products API route, the filter is merged with the caller's `query` parameter:

#### File: app/routes/api/products.ts

```diff
@@ -5,6 +5,7 @@ import { data } from "react-router";
 import invariant from "tiny-invariant";
 import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
 import { CACHE_LONG } from "~/utils/cache";
+import { maybeFilterOutCombinedListingsQuery } from "~/utils/combined-listings";
 import { unwrapStorefront } from "~/utils/storefront";
 
 /**
@@ -48,7 +49,14 @@ export async function loader({
 
   const { products } = unwrapStorefront(
     await storefront.graphql(API_ALL_PRODUCTS_QUERY, {
-      variables: { count, query, reverse, sortKey },
+      variables: {
+        count,
+        query: [maybeFilterOutCombinedListingsQuery, query]
+          .filter(Boolean)
+          .join(" "),
+        reverse,
+        sortKey,
+      },
       cache: CACHE_LONG,
     }),
   );
```

Collection product queries can't exclude a tag, so the collection grid drops parents after loading:

#### File: app/components/product-grid/products-loaded-on-scroll.tsx

```diff
@@ -2,6 +2,10 @@ import { useEffect } from "react";
 import { useNavigate } from "react-router";
 import type { ProductCardFragment } from "~/graphql/fragments";
 import { ProductCard } from "~/components/product-card";
+import {
+  COMBINED_LISTINGS_CONFIGS,
+  isCombinedListing,
+} from "~/utils/combined-listings";
 import { useProductGridStore } from "./store";
 
 interface ProductsLoadedOnScrollProps {
@@ -26,11 +30,15 @@ export function ProductsLoadedOnScroll({
   gapY,
 }: ProductsLoadedOnScrollProps) {
   const navigate = useNavigate();
+  // Collection queries can't exclude a tag, so parents are dropped here.
+  const products = COMBINED_LISTINGS_CONFIGS.hideCombinedListingsFromProductList
+    ? nodes.filter((product) => !isCombinedListing(product))
+    : nodes;
   let setDisplayedCount = useProductGridStore((s) => s.setDisplayedCount);
 
   useEffect(() => {
-    setDisplayedCount(nodes.length);
-  }, [nodes.length, setDisplayedCount]);
+    setDisplayedCount(products.length);
+  }, [products.length, setDisplayedCount]);
 
   useEffect(() => {
     if (inView && hasNextPage) {
@@ -53,7 +61,7 @@ export function ProductsLoadedOnScroll({
       }
       className="grid w-full grid-cols-[repeat(auto-fill,minmax(var(--min-card-width),1fr))]"
     >
-      {nodes.map((product, index) => (
+      {products.map((product, index) => (
         <ProductCard
           key={product.id}
           product={product}
```

### Step 9: Verify

```bash
npm run typecheck
```

## Not covered

- Quick shop (`app/components/product-card/quick-shop.tsx`) and the single-product section (`app/sections/single-product/index.tsx`) still render their add-to-cart button for a parent. Apply the same `isCombinedListing(product)` guard there if parents can appear in them.
- The search page and predictive search don't filter parents.

</recipe_implementation>

---

Follow this recipe to implement this feature.
