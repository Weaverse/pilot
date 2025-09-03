import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { useLoaderData } from "react-router";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";

interface ProductSummaryProps extends HydrogenComponentProps {
  showSummary: boolean;
  className: string;
}

const ProductSummary = forwardRef<HTMLDivElement, ProductSummaryProps>(
  (props, ref) => {
    const { showSummary, className, ...rest } = props;
    const { product } = useLoaderData<typeof productRouteLoader>();

    if (!product || !showSummary || !product.summary) return null;

    return (
      <div ref={ref} {...rest} className="empty:hidden">
        <p className={className || "leading-relaxed"}>{product.summary}</p>
      </div>
    );
  },
);

export default ProductSummary;

export const schema = createSchema({
  type: "mp--summary",
  title: "Summary",
  limit: 1,
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [
    {
      group: "General",
      inputs: [
        {
          type: "switch",
          label: "Show summary",
          name: "showSummary",
          defaultValue: true,
        },
        {
          type: "text",
          label: "CSS classes",
          name: "className",
          defaultValue: "leading-relaxed",
          placeholder: "leading-relaxed",
        },
      ],
    },
  ],
});