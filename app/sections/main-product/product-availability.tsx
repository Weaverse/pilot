import {
  getAdjacentAndFirstAvailableVariants,
  useOptimisticVariant,
} from "@shopify/hydrogen";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { cn } from "~/utils/cn";

interface ProductAvailabilityProps extends HydrogenComponentProps {
  ref: React.Ref<HTMLDivElement>;
  inStockText: string;
  outOfStockText: string;
  inStockColor: string;
  outOfStockColor: string;
}

export default function ProductAvailability(props: ProductAvailabilityProps) {
  let { inStockText, outOfStockText, inStockColor, outOfStockColor, ...rest } =
    props;
  let { product } = useLoaderData<typeof productRouteLoader>();

  let selectedVariant = useOptimisticVariant(
    product?.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  if (!product) {
    return null;
  }

  let available = selectedVariant?.availableForSale;
  let color = available ? inStockColor : outOfStockColor;

  return (
    <div {...rest} className={cn("flex items-center gap-2")}>
      {available ? (
        <span className="relative flex size-3 mb-0.5">
          <span
            className="absolute inline-flex h-full w-full animate-ping opacity-75"
            style={{ backgroundColor: color, borderRadius: "99px" }}
          />
          <span
            className="relative inline-flex size-3"
            style={{ backgroundColor: color, borderRadius: "99px" }}
          />
        </span>
      ) : (
        <span
          className="size-3 mb-0.5"
          style={{ backgroundColor: color, borderRadius: "99px" }}
        />
      )}
      <span style={{ color }}>{available ? inStockText : outOfStockText}</span>
    </div>
  );
}

export let schema = createSchema({
  type: "mp--availability",
  title: "Availability",
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
          label: "In stock text",
          name: "inStockText",
          defaultValue: "In stock",
          placeholder: "In stock",
        },
        {
          type: "text",
          label: "Out of stock text",
          name: "outOfStockText",
          defaultValue: "Out of stock",
          placeholder: "Out of stock",
        },
        {
          type: "color",
          label: "In stock color",
          name: "inStockColor",
          defaultValue: "#0d9488",
        },
        {
          type: "color",
          label: "Out of stock color",
          name: "outOfStockColor",
          defaultValue: "#dc2626",
        },
      ],
    },
  ],
});
