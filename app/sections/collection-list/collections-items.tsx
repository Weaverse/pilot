import { useLoaderData } from "@remix-run/react";
import { Pagination } from "@shopify/hydrogen";
import type { Collection } from "@shopify/hydrogen/storefront-api-types";
import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { CollectionsQuery } from "storefrontapi.generated";
import { Section, type SectionProps, layoutInputs } from "~/components/section";
import { getImageLoadingPriority } from "~/lib/const";
import { Button } from "~/modules/button";
import { CollectionCard } from "./collection-card";

interface CollectionsItemsProps {
  prevButtonText: string;
  nextButtonText: string;
  imageAspectRatio: string;
}

let CollectionsItems = forwardRef<HTMLDivElement, CollectionsItemsProps>(
  (props, ref) => {
    let { collections } = useLoaderData<CollectionsQuery>();
    let { prevButtonText, nextButtonText, imageAspectRatio, ...rest } = props;
    return (
      <div ref={ref} {...rest}>
        <Pagination connection={collections}>
          {({ nodes, isLoading, PreviousLink, NextLink }) => (
            <>
              <div className="flex items-center justify-center mb-6">
                <Button as={PreviousLink} variant="secondary" width="full">
                  {isLoading ? "Loading..." : prevButtonText}
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-8 lg:gap-y-12">
                {nodes.map((collection, i) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection as Collection}
                    imageAspectRatio={imageAspectRatio}
                    loading={getImageLoadingPriority(i, 2)}
                  />
                ))}
              </div>
              <div className="flex items-center justify-center mt-6">
                <Button as={NextLink} variant="secondary" width="full">
                  {isLoading ? "Loading..." : nextButtonText}
                </Button>
              </div>
            </>
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
      group: "Collection items",
      inputs: [
        {
          type: "text",
          name: "prevButtonText",
          label: "Previous collections text",
          defaultValue: "Previous collections",
          placeholder: "Previous collections",
        },
        {
          type: "text",
          name: "nextButtonText",
          label: "Next collections text",
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
          label: "Image aspect ratio",
          name: "imageAspectRatio",
          configs: {
            options: [
              { value: "auto", label: "Adapt to image" },
              { value: "1/1", label: "1/1" },
              { value: "3/4", label: "3/4" },
              { value: "4/3", label: "4/3" },
            ],
          },
          defaultValue: "auto",
        },
      ],
    },
  ],
};
