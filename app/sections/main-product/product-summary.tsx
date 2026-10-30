import {
  createSchema,
  type WeaverseComponentProps,
} from "@weaverse/hydrogen/react-router";
import { useLoaderData } from "react-router";
import type { loader as productRouteLoader } from "~/routes/products/product";

interface ProductSummaryProps extends WeaverseComponentProps {}

export default function ProductSummary(props: ProductSummaryProps) {
  const { ...rest } = props;
  const { product } = useLoaderData<typeof productRouteLoader>();

  if (!product?.summary) {
    return null;
  }

  return (
    <div {...rest} className="empty:hidden">
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
