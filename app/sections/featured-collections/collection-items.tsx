import {
  createSchema,
  type HydrogenComponentProps,
  IMAGES_PLACEHOLDERS,
  useParentInstance,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import type { CSSProperties } from "react";
import { forwardRef } from "react";
import { Image } from "~/components/image";
import Link, { type LinkStyles, linkStylesInputs } from "~/components/link";
import type { OverlayProps } from "~/components/overlay";
import { Overlay, overlayInputs } from "~/components/overlay";
import { useAnimation } from "~/hooks/use-animation";
import type { ImageAspectRatio } from "~/types/image";
import { calculateAspectRatio } from "~/utils/image";
import type { FeaturedCollectionsLoaderData } from ".";

const variants = cva("", {
  variants: {
    gridSize: {
      3: "md:grid-cols-3",
      4: "md:grid-cols-3 lg:grid-cols-4",
      5: "md:grid-cols-3 xl:grid-cols-5",
      6: "md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6",
    },
    gap: {
      8: "md:gap-2",
      12: "md:gap-3",
      16: "md:gap-4",
      20: "md:gap-5",
      24: "md:gap-6",
      28: "md:gap-7",
      32: "md:gap-8",
    },
    borderRadius: {
      0: "",
      2: "rounded-xs",
      4: "rounded-sm",
      6: "rounded-md",
      8: "rounded-lg",
      10: "rounded-[10px]",
      12: "rounded-xl",
      14: "rounded-[14px]",
      16: "rounded-2xl",
      18: "rounded-[18px]",
      20: "rounded-[20px]",
      22: "rounded-[22px]",
      24: "rounded-3xl",
    },
    contentPosition: {
      over: "absolute inset-0 z-1 flex flex-col justify-center",
      below: "",
    },
  },
});

interface CollectionItemsData
  extends VariantProps<typeof variants>,
    OverlayProps,
    LinkStyles {
  imageAspectRatio: ImageAspectRatio;
  collectionNameColor: string;
  buttonText: string;
}

const CollectionItems = forwardRef<
  HTMLDivElement,
  CollectionItemsData & HydrogenComponentProps
>((props, ref) => {
  const [scope] = useAnimation(ref);
  const {
    gridSize,
    gap,
    imageAspectRatio,
    borderRadius,
    contentPosition,
    collectionNameColor,
    enableOverlay,
    overlayColor,
    overlayColorHover,
    overlayOpacity,
    buttonText,
    backgroundColor,
    textColor,
    borderColor,
    backgroundColorHover,
    textColorHover,
    borderColorHover,
    ...rest
  } = props;
  const parent = useParentInstance();
  let collections: FeaturedCollectionsLoaderData = parent.data?.loaderData;
  if (!collections?.length) {
    collections = new Array(Number(gridSize)).fill(COLLECTION_PLACEHOLDER);
  }
  return (
    <div
      ref={scope}
      {...rest}
      className={clsx(
        [
          "snap-x snap-mandatory",
          "hidden-scroll scroll-px-6 overflow-x-scroll md:overflow-x-hidden",
          "grid w-full grid-flow-col justify-start gap-2 md:grid-flow-row",
        ],
        variants({ gridSize, gap }),
      )}
    >
      {collections.map((collection, ind) => (
        <div
          key={collection.id + ind}
          className="group group/overlay relative w-[67vw] md:w-auto"
          data-motion="slide-in"
        >
          {collection?.image && (
            <div
              className={clsx("overflow-hidden", variants({ borderRadius }))}
              style={{
                aspectRatio: calculateAspectRatio(
                  collection?.image || {},
                  imageAspectRatio,
                ),
              }}
            >
              <Image
                data={collection.image}
                width={collection.image.width || 600}
                height={collection.image.height || 400}
                sizes="(max-width: 32em) 100vw, 45vw"
                className={clsx([
                  "transition-all duration-300",
                  "scale-100 will-change-transform group-hover:scale-[1.05]",
                ])}
              />
            </div>
          )}
          {contentPosition === "over" && (
            <Overlay
              enableOverlay={enableOverlay}
              overlayColor={overlayColor}
              overlayColorHover={overlayColorHover}
              overlayOpacity={overlayOpacity}
              className={clsx("z-0", variants({ borderRadius }))}
            />
          )}
          <div className={clsx("items-center", variants({ contentPosition }))}>
            <div
              style={
                { "--col-name-color": collectionNameColor } as CSSProperties
              }
              className={clsx(
                contentPosition === "over"
                  ? "space-y-4 px-4 py-16 text-center text-(--col-name-color) xl:space-y-7"
                  : "py-4",
              )}
            >
              {contentPosition === "over" ? (
                <h5>{collection.title}</h5>
              ) : (
                <h6>{collection.title}</h6>
              )}
              {contentPosition === "over" && buttonText && (
                <Link
                  to={`/collections/${collection.handle}`}
                  variant="custom"
                  backgroundColor={backgroundColor}
                  textColor={textColor}
                  borderColor={borderColor}
                  backgroundColorHover={backgroundColorHover}
                  textColorHover={textColorHover}
                  borderColorHover={borderColorHover}
                >
                  {buttonText}
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

const COLLECTION_PLACEHOLDER: FeaturedCollectionsLoaderData[0] = {
  id: "gid://shopify/Collection/1234567890",
  title: "Collection title",
  handle: "collection-handle",
  description: "Collection description",
  image: {
    id: "gid://shopify/CollectionImage/1234567890",
    altText: "Collection thumbnail",
    width: 1000,
    height: 1000,
    url: IMAGES_PLACEHOLDERS.collection_1,
  },
};

export default CollectionItems;

export const schema = createSchema({
  type: "featured-collections-items",
  title: "Collection items",
  settings: [
    {
      group: "Collection items",
      inputs: [
        {
          type: "toggle-group",
          name: "gridSize",
          label: "Grid size (desktop)",
          configs: {
            options: [
              { value: "3", label: "3" },
              { value: "4", label: "4" },
              { value: "5", label: "5" },
              { value: "6", label: "6" },
            ],
          },
          defaultValue: "5",
        },
        {
          type: "range",
          name: "gap",
          label: "Items gap",
          configs: {
            min: 8,
            max: 32,
            step: 4,
          },
          defaultValue: 16,
        },
      ],
    },
    {
      group: "Collection card",
      inputs: [
        {
          type: "heading",
          label: "Image",
        },
        {
          type: "select",
          name: "imageAspectRatio",
          label: "Image aspect ratio",
          defaultValue: "adapt",
          configs: {
            options: [
              { value: "adapt", label: "Adapt to image" },
              { value: "1/1", label: "Square (1/1)" },
              { value: "3/4", label: "Portrait (3/4)" },
              { value: "4/3", label: "Landscape (4/3)" },
              { value: "16/9", label: "Widescreen (16/9)" },
            ],
          },
          helpText:
            'Learn more about image <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio" target="_blank" rel="noopener noreferrer">aspect ratio</a> property.',
        },
        {
          type: "range",
          label: "Border radius",
          name: "borderRadius",
          configs: {
            min: 0,
            max: 24,
            step: 2,
            unit: "px",
          },
          defaultValue: 0,
        },
        {
          type: "heading",
          label: "Content",
        },
        {
          type: "select",
          name: "contentPosition",
          label: "Content position",
          configs: {
            options: [
              { value: "over", label: "Over image" },
              { value: "below", label: "Below image" },
            ],
          },
          defaultValue: "over",
        },
        {
          type: "color",
          name: "collectionNameColor",
          label: "Collection name color",
          defaultValue: "#fff",
          condition: (data: CollectionItemsData) =>
            data.contentPosition === "over",
        },
        {
          type: "heading",
          label: "Overlay",
          condition: (data: CollectionItemsData) =>
            data.contentPosition === "over",
        },
        ...overlayInputs.map((inp) => ({
          ...inp,
          condition: (data: CollectionItemsData) =>
            data.contentPosition === "over",
        })),
        {
          type: "heading",
          label: "Button (optional)",
          condition: (data: CollectionItemsData) =>
            data.contentPosition === "over",
        },
        {
          type: "text",
          name: "buttonText",
          label: "Button text",
          defaultValue: "Shop now",
          placeholder: "Shop now",
          condition: (data: CollectionItemsData) =>
            data.contentPosition === "over",
        },
        ...linkStylesInputs.map((inp) => ({
          ...inp,
          condition: (data: CollectionItemsData) =>
            data.contentPosition === "over",
        })),
      ],
    },
  ],
});
