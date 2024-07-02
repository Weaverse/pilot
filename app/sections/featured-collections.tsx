import type {
  ComponentLoaderArgs,
  HydrogenComponentSchema,
  WeaverseCollection,
} from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { CollectionsByIdsQuery } from "storefrontapi.generated";
import type { SectionProps } from "~/components/Section";
import { Section, layoutInputs } from "~/components/Section";
interface CollectionListData {
  collections: WeaverseCollection[];
}

interface CollectionListProps
  extends SectionProps<Awaited<ReturnType<typeof loader>>>,
    CollectionListData {}

let CollectionList = forwardRef<HTMLElement, CollectionListProps>(
  (props, ref) => {
    let { loaderData, ...rest } = props;
    return (
      <Section ref={ref} {...rest}>
        collections list
        {/* {loaderData?.collections?.nodes ? (
          <HomeFeaturedCollections
            collections={loaderData.collections}
            count={10}
            title={heading}
          />
        ) : null} */}
      </Section>
    );
  },
);

export default CollectionList;

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

export let loader = async ({
  data,
  weaverse,
}: ComponentLoaderArgs<CollectionListData>) => {
  let { language, country } = weaverse.storefront.i18n;
  let ids = data.collections.map(
    (collection) => `gid://shopify/Collection/${collection.id}`,
  );
  if (ids.length) {
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
    return nodes;
  }
  return [];
};

export let schema: HydrogenComponentSchema = {
  type: "collection-list",
  title: "Collection list",
  inspector: [
    {
      group: "Collection list",
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
};
