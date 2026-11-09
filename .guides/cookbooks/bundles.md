# Overview

This prompt describes "Bundles" in the **Pilot theme** — a Weaverse-powered storefront on Hydrogen 2026.10, React Router 7 and Tailwind CSS v4. Pilot already supports product bundles out of the box; the recipe below explains where that support lives and adds one optional extra (a bundle badge on cart lines).
If there are any prerequisites, the recipe below will explain them; if the user is trying to implement the feature described in this recipe, make sure to prominently mention the prerequisites and any other preliminary instructions, as well as followups.
If the user is asking on how to implement the feature from scratch, please first describe the feature in a general way before jumping into the implementation details.

# AI model verification steps

- Run `npm run typecheck` after changing code or GraphQL documents. It validates the documents against the bundled Storefront API schema (`hydrogen gql check --fail-on-warn`); there is no codegen step.
- Fields read in the cart must be in Pilot's `CART_FRAGMENT` (`app/.server/cart.ts`): Hydrogen merges it into every cart query and mutation, and the cart store's types (`CartLineData` in `app/components/cart/cart-store.ts`) are inferred from it.

# Summary

Display product bundles on your Pilot storefront.

# User Intent Recognition

<user_queries>
- How do I show product bundles on my Hydrogen storefront?
- How do I add badges to bundled products on my Hydrogen storefront?
- How do I display product bundles on applicable line items in the cart?
- How do I detect if a product is a bundle?
</user_queries>

# Troubleshooting

<troubleshooting>
- **Issue**: I'm not seeing product bundles on my storefront.
  **Solution**: Make sure you've installed the Shopify Bundles app and set up product bundles in your Shopify admin.
- **Issue**: I'm not seeing the bundle badge on product cards.
  **Solution**: Check the **Show bundle badge** theme setting (Product cards → Badges) in Weaverse Studio.
- **Issue**: The "Bundled variants" block doesn't show on the product page.
  **Solution**: Add the **Bundled variants** block to the main product section in Weaverse Studio. It renders only for bundle products.
</troubleshooting>

# Recipe Implementation

<recipe_implementation>

## Description

A product is a bundle when its variant `requiresComponents`. Pilot reads that flag and shows bundle-specific UI on product cards, the product page, quick shop and the single-product section. Merchants control the copy and colors in Weaverse Studio.

## Requirements

To use product bundles, you need to install a bundles app in your Shopify admin.
In this recipe, we'll use the [Shopify Bundles app](https://apps.shopify.com/shopify-bundles).

## What Pilot already ships

| Where | File | What it does |
|-------|------|--------------|
| Product query | `app/graphql/queries.ts` (`PRODUCT_QUERY`) | `isBundle: selectedOrFirstAvailableVariant(...)` selects `requiresComponents`, the bundle's `components` and `groupedBy` |
| Product card fragment | `app/graphql/fragments.ts` (`PRODUCT_CARD_FRAGMENT`) | `isBundle { requiresComponents }` |
| Variant fragment | `app/graphql/fragments.ts` (`PRODUCT_VARIANT_FRAGMENT`) | `requiresComponents`, `components`, `groupedBy` |
| Cart fragment | `app/.server/cart.ts` (`CART_FRAGMENT`) | `requiresComponents` and `components` on each line's merchandise |
| Badge | `app/components/product/badges.tsx` | `BundleBadge`, also rendered by `ProductBadges` (product page and quick shop) |
| Product card | `app/components/product-card/index.tsx` | Bundle badge, gated by the `pcardShowBundleBadge` theme setting |
| Product page | `app/sections/main-product/product-bundled-variants.tsx` | "Bundled variants" block listing the bundle's components (`app/components/product/bundled-variants.tsx`) |
| Product page | `app/sections/main-product/buy-buttons/index.tsx`, `buy-buttons/sticky-atc-bar.tsx` | "Add bundle to cart" text (`addBundleToCartText` setting) |
| Single-product section | `app/sections/single-product/index.tsx` | Bundle components and "Add bundle to cart" |

Studio settings:

- **Theme settings → Product badges → Bundle**: badge color (`bundleBadgeColor`).
- **Theme settings → Product cards → Show bundle badge** (`pcardShowBundleBadge`).
- **Product page → Buy buttons → Bundle add to cart text** (`addBundleToCartText`).
- **Product page → Bundled variants → Heading text**.

## Steps

### Step 1: Set up the Shopify Bundles app

1. Install the [Shopify Bundles app](https://apps.shopify.com/shopify-bundles) in your Shopify admin.

2. Make sure your store meets the [eligibility requirements](https://help.shopify.com/en/manual/products/bundles/eligibility-and-considerations).

3. From the [**Bundles**](https://admin.shopify.com/apps/shopify-bundles/app) page, [create a new bundle](https://help.shopify.com/en/manual/products/bundles/shopify-bundles).

### Step 2: Show the bundle on the product page

In Weaverse Studio, open a bundle product's page and add the **Bundled variants** block to the main product section. Product cards and the buy buttons need no setup.

### Step 3: (Optional) Show a bundle badge on cart lines

The cart fragment already selects `requiresComponents`, so the cart line only has to render the badge with the theme's badge settings.

#### File: app/components/cart/cart-line-item.tsx

```diff
@@ -1,12 +1,15 @@
+import { useThemeSettings } from "@weaverse/hydrogen/react-router";
 import clsx from "clsx";
 import { useId } from "react";
 import { Icon } from "~/components/icon";
 import { Image } from "~/components/image";
 import { Link } from "~/components/link";
 import { Money } from "~/components/money";
+import { BundleBadge } from "~/components/product/badges";
 import { RevealUnderline } from "~/components/reveal-underline";
 import { Skeleton } from "~/components/skeleton";
 import type { CartLayoutType } from "~/types/others";
+import type { ThemeSettings } from "~/types/weaverse";
 import { lineDiscountTotal, toMoney } from "~/utils/cart";
 import { calculateAspectRatio } from "~/utils/image";
 import { CartLineQuantityAdjust } from "./cart-line-qty-adjust";
@@ -46,6 +49,8 @@ export function CartLineItem({
   const isPending = useCart((state) => state.pending.lines.has(line.id));
   const lineError = useCart((state) => state.errors.lines.get(line.id));
   const errorMessage = lineError?.userErrors[0]?.message;
+  const { colorText, colorTextInverse, badgeTextTransform, bundleBadgeColor } =
+    useThemeSettings<ThemeSettings>();
   const { quantity, merchandise } = line;
 
   if (typeof quantity === "undefined" || !merchandise?.product) {
@@ -89,6 +94,13 @@ export function CartLineItem({
             ) : (
               <h5 className="text-base">{product.title || ""}</h5>
             )}
+            {merchandise.requiresComponents && (
+              <BundleBadge
+                badgeStyle={{ colorText, colorTextInverse, badgeTextTransform }}
+                bundleBadgeColor={bundleBadgeColor}
+                className="w-fit"
+              />
+            )}
             {!isDefaultVariant(selectedOptions) && (
               <div className="space-y-0.5 text-sm text-gray-500">{title}</div>
             )}
```

To read more bundle fields in the cart (for example the components' titles), add them to `CART_FRAGMENT` in `app/.server/cart.ts`.

### Step 4: Verify

```bash
npm run typecheck
```

</recipe_implementation>

---

Follow this recipe to implement this feature.
