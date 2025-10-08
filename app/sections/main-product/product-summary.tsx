import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import type { loader as productRouteLoader } from "~/routes/products/product";

interface ProductSummaryProps extends HydrogenComponentProps {
  ref: React.Ref<HTMLDivElement>;
}

export default function ProductSummary(props: ProductSummaryProps) {
  const { ref, ...rest } = props;
  const { product } = useLoaderData<typeof productRouteLoader>();

  if (!product?.summary) {
    return null;
  }

  return (
    <div ref={ref} {...rest} className="empty:hidden">
      <p className="leading-relaxed">{product.summary}</p>
    </div>
  );
}

export const schema = createSchema({
  type: "mp--summary",
  title: "Summary",
  limit: 1,
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [],
});
