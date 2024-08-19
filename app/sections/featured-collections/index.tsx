import type {
  ComponentLoaderArgs,
  HydrogenComponentSchema,
  WeaverseCollection,
} from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { CollectionsByIdsQuery } from "storefrontapi.generated";
import type { SectionProps } from "~/components/section";
import { Section, layoutInputs } from "~/components/section";

interface FeaturedCollectionsData {
  collections: WeaverseCollection[];
}

interface FeaturedCollectionsProps
  extends SectionProps<FeaturedCollectionsLoaderData>,
    FeaturedCollectionsData {}

let FeaturedCollections = forwardRef<HTMLElement, FeaturedCollectionsProps>(
  (props, ref) => {
    let { loaderData, children, ...rest } = props;
    return (
      <Section ref={ref} {...rest}>
        {children}
      </Section>
    );
  },
);

export default FeaturedCollections;

let COLLECTIONS_QUERY = `#graphql
  query collectionsByIds($country: CountryCode, $language: LanguageCode, $ids: [ID!]!)
  @inContext(country: $country, language: $language) {
    nodes(ids: $ids) {
      ... on Collection {
        id
        title
        handle
        onlineStoreUrl
        description
        image {
          id
          altText
          width
          height
          url
        }
      }
    }
  }
` as const;

export type FeaturedCollectionsLoaderData = Awaited<ReturnType<typeof loader>>;

export let loader = async ({
  data,
  weaverse,
}: ComponentLoaderArgs<FeaturedCollectionsData>) => {
  let { language, country } = weaverse.storefront.i18n;
  let ids = data.collections?.map(
    (collection) => `gid://shopify/Collection/${collection.id}`,
  );
  if (ids?.length) {
    let { nodes } = await weaverse.storefront.query<CollectionsByIdsQuery>(
      COLLECTIONS_QUERY,
      {
        variables: {
          country,
          language,
          ids,
        },
      },
    );
    return nodes.filter(Boolean);
  }
  return [];
};

export let schema: HydrogenComponentSchema = {
  type: "featured-collections",
  title: "Featured collections",
  childTypes: [
    "featured-collections-items",
    "heading",
    "subheading",
    "paragraph",
  ],
  inspector: [
    {
      group: "Featured collections",
      inputs: [
        {
          type: "collection-list",
          name: "collections",
          label: "Collections",
        },
      ],
    },
    {
      group: "Layout",
      inputs: layoutInputs.filter((i) => i.name !== "borderRadius"),
    },
  ],
  presets: {
    gap: 32,
    children: [
      { type: "heading", content: "Shop our collections" },
      {
        type: "featured-collections-items",
        aspectRatio: "3/4",
        gridSize: "3",
        contentPosition: "over",
        collectionNameColor: "#fff",
        buttonText: "Shop now",
        enableOverlay: true,
        overlayColor: "#000",
        overlayOpacity: 30,
        backgroundColor: "#fff",
        textColor: "#000",
        borderColor: "#fff",
        backgroundColorHover: "#ffeded",
        textColorHover: "#000",
        borderColorHover: "#ffeded",
      },
    ],
  },
};
