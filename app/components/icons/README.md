# Icons

Icons are [phosphor](https://phosphoricons.com) glyphs shipped as a single SVG
**sprite** and rendered via `<use>`. There is **no per-icon JavaScript** — the
whole set is one `sprite.svg`, so adding icons costs ~0 KB of JS.

The sprite is **inlined into the document** (hidden) once by `<IconSprite>` in
the root layout, and `<Icon>` references symbols with a same-document
`<use href="#name">`. This is deliberate: browsers block external SVG `<use>`
references across origins, and on Oxygen the built `sprite.svg` is served from
`cdn.shopify.com` while the storefront runs on its own domain — a URL-based
`<use>` renders every icon empty in production (it only works in dev/preview,
where assets are same-origin). Keep `<IconSprite />` mounted in `app/root.tsx`.

## Using an icon

```tsx
import { Icon } from "~/components/icon";

<Icon name="star" />                    {/* defaults to 1em, currentColor */}
<Icon name="magnifying-glass" className="size-5 text-gray-500" />
<Icon name="truck" size={24} />
```

- `name` is type-checked against `IconName` (the generated union), so typos and
  not-yet-added icons are compile errors.
- Color follows `currentColor` — set it with Tailwind `text-*` (or `color`).
- Size follows `1em` (the font size) unless you pass `size` or a `size-*` /
  `h-* w-*` class.

### Weight variants

Phosphor weights are **separate icons**: the variant suffix is part of the name.

```tsx
<Icon name="star-fill" />        {/* filled */}
<Icon name="leaf-duotone" />     {/* two-tone */}
<Icon name="funnel-x-light" />   {/* light */}
```

Available suffixes: `-fill`, `-duotone`, `-light`, `-thin`, `-bold`
(regular has no suffix). Each weight you use must be added to the sprite.

## Adding a new icon

1. Find the name at <https://phosphoricons.com> (the URL slug is the name; pick a
   weight if you need a non-regular variant, e.g. `heart-duotone`).
2. From `templates/pilot`, run:

   ```sh
   npm run add-icon star truck heart-duotone
   ```

   This downloads each SVG into `other/sly/icons/` (from the iconify `ph` set
   declared in `other/sly/sly.json`) and regenerates `sprite.svg` + `name.d.ts`.
3. Commit `other/sly/icons/<name>.svg`, `sprite.svg`, and `name.d.ts`.
4. Use it: `<Icon name="heart-duotone" />`.

> The sprite is also rebuilt automatically before `npm run dev` (`predev`), so
> manually-dropped SVGs in `other/sly/icons/` get picked up too.

## Files

| Path                                | Role                                              |
| ----------------------------------- | ------------------------------------------------- |
| `other/sly/icons/*.svg`             | Source SVGs (one per icon, committed)             |
| `other/sly/sly.json`                | Declares the upstream library (iconify `ph` set)  |
| `other/add-icon.mjs`                | Fetches icons + rebuilds (`npm run add-icon`)     |
| `other/build-icons.mjs`             | Generates the sprite + name union (`build:icons`) |
| `app/components/icons/sprite.svg`   | **Generated** — one `<symbol>` per icon           |
| `app/components/icons/name.d.ts`    | **Generated** — the `IconName` union              |
| `app/components/icon.tsx`           | The `Icon` component (`<use href="#name">`)       |
| `app/components/icon-sprite.tsx`    | Inlines the sprite once; mount in the root layout |

Do not hand-edit the generated files; rerun `npm run build:icons` instead.
