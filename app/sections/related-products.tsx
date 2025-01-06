import { Await, useLoaderData } from "@remix-run/react";
import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { Suspense, forwardRef } from "react";
import type { ProductCardFragment } from "storefront-api.generated";
import Heading, {
  type HeadingProps,
  headingInputs,
} from "~/components/heading";
import { ProductCard } from "~/components/product/product-card";
import { Section, type SectionProps, layoutInputs } from "~/components/section";
import { Swimlane } from "~/components/swimlane";

interface RelatedProductsProps
  extends Omit<SectionProps, "content">,
    Omit<HeadingProps, "as"> {
  headingTagName?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

let RelatedProducts = forwardRef<HTMLElement, RelatedProductsProps>(
  (props, ref) => {
    let { recommended } = useLoaderData<{
      recommended: { nodes: ProductCardFragment[] };
    }>();
    let {
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
        <Section ref={ref} {...rest}>
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
                        className="snap-start w-80"
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

export let schema: HydrogenComponentSchema = {
  type: "related-products",
  title: "Related products",
  limit: 1,
  enabledOn: {
    pages: ["PRODUCT"],
  },
  inspector: [
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
    width: "full",
    content: "You may also like",
  },
};
