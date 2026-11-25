import {
  createSchema,
  IMAGES_PLACEHOLDERS,
  type WeaverseCollection,
} from "@weaverse/hydrogen/react-router";
import { cva } from "class-variance-authority";
import type { CSSProperties, PointerEvent } from "react";
import { Image } from "~/components/image";
import { Link } from "~/components/link";
import type { SectionProps } from "~/components/section";
import { layoutInputs, Section } from "~/components/section";
import { cn } from "~/utils/cn";
import {
  type FeaturedCollectionsLoaderData,
  loader as featuredCollectionsLoader,
} from "../featured-collections";

interface CollectionRevealProps extends SectionProps<FeaturedCollectionsLoaderData> {
  collections: WeaverseCollection[];
  textSize: "large" | "huge";
  alternateFonts: boolean;
}

const textVariants = cva("leading-none uppercase", {
  variants: {
    textSize: {
      large: "text-5xl md:text-7xl",
      huge: "text-6xl md:text-8xl lg:text-9xl",
    },
  },
  defaultVariants: { textSize: "huge" },
});

const PLACEHOLDERS = [
  { title: "Outerwear", image: IMAGES_PLACEHOLDERS.collection_1 },
  { title: "Knitwear", image: IMAGES_PLACEHOLDERS.collection_2 },
  { title: "Accessories", image: IMAGES_PLACEHOLDERS.collection_3 },
];

/**
 * Collection names set very large, one per row. Hovering a row shows its
 * collection image, which follows the pointer (`--x`/`--y` are written on
 * the list as the pointer moves, so no React state re-renders the rows).
 */
export default function CollectionReveal(props: CollectionRevealProps) {
  let {
    loaderData,
    collections: _collections,
    textSize,
    alternateFonts,
    ...rest
  } = props;
  let items = loaderData?.length
    ? loaderData.map((c) => ({
        key: c.id,
        title: c.title,
        to: `/collections/${c.handle}`,
        image: c.image,
      }))
    : PLACEHOLDERS.map((p) => ({
        key: p.title,
        title: p.title,
        to: "/collections/all",
        image: { url: p.image, altText: p.title, width: 1000, height: 1000 },
      }));

  function followPointer(e: PointerEvent<HTMLUListElement>) {
    let box = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - box.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - box.top}px`);
  }

  return (
    <Section {...rest} overflow="unset">
      <ul
        onPointerMove={followPointer}
        className="group/list relative"
        style={{ "--x": "50%", "--y": "50%" } as CSSProperties}
      >
        {items.map((item, idx) => (
          <li
            key={item.key}
            className="group border-line-subtle border-b last:border-b-0"
          >
            <Link
              to={item.to}
              animate={false}
              className={cn(
                "flex justify-center py-6 text-center transition-opacity md:py-8",
                "group-hover/list:[&:not(:hover)]:opacity-40",
                textVariants({ textSize }),
                alternateFonts && idx % 2 === 1
                  ? "font-sans font-light"
                  : "font-serif",
              )}
            >
              {item.title}
            </Link>
            {item.image?.url && (
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute top-(--y) left-(--x) z-10 hidden w-64 -translate-x-1/2 -translate-y-1/2 md:block lg:w-80",
                  "scale-90 opacity-0 transition-[opacity,scale] duration-300 group-hover:scale-100 group-hover:opacity-100",
                )}
              >
                <Image
                  data={item.image}
                  sizes="320px"
                  className="aspect-4/3 h-auto w-full object-cover"
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}

export const loader = featuredCollectionsLoader;

export const schema = createSchema({
  type: "collection-reveal",
  title: "Collection reveal",
  settings: [
    {
      group: "Collections",
      inputs: [
        {
          type: "collection-list",
          name: "collections",
          label: "Collections",
          shouldRevalidate: true,
        },
        {
          type: "toggle-group",
          name: "textSize",
          label: "Text size",
          configs: {
            options: [
              { value: "large", label: "Large" },
              { value: "huge", label: "Huge" },
            ],
          },
          defaultValue: "huge",
        },
        {
          type: "switch",
          name: "alternateFonts",
          label: "Alternate heading and body fonts",
          defaultValue: false,
        },
      ],
    },
    {
      group: "Layout",
      inputs: layoutInputs.filter(({ name }) => name !== "gap"),
    },
  ],
  presets: {
    textSize: "huge",
    alternateFonts: false,
    verticalPadding: "medium",
  },
});
