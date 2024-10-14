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

interface CollectionListProps extends SectionProps {
  heading: string;
  prevButtonText: string;
  nextButtonText: string;
  imageAspectRatio: string;
}

let CollectionList = forwardRef<HTMLElement, CollectionListProps>(
  (props, ref) => {
    let { collections } = useLoaderData<CollectionsQuery>();
    let { heading, prevButtonText, nextButtonText, imageAspectRatio, ...rest } =
      props;
    return (
      <Section ref={ref} {...rest}>
        <h6>{heading}</h6>
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
      </Section>
    );
  }
);

export default CollectionList;

export let schema: HydrogenComponentSchema = {
  type: "collection-list",
  title: "Collection list",
  limit: 1,
  enabledOn: {
    pages: ["COLLECTION_LIST"],
  },
  inspector: [
    { group: "Layout", inputs: layoutInputs },
    {
      group: "Collection list",
      inputs: [
        {
          type: "text",
          name: "heading",
          label: "Heading",
          defaultValue: "Collections",
          placeholder: "Collections",
        },
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
              { value: "6/4", label: "6/4" },
            ],
          },
          defaultValue: "auto",
        },
      ],
    },
  ],
};
