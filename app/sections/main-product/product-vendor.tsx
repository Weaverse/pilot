import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import type { loader as productRouteLoader } from "~/routes/products/product";

interface ProductVendorProps extends HydrogenComponentProps {}

export default function ProductVendor(props: ProductVendorProps) {
  const { ...rest } = props;
  const { product } = useLoaderData<typeof productRouteLoader>();

  if (!product?.vendor) {
    return null;
  }

  return (
    <div {...rest} className="empty:hidden">
      <span className="text-body-subtle">{product.vendor}</span>
    </div>
  );
}

export const schema = createSchema({
  type: "mp--vendor",
  title: "Vendor",
  limit: 1,
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [],
});
