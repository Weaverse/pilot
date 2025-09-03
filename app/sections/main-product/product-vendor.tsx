import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { useLoaderData } from "react-router";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";

interface ProductVendorProps extends HydrogenComponentProps {
  showVendor: boolean;
}

const ProductVendor = forwardRef<HTMLDivElement, ProductVendorProps>(
  (props, ref) => {
    const { showVendor, ...rest } = props;
    const { product } = useLoaderData<typeof productRouteLoader>();

    if (!product || !showVendor || !product.vendor) return null;

    return (
      <div ref={ref} {...rest} className="empty:hidden">
        <span className="text-body-subtle">{product.vendor}</span>
      </div>
    );
  },
);

export default ProductVendor;

export const schema = createSchema({
  type: "mp--vendor",
  title: "Vendor",
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
          label: "Show vendor",
          name: "showVendor",
          defaultValue: false,
        },
      ],
    },
  ],
});