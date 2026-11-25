import { createSchema } from "@weaverse/hydrogen/react-router";
import { Suspense } from "react";
import { Await, useLoaderData } from "react-router";
import { ProductCard } from "~/components/product-card";
import { layoutInputs, Section, type SectionProps } from "~/components/section";
import { Swimlane } from "~/components/swimlane";
import type { ProductCardFragment } from "~/graphql/fragments";
import { useWeaverseStudioCheck } from "~/hooks/use-weaverse-studio-check";

interface CompleteTheLookProps extends SectionProps {
  productsCount: number;
}

type ComplementaryProducts = Promise<{ nodes: ProductCardFragment[] }>;

/**
 * Products that go with the current one, from Shopify's complementary
 * recommendations (set per product in the Search & Discovery app). The
 * section hides itself on the storefront when a product has none.
 */
export default function CompleteTheLook(props: CompleteTheLookProps) {
  let { productsCount = 8, children, ...rest } = props;
  let { complementary } = useLoaderData<{
    complementary?: ComplementaryProducts;
  }>();
  let isDesignMode = useWeaverseStudioCheck();

  return (
    <Suspense>
      <Await resolve={complementary} errorElement={null}>
        {(products) => {
          let nodes = products?.nodes.slice(0, productsCount) ?? [];
          if (!nodes.length && !isDesignMode) {
            return null;
          }
          return (
            <Section {...rest}>
              {children}
              {nodes.length ? (
                <Swimlane withArrows>
                  {nodes.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </Swimlane>
              ) : (
                <p className="text-body-subtle">
                  This product has no complementary products yet. Add them in
                  the Shopify Search & Discovery app; the section stays hidden
                  on the storefront until then.
                </p>
              )}
            </Section>
          );
        }}
      </Await>
    </Suspense>
  );
}

export const schema = createSchema({
  type: "complete-the-look",
  title: "Complete the look",
  limit: 1,
  enabled: ({ page }) => page.type === "PRODUCT",
  childTypes: ["subheading", "heading", "paragraph"],
  settings: [
    {
      group: "Products",
      inputs: [
        {
          type: "range",
          name: "productsCount",
          label: "Products to show",
          configs: { min: 2, max: 12, step: 1 },
          defaultValue: 8,
        },
      ],
    },
    {
      group: "Layout",
      inputs: layoutInputs.filter((i) => i.name !== "borderRadius"),
    },
  ],
  presets: {
    productsCount: 8,
    gap: 22,
    verticalPadding: "small",
    children: [{ type: "heading", content: "Complete the look", as: "h4" }],
  },
});
