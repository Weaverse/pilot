# Feature: Fix VariantSelector State Bug

| Field            | Value                                |
| ---------------- | ------------------------------------ |
| **Status**       | `completed`                          |
| **Owner**        | @hta218                              |
| **Created**      | 2026-03-20                           |
| **Last Updated** | 2026-03-20                           |

## Original Prompt

> The @app/components/product/variant-selector.tsx works incorrectly on single product section @app/sections/single-product/ and @app/components/product-card/quick-shop.tsx modal, but correctly on product page @app/sections/main-product/.
> For e.g:
> - when a product has 2 options: Color & Size
> - if select the 2nd color and select any size the selected variant automatically change to 1st color
>
> Fix approach: Option A — find the correct variant by matching all currently selected options with only the clicked option changed, instead of using `firstSelectableVariant` blindly.

## Summary

When `VariantSelector` is used with React `useState` + `onVariantChange` (in `single-product` section and `quick-shop` modal), clicking an option value calls `onVariantChange(firstSelectableVariant)`. `firstSelectableVariant` is the first variant in the product that has that option value — it ignores all other currently selected options. This causes the variant to jump back to the first color when changing size. The fix resolves the correct adjacent variant by matching all current selections with only the clicked option changed.
