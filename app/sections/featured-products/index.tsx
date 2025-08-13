import { type ComponentLoaderArgs, createSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { FeaturedProductsQuery } from "storefront-api.generated";
import type { SectionProps } from "~/components/section";
import { layoutInputs, Section } from "~/components/section";
import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
import { maybeFilterOutCombinedListingsQuery } from "~/utils/combined-listings";

const FeaturedProducts = forwardRef<
  HTMLElement,
  SectionProps<FeaturedProductsLoaderData>
>((props, ref) => {
  const { loaderData, children, ...rest } = props;
  return (
    <Section ref={ref} {...rest}>
      {children}
    </Section>
  );
});

export default FeaturedProducts;

// TODO: allowing pick products or select a collection
const FEATURED_PRODUCTS_QUERY = `#graphql
  query featuredProducts($country: CountryCode, $language: LanguageCode, $query: String)
  @inContext(country: $country, language: $language) {
    products(first: 16, query: $query) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export type FeaturedProductsLoaderData = Awaited<ReturnType<typeof loader>>;

export const loader = async ({ weaverse }: ComponentLoaderArgs) => {
  const { language, country } = weaverse.storefront.i18n;
  return await weaverse.storefront.query<FeaturedProductsQuery>(
    FEATURED_PRODUCTS_QUERY,
    {
      variables: {
        country,
        language,
        query: maybeFilterOutCombinedListingsQuery,
      },
    },
  );
};

export const schema = createSchema({
  type: "featured-products",
  title: "Featured products",
  childTypes: ["featured-products-items", "heading", "subheading", "paragraph"],
  settings: [
    {
      group: "Layout",
      inputs: layoutInputs.filter((i) => i.name !== "borderRadius"),
    },
  ],
  presets: {
    gap: 32,
    children: [
      { type: "heading", content: "Featured products" },
      { type: "featured-products-items" },
    ],
  },
});
