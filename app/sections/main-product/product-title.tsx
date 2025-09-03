import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { useLoaderData } from "react-router";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";

interface ProductTitleProps extends HydrogenComponentProps {
  headingLevel: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className: string;
}

const ProductTitle = forwardRef<HTMLDivElement, ProductTitleProps>(
  (props, ref) => {
    const { headingLevel, className, ...rest } = props;
    const { product } = useLoaderData<typeof productRouteLoader>();

    if (!product) return null;

    const HeadingTag = headingLevel;

    return (
      <div ref={ref} {...rest}>
        <HeadingTag className={className || "h3 tracking-tight!"}>
          {product.title}
        </HeadingTag>
      </div>
    );
  },
);

export default ProductTitle;

export const schema = createSchema({
  type: "mp--title",
  title: "Title",
  limit: 1,
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [
    {
      group: "General",
      inputs: [
        {
          type: "select",
          label: "Heading level",
          name: "headingLevel",
          defaultValue: "h1",
          configs: {
            options: [
              { value: "h1", label: "H1" },
              { value: "h2", label: "H2" },
              { value: "h3", label: "H3" },
              { value: "h4", label: "H4" },
              { value: "h5", label: "H5" },
              { value: "h6", label: "H6" },
            ],
          },
        },
        {
          type: "text",
          label: "CSS classes",
          name: "className",
          defaultValue: "h3 tracking-tight!",
          placeholder: "h3 tracking-tight!",
        },
      ],
    },
  ],
});