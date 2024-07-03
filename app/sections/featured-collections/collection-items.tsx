import { Image } from "@shopify/hydrogen";
import {
  IMAGES_PLACEHOLDERS,
  useParentInstance,
  type HydrogenComponentSchema,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import type { CSSProperties } from "react";
import { forwardRef } from "react";
import type { ButtonStyleProps } from "~/components/Button";
import Button, { buttonStylesInputs } from "~/components/Button";
import type { OverlayProps } from "~/components/Overlay";
import { Overlay, overlayInputs } from "~/components/Overlay";
import { getImageAspectRatio } from "~/lib/utils";
import type { FeaturedCollectionsLoaderData } from ".";

let variants = cva("md:grid", {
  variants: {
    gridSize: {
      3: "md:grid-cols-3",
      4: "md:grid-cols-4",
      5: "md:grid-cols-5",
      6: "md:grid-cols-6",
    },
    gap: {
      8: "gap-2",
      12: "gap-3",
      16: "gap-4",
      20: "gap-5",
      24: "gap-6",
      28: "gap-7",
      32: "gap-8",
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
      contentPosition,
      collectionNameColor,
      alignment,
      enableOverlay,
      overlayColor,
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
      <div ref={ref} {...rest} className={variants({ gridSize, gap })}>
        {collections.map((collection, ind) => (
          <div
            key={collection.id + ind}
            className="relative"
            style={{
              aspectRatio: getImageAspectRatio(
                collection?.image || {},
                aspectRatio,
              ),
            }}
          >
            {collection?.image && (
              <Image
                data={collection.image}
                width={collection.image.width || 600}
                height={collection.image.height || 400}
                sizes="(max-width: 32em) 100vw, 45vw"
                className="w-full h-full object-cover"
              />
            )}
            {contentPosition === "over" && (
              <>
                <Overlay
                  enableOverlay={enableOverlay}
                  overlayColor={overlayColor}
                  overlayOpacity={overlayOpacity}
                  className="z-0"
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
                    ? "text-center space-y-7 px-4 py-16 text-[var(--col-name-color)]"
                    : "py-4",
                )}
              >
                <h3
                  className={clsx(
                    contentPosition === "over"
                      ? "text-3xl leading-none"
                      : "text-xl",
                  )}
                >
                  {collection.title}
                </h3>
                {contentPosition === "over" && buttonText && (
                  <Button
                    text={buttonText}
                    link={`/collections/${collection.handle}`}
                    variant="secondary"
                    buttonStyle="custom"
                    backgroundColor={backgroundColor}
                    textColor={textColor}
                    borderColor={borderColor}
                    backgroundColorHover={backgroundColorHover}
                    textColorHover={textColorHover}
                    borderColorHover={borderColorHover}
                    className="min-w-48"
                  />
                )}
              </div>
            </div>
          </div>
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
          label: "Grid size (Desktop)",
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
          type: "heading",
          label: "Overlay",
        },
        ...overlayInputs,
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
        ...buttonStylesInputs
          .filter((inp) => inp.name !== "buttonStyle")
          .map((inp) => ({
            ...inp,
            condition: "contentPosition.eq.over",
          })),
      ],
    },
  ],
};
