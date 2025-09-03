import type { ProductVariantComponent } from "@shopify/hydrogen/storefront-api-types";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { useLoaderData } from "react-router";
import { BundledVariants } from "~/components/product/bundled-variants";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";

interface ProductBundledVariantsProps extends HydrogenComponentProps {
  headingText: string;
  headingClassName: string;
}

const ProductBundledVariants = forwardRef<
  HTMLDivElement,
  ProductBundledVariantsProps
>((props, ref) => {
  const { headingText, headingClassName, ...rest } = props;
  const { product } = useLoaderData<typeof productRouteLoader>();

  const isBundle = Boolean(product?.isBundle?.requiresComponents);
  const bundledVariants = isBundle ? product?.isBundle?.components.nodes : null;

  if (!product || !isBundle || !bundledVariants) return null;

  return (
    <div ref={ref} {...rest} className="space-y-3 empty:hidden">
      <h4 className={headingClassName || "text-2xl"}>{headingText}</h4>
      <BundledVariants
        variants={bundledVariants as ProductVariantComponent[]}
      />
    </div>
  );
});

export default ProductBundledVariants;

export const schema = createSchema({
  type: "mp--bundled-variants",
  title: "Bundled variants",
  limit: 1,
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [
    {
      group: "General",
      inputs: [
        {
          type: "text",
          label: "Heading text",
          name: "headingText",
          defaultValue: "Bundled Products",
          placeholder: "Bundled Products",
        },
        {
          type: "text",
          label: "Heading CSS classes",
          name: "headingClassName",
          defaultValue: "text-2xl",
          placeholder: "text-2xl",
        },
      ],
    },
  ],
});