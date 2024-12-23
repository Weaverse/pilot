import { useLoaderData } from "@remix-run/react";
import { Pagination } from "@shopify/hydrogen";
import type { Collection } from "@shopify/hydrogen/storefront-api-types";
import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { CollectionsQuery } from "storefrontapi.generated";
import { Link } from "~/components/link";
import { getImageLoadingPriority } from "~/lib/const";
import { CollectionCard } from "./collection-card";
import { overlayInputs, type OverlayProps } from "~/components/overlay";

interface CollectionsItemsProps extends OverlayProps {
  prevButtonText: string;
  nextButtonText: string;
  imageAspectRatio: "adapt" | "1/1" | "4/3" | "3/4" | "16/9";
  collectionNameColor: string;
}

let CollectionsItems = forwardRef<HTMLDivElement, CollectionsItemsProps>(
  (props, ref) => {
    let { collections } = useLoaderData<CollectionsQuery>();
    let {
      prevButtonText,
      nextButtonText,
      imageAspectRatio,
      collectionNameColor,
      enableOverlay,
      overlayColor,
      overlayColorHover,
      overlayOpacity,
      ...rest
    } = props;
    return (
      <div ref={ref} {...rest}>
        <Pagination connection={collections}>
          {({
            nodes,
            isLoading,
            hasPreviousPage,
            hasNextPage,
            nextPageUrl,
            previousPageUrl,
          }) => (
            <div className="flex w-full flex-col gap-8 items-center">
              {hasPreviousPage && (
                <Link
                  to={previousPageUrl}
                  variant="outline"
                  className="mx-auto"
                >
                  {isLoading ? "Loading..." : prevButtonText}
                </Link>
              )}
              <div className="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-8 lg:gap-y-12">
                {nodes.map((collection, i) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection as Collection}
                    imageAspectRatio={imageAspectRatio}
                    collectionNameColor={collectionNameColor}
                    loading={getImageLoadingPriority(i, 2)}
                    enableOverlay={enableOverlay}
                    overlayColor={overlayColor}
                    overlayColorHover={overlayColorHover}
                    overlayOpacity={overlayOpacity}
                  />
                ))}
              </div>
              {hasNextPage && (
                <Link to={nextPageUrl} variant="outline" className="mx-auto">
                  {isLoading ? "Loading..." : nextButtonText}
                </Link>
              )}
            </div>
          )}
        </Pagination>
      </div>
    );
  },
);

export default CollectionsItems;

export let schema: HydrogenComponentSchema = {
  type: "collections-items",
  title: "Collection items",
  inspector: [
    {
      group: "Pagination",
      inputs: [
        {
          type: "text",
          name: "prevButtonText",
          label: "Previous button text",
          defaultValue: "Previous collections",
          placeholder: "Previous collections",
        },
        {
          type: "text",
          name: "nextButtonText",
          label: "Next button text",
          defaultValue: "Next collections",
          placeholder: "Next collections",
        },
      ],
    },
    {
      group: "Collection card",
      inputs: [
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
          type: "color",
          name: "collectionNameColor",
          label: "Collection name color",
          defaultValue: "#fff",
          condition: "contentPosition.eq.over",
        },
        {
          type: "heading",
          label: "Overlay",
        },
        ...overlayInputs,
      ],
    },
  ],
};
