import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import { create } from "zustand";
import { Quantity } from "~/components/product/quantity";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { isCombinedListing } from "~/utils/combined-listings";

export const useProductQtyStore = create<{
  quantity: number;
  setQuantity: (qty: number) => void;
}>()((set) => ({
  quantity: 1,
  setQuantity: (qty: number) => set({ quantity: qty }),
}));

interface ProductQuantitySelectorProps extends HydrogenComponentProps {
  ref: React.Ref<HTMLDivElement>;
  labelText: string;
}

export default function ProductQuantitySelector(
  props: ProductQuantitySelectorProps,
) {
  const { ref, labelText, ...rest } = props;
  const { product } = useLoaderData<typeof productRouteLoader>();
  const { quantity, setQuantity } = useProductQtyStore();

  const combinedListing = isCombinedListing(product);

  if (!product || combinedListing) {
    return null;
  }

  return (
    <div ref={ref} {...rest} className="empty:hidden">
      <Quantity value={quantity} onChange={setQuantity} label={labelText} />
    </div>
  );
}

export const schema = createSchema({
  type: "mp--quantity-selector",
  title: "Quantity selector",
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
          label: "Label text",
          name: "labelText",
          defaultValue: "Quantity",
          placeholder: "Quantity",
        },
      ],
    },
  ],
});
