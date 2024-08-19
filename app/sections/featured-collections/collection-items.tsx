import { Image } from "@shopify/hydrogen";
import {
  type HydrogenComponentSchema,
  IMAGES_PLACEHOLDERS,
  useParentInstance,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import type { CSSProperties } from "react";
import { forwardRef } from "react";
import type { ButtonStyleProps } from "~/components/button";
import Button, { buttonStylesInputs } from "~/components/button";
import { Link } from "~/components/link";
import type { OverlayProps } from "~/components/overlay";
import { Overlay, overlayInputs } from "~/components/overlay";
import { getImageAspectRatio } from "~/lib/utils";
import type { FeaturedCollectionsLoaderData } from ".";

let variants = cva("", {
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
      2: "rounded-sm",
      4: "rounded",
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
    alignment: {
      top: "items-start",
      middle: "items-center",
      bottom: "items-end",
    },
    contentPosition: {
      over: "absolute inset-0 flex flex-col justify-center z-1",
      below: "",
    },
  },
});

interface CollectionItemsProps
  extends VariantProps<typeof variants>,
    OverlayProps,
    ButtonStyleProps {
  aspectRatio: "adapt" | "1/1" | "4/3" | "3/4" | "16/9";
  collectionNameColor: string;
  buttonText: string;
}

let CollectionItems = forwardRef<HTMLDivElement, CollectionItemsProps>(
  (props, ref) => {
    let {
      gridSize,
      gap,
      aspectRatio,
      borderRadius,
      contentPosition,
      collectionNameColor,
      alignment,
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
    let parent = useParentInstance();
    let collections: FeaturedCollectionsLoaderData = parent.data.loaderData;
    if (!collections?.length) {
      collections = Array(Number(gridSize)).fill(COLLECTION_PLACEHOLDER);
    }
    return (
      <div
        ref={ref}
        {...rest}
        className={clsx(
          [
            "snap-x snap-mandatory",
            "overflow-x-scroll md:overflow-x-hidden hidden-scroll scroll-px-6",
            "grid w-full grid-flow-col md:grid-flow-row justify-start gap-2",
          ],
          variants({ gridSize, gap }),
        )}
      >
        {collections.map((collection, ind) => (
          <Link
            key={collection.id + ind}
            to={`/collections/${collection.handle}`}
            className="relative w-[67vw] md:w-auto group group/overlay"
          >
            {collection?.image && (
              <div
                className={clsx("overflow-hidden", variants({ borderRadius }))}
                style={{
                  aspectRatio: getImageAspectRatio(
                    collection?.image || {},
                    aspectRatio,
                  ),
                }}
              >
                <Image
                  data={collection.image}
                  width={collection.image.width || 600}
                  height={collection.image.height || 400}
                  sizes="(max-width: 32em) 100vw, 45vw"
                  className={clsx([
                    "w-full h-full object-cover",
                    "transition-all duration-300",
                    "will-change-transform scale-100 group-hover:scale-[1.05]",
                  ])}
                />
              </div>
            )}
            {contentPosition === "over" && (
              <>
                <Overlay
                  enableOverlay={enableOverlay}
                  overlayColor={overlayColor}
                  overlayColorHover={overlayColorHover}
                  overlayOpacity={overlayOpacity}
                  className={clsx("z-0", variants({ borderRadius }))}
                />
              </>
            )}
            <div className={clsx(variants({ alignment, contentPosition }))}>
              <div
                style={
                  { "--col-name-color": collectionNameColor } as CSSProperties
                }
                className={clsx(
                  contentPosition === "over"
                    ? "text-center space-y-4 xl:space-y-7 px-4 py-16 text-[var(--col-name-color)]"
                    : "py-4",
                )}
              >
                {contentPosition === "over" ? (
                  <h5>{collection.title}</h5>
                ) : (
                  <h6>{collection.title}</h6>
                )}
                {contentPosition === "over" && buttonText && (
                  <Button
                    text={buttonText}
                    link={`/collections/${collection.handle}`}
                    variant="custom"
                    backgroundColor={backgroundColor}
                    textColor={textColor}
                    borderColor={borderColor}
                    backgroundColorHover={backgroundColorHover}
                    textColorHover={textColorHover}
                    borderColorHover={borderColorHover}
                  />
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  },
);

let COLLECTION_PLACEHOLDER: FeaturedCollectionsLoaderData[0] = {
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

export let schema: HydrogenComponentSchema = {
  type: "featured-collections-items",
  title: "Collection items",
  inspector: [
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
          name: "aspectRatio",
          label: "Aspect ratio",
          defaultValue: "3/4",
          configs: {
            options: [
              { value: "adapt", label: "Adapt to image" },
              { value: "1/1", label: "1/1" },
              { value: "4/3", label: "4/3" },
              { value: "3/4", label: "3/4" },
              { value: "16/9", label: "16/9" },
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
          type: "select",
          name: "alignment",
          label: "Vertical alignment",
          configs: {
            options: [
              { value: "top", label: "Top" },
              { value: "middle", label: "Middle" },
              { value: "bottom", label: "Bottom" },
            ],
          },
          defaultValue: "middle",
          condition: "contentPosition.eq.over",
        },
        {
          type: "color",
          name: "collectionNameColor",
          label: "Collection name color",
          defaultValue: "#fff",
          condition: "contentPosition.eq.over",
        },
        {
          type: "heading",
          label: "Overlay",
          condition: "contentPosition.eq.over",
        },
        ...overlayInputs.map((inp) => ({
          ...inp,
          condition: "contentPosition.eq.over",
        })),
        {
          type: "heading",
          label: "Button (optional)",
          condition: "contentPosition.eq.over",
        },
        {
          type: "text",
          name: "buttonText",
          label: "Button text",
          defaultValue: "Shop now",
          placeholder: "Shop now",
          condition: "contentPosition.eq.over",
        },
        ...buttonStylesInputs.map((inp) => ({
          ...inp,
          condition: "contentPosition.eq.over",
        })),
      ],
    },
  ],
};
