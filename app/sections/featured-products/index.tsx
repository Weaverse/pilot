import type {
  ComponentLoaderArgs,
  HydrogenComponentSchema,
} from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { FeaturedProductsQuery } from "storefront-api.generated";
import type { SectionProps } from "~/components/section";
import { Section, layoutInputs } from "~/components/section";
import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
interface FeaturedProductsData {}

interface FeaturedProductsProps
  extends SectionProps<FeaturedProductsLoaderData>,
    FeaturedProductsData {}

let FeaturedProducts = forwardRef<HTMLElement, FeaturedProductsProps>(
  (props, ref) => {
    let { loaderData, children, ...rest } = props;
    return (
      <Section ref={ref} {...rest}>
        {children}
      </Section>
    );
  },
);

export default FeaturedProducts;

// TODO: allowing pick products or select a collection
let FEATURED_PRODUCTS_QUERY = `#graphql
  query featuredProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 16) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export type FeaturedProductsLoaderData = Awaited<ReturnType<typeof loader>>;

export let loader = async ({ weaverse }: ComponentLoaderArgs) => {
  let { language, country } = weaverse.storefront.i18n;
  return await weaverse.storefront.query<FeaturedProductsQuery>(
    FEATURED_PRODUCTS_QUERY,
    {
      variables: {
        country,
        language,
      },
    },
  );
};

export let schema: HydrogenComponentSchema = {
  type: "featured-products",
  title: "Featured products",
  childTypes: ["featured-products-items", "heading", "subheading", "paragraph"],
  inspector: [
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
};
