import type { Storefront } from "@shopify/hydrogen";
import {
  type ComponentLoaderArgs,
  createSchema,
  type WeaverseCollection,
  type WeaverseProduct,
} from "@weaverse/hydrogen";
import type {
  CollectionProductsQuery,
  ProductsByIdsQuery,
} from "storefront-api.generated";
import type { SectionProps } from "~/components/section";
import { layoutInputs, Section } from "~/components/section";
import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
import type { I18nLocale } from "~/types/others";
import { getFeaturedProducts } from "~/utils/featured-products";

interface FeaturedProductsSectionData {
  selectionMethod: "auto" | "collection" | "manual";
  collection?: WeaverseCollection;
  products?: WeaverseProduct[];
}

interface FeaturedProductsProps
  extends SectionProps<FeaturedProductsLoaderData>,
    FeaturedProductsSectionData {
  ref: React.Ref<HTMLElement>;
}

export default function FeaturedProducts(props: FeaturedProductsProps) {
  const {
    ref,
    loaderData,
    selectionMethod,
    collection,
    products,
    children,
    ...rest
  } = props;
  return (
    <Section ref={ref} {...rest}>
      {children}
    </Section>
  );
}

const COLLECTION_PRODUCTS_QUERY = `#graphql
  query collectionProducts($country: CountryCode, $language: LanguageCode, $handle: String!)
  @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: 16) {
        nodes {
          ...ProductCard
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

const PRODUCTS_BY_IDS_QUERY = `#graphql
  query productsByIds($country: CountryCode, $language: LanguageCode, $ids: [ID!]!)
  @inContext(country: $country, language: $language) {
    nodes(ids: $ids) {
      ... on Product {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export type FeaturedProductsLoaderData = Awaited<ReturnType<typeof loader>>;

export const loader = async ({
  data,
  weaverse,
}: ComponentLoaderArgs<FeaturedProductsSectionData>) => {
  const { language, country } = weaverse.storefront.i18n;
  const { selectionMethod = "auto", collection, products } = data;

  if (selectionMethod === "collection" && collection?.handle) {
    const result = await weaverse.storefront.query<CollectionProductsQuery>(
      COLLECTION_PRODUCTS_QUERY,
      {
        variables: {
          country,
          language,
          handle: collection.handle,
        },
      },
    );
    return {
      products: {
        nodes: result.collection?.products.nodes || [],
      },
    };
  }

  if (selectionMethod === "manual" && products?.length) {
    const ids = products.map(
      (product) => `gid://shopify/Product/${product.id}`,
    );
    const { nodes } = await weaverse.storefront.query<ProductsByIdsQuery>(
      PRODUCTS_BY_IDS_QUERY,
      {
        variables: {
          country,
          language,
          ids,
        },
      },
    );
    return {
      products: {
        nodes: nodes.filter(Boolean),
      },
    };
  }

  // Default: auto selection (best selling products)
  const { featuredProducts } = await getFeaturedProducts(
    weaverse.storefront as Storefront<I18nLocale>,
  );
  return { products: featuredProducts };
};

export const schema = createSchema({
  type: "featured-products",
  title: "Featured products",
  childTypes: ["featured-products-items", "heading", "subheading", "paragraph"],
  settings: [
    {
      group: "Product selection",
      inputs: [
        {
          type: "select",
          name: "selectionMethod",
          label: "Source",
          configs: {
            options: [
              { value: "auto", label: "Auto (best selling)" },
              { value: "collection", label: "From a collection" },
              { value: "manual", label: "Manual selection" },
            ],
          },
          defaultValue: "auto",
        },
        {
          type: "collection",
          name: "collection",
          label: "Select collection",
          condition: (data: FeaturedProductsSectionData) =>
            data.selectionMethod === "collection",
        },
        {
          type: "product-list",
          name: "products",
          label: "Select products",
          condition: (data: FeaturedProductsSectionData) =>
            data.selectionMethod === "manual",
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
    selectionMethod: "auto",
    children: [
      { type: "heading", content: "Featured products" },
      { type: "featured-products-items" },
    ],
  },
});
