import { createSchema } from "@weaverse/hydrogen";
import { forwardRef, Suspense } from "react";
import { Await, useLoaderData } from "react-router";
import type { ProductCardFragment } from "storefront-api.generated";
import Heading, {
  type HeadingProps,
  headingInputs,
} from "~/components/heading";
import { ProductCard } from "~/components/product/product-card";
import { layoutInputs, Section, type SectionProps } from "~/components/section";
import { Swimlane } from "~/components/swimlane";

interface RelatedProductsProps
  extends Omit<SectionProps, "content">,
    Omit<HeadingProps, "as"> {
  headingTagName?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const RelatedProducts = forwardRef<HTMLElement, RelatedProductsProps>(
  (props, ref) => {
    const { recommended } = useLoaderData<{
      recommended: { nodes: ProductCardFragment[] };
    }>();
    const {
      headingTagName,
      content,
      size,
      mobileSize,
      desktopSize,
      color,
      weight,
      letterSpacing,
      alignment,
      minSize,
      maxSize,
      ...rest
    } = props;
    if (recommended) {
      return (
        <Section ref={ref} {...rest} overflow="unset">
          {content && (
            <Heading
              content={content}
              as={headingTagName}
              color={color}
              size={size}
              mobileSize={mobileSize}
              desktopSize={desktopSize}
              minSize={minSize}
              maxSize={maxSize}
              weight={weight}
              letterSpacing={letterSpacing}
              alignment={alignment}
            />
          )}
          <Suspense>
            <Await
              errorElement="There was a problem loading related products"
              resolve={recommended}
            >
              {(products) => {
                return (
                  <Swimlane>
                    {products.nodes.slice(0, 12).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        className="w-80 snap-start"
                      />
                    ))}
                  </Swimlane>
                );
              }}
            </Await>
          </Suspense>
        </Section>
      );
    }
    return <section ref={ref} {...rest} />;
  },
);

export default RelatedProducts;

export const schema = createSchema({
  type: "related-products",
  title: "Related products",
  limit: 1,
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [
    {
      group: "Layout",
      inputs: layoutInputs.filter((i) => i.name !== "borderRadius"),
    },
    {
      group: "Heading",
      inputs: headingInputs.map((input) => {
        if (input.name === "as") {
          return {
            ...input,
            name: "headingTagName",
          };
        }
        return input;
      }),
    },
  ],
  presets: {
    gap: 32,
    content: "You may also like",
  },
});
