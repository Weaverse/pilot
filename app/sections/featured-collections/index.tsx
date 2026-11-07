import { gql, type StorefrontApi } from "@shopify/hydrogen";
import {
  type WeaverseComponentLoaderArgs,
  createSchema,
  type WeaverseCollection,
} from "@weaverse/hydrogen/react-router";
import type { SectionProps } from "~/components/section";
import { layoutInputs, Section } from "~/components/section";
import { CACHE_DEFAULT } from "~/utils/cache";
import { unwrapStorefront } from "~/utils/storefront";

interface FeaturedCollectionsData {
  collections: WeaverseCollection[];
}

interface FeaturedCollectionsProps
  extends
    SectionProps<FeaturedCollectionsLoaderData>,
    FeaturedCollectionsData {}

export default function FeaturedCollections(props: FeaturedCollectionsProps) {
  const { loaderData, children, ...rest } = props;
  return <Section {...rest}>{children}</Section>;
}

const COLLECTIONS_QUERY = gql(`
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
`);

/** `nodes(ids:)` answers any `Node`; only the `Collection` branch is selected. */
type CollectionNode = Extract<
  NonNullable<
    StorefrontApi.ResultOf<typeof COLLECTIONS_QUERY>["nodes"][number]
  >,
  { id: string }
>;

export type FeaturedCollectionsLoaderData = Awaited<ReturnType<typeof loader>>;

export const loader = async ({
  data,
  weaverse,
}: WeaverseComponentLoaderArgs<FeaturedCollectionsData>) => {
  const ids = data.collections?.map(
    (collection) => `gid://shopify/Collection/${collection.id}`,
  );
  if (ids?.length) {
    // `$country`/`$language` are left to Hydrogen, which fills them from the
    // request context — the Shopify provider enum. Passing them explicitly
    // would send `weaverse.storefront.i18n.language`, which is the market's
    // public code because Weaverse keys translations by it, and bare `ZH`
    // resolves to English.
    const { nodes } = unwrapStorefront(
      await weaverse.storefront.graphql(COLLECTIONS_QUERY, {
        variables: { ids },
        cache: CACHE_DEFAULT,
      }),
    );
    return nodes.filter((node): node is CollectionNode =>
      Boolean(node && "id" in node),
    );
  }
  return [] as CollectionNode[];
};

export const schema = createSchema({
  type: "featured-collections",
  title: "Featured collections",
  childTypes: [
    "featured-collections-items",
    "heading",
    "subheading",
    "paragraph",
  ],
  settings: [
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
      inputs: layoutInputs,
    },
  ],
  presets: {
    gap: 32,
    children: [
      { type: "heading", content: "Shop our collections" },
      {
        type: "featured-collections-items",
        imageAspectRatio: "3/4",
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
});
