import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { useLoaderData } from "react-router";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";

interface ProductSummaryProps extends HydrogenComponentProps {}

const ProductSummary = forwardRef<HTMLDivElement, ProductSummaryProps>(
  (props, ref) => {
    const { ...rest } = props;
    const { product } = useLoaderData<typeof productRouteLoader>();

    if (!product || !product.summary) return null;

    return (
      <div ref={ref} {...rest} className="empty:hidden">
        <p className="leading-relaxed">{product.summary}</p>
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
  settings: [],
});