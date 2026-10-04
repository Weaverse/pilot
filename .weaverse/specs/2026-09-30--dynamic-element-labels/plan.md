# Plan

## Approach

Each opted-in schema gains one line next to its unchanged `title`:

```ts
label: (data: HeadingProps) => data.content,
```

`@weaverse/schema` 0.17.0 types `label` as a method taking the element data and
returning `string | null | undefined`, so the existing props type is accepted
without a cast or a generic `createSchema`. The callback never mutates data and
does no fallback of its own — Studio uses `title` when it returns nothing.

## Files Touched

- `package.json`, `package-lock.json` — `@weaverse/hydrogen` `^5.22.0`
- `app/components/heading.tsx`
- `app/components/subheading.tsx`
- `app/sections/testimonials/item.tsx`
- `app/sections/main-product/product-highlight-item.tsx`
- `app/sections/columns-with-images/column.tsx`
- `tests/unit/element-labels.test.ts` — loads the real exported schemas and
  checks each callback returns distinct supplied strings, `undefined` for
  missing data, keeps `title`, and does not mutate its input
- `.weaverse/component-manifest.json` — regenerated; the only difference is
  pre-existing drift from the hotspots image `configs`, not the labels

## Manual Studio QA Checklist

- [ ] Add two Heading elements with distinct text; the layer tree shows each
      text, not "Heading".
- [ ] Edit one heading's text; its layer label updates.
- [ ] Clear a heading's text; its layer label falls back to "Heading".
- [ ] Duplicate a labelled element; the copy shows the same text.
- [ ] Switch the preview locale to a translated market and back (twice); labels
      follow the previewed language each time.
- [ ] Repeat a quick spot-check for Subheading, Testimonial, Highlight item,
      and Column.
- [ ] The Add menu still lists the original names ("Heading", "Subheading",
      "Testimonial", "Highlight item", "Column").
- [ ] Storefront rendering of these elements is unchanged.
