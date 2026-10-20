# Feature: Dynamic Element Labels

| Field            | Value                         |
| ---------------- | ----------------------------- |
| **Status**       | in-progress                   |
| **Owner**        | @hta218                       |
| **Branch**       | `feat/dynamic-element-labels` |
| **Created**      | 2026-09-30                    |
| **Last Updated** | 2026-09-30                    |

## Initiating Requirement

> Opt a narrow set of existing Pilot components into the Weaverse schema
> `label` callback so Studio can name each element instance by its own
> plain-text content, using only explicitly annotated callbacks of the form
> `label: (data: HeadingProps) => data.content`.
>
> - Upgrade the declared minimum of `@weaverse/hydrogen` from `^5.21.2` to
>   `^5.22.0` (which uses `@weaverse/schema` 0.17.0) with a matching
>   `package-lock.json`, using npm and the public registry.
> - Initial opt-in set:
>   1. `app/components/heading.tsx` → `HeadingProps.content`
>   2. `app/components/subheading.tsx` → `SubHeadingProps.content`
>   3. `app/sections/testimonials/item.tsx` → `TestimonialItemProps.heading`
>   4. `app/sections/main-product/product-highlight-item.tsx` →
>      `HighlightItemProps.text`
>   5. `app/sections/columns-with-images/column.tsx` → the column's `heading`
> - Keep `schema.title` unchanged for Add menus and as the fallback. Reuse the
>   existing props types; add no exports only for tests.
> - No generic `createSchema<T>`, no `condition` changes, no global key
>   detection or config, no new settings or UI, and no runtime, loader, layout,
>   or translation changes. The Weaverse bridge owns fallback and
>   preview-language data; each callback only reads its own existing field.
> - Out of scope: slides and other containers without their own text field
>   (a slide heading is a child), richtext paragraphs (no HTML parsing), and
>   team members (a container fed by parent loader data).
> - Regenerate the component manifest and commit only genuine generated
>   differences; the label callback need not be serialized into it.

## Summary

Five components declare a `label` callback that returns their own plain-text
field, so Studio's layer tree can show "Summer sale" instead of five identical
"Heading" rows. Storefront rendering is unchanged; Studio falls back to
`title` when the callback returns an empty value.
