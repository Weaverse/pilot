import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useEffect } from "react";
import { useLoaderData } from "react-router";
import { create } from "zustand";
import { Quantity } from "~/components/product/quantity";
import type { loader as productRouteLoader } from "~/routes/products/product";

/**
 * The quantity chosen on the product page, and the product it belongs to.
 *
 * The selector, the main and sticky Add to cart buttons and Shop Pay are
 * separate sections, so they share this store. It outlives client-side
 * navigation, which is why a quantity only counts for the product it was
 * chosen on: read it through {@link useProductQuantity}, never directly.
 */
export const useProductQtyStore = create<{
  productId: string | null;
  quantity: number;
  setQuantity: (productId: string, quantity: number) => void;
  /** Starts `productId` at 1 unless the stored quantity is already its own. */
  claim: (productId: string) => void;
}>()((set) => ({
  productId: null,
  quantity: 1,
  setQuantity: (productId, quantity) => set({ productId, quantity }),
  claim: (productId) =>
    set((state) =>
      state.productId === productId ? state : { productId, quantity: 1 },
    ),
}));

/**
 * The purchase quantity for `productId`: what the shopper chose for this
 * product, or 1.
 *
 * Ownership is checked while rendering, so the first render of a different
 * product already reads 1 — no effect has to run before the buttons are
 * correct. Variant changes keep the product ID and therefore the quantity.
 * The effect only hands the store to the product on screen, so returning to
 * a product visited earlier also starts at 1.
 */
export function useProductQuantity(productId: string | undefined) {
  const quantity = useProductQtyStore((state) =>
    productId && state.productId === productId ? state.quantity : 1,
  );
  const setStoredQuantity = useProductQtyStore((state) => state.setQuantity);
  const claim = useProductQtyStore((state) => state.claim);

  useEffect(() => {
    if (productId) {
      claim(productId);
    }
  }, [productId, claim]);

  function setQuantity(value: number) {
    if (productId) {
      setStoredQuantity(productId, value);
    }
  }

  return { quantity, setQuantity };
}

interface ProductQuantitySelectorProps extends HydrogenComponentProps {
  labelText: string;
}

export default function ProductQuantitySelector(
  props: ProductQuantitySelectorProps,
) {
  const { labelText, ...rest } = props;
  const { product } = useLoaderData<typeof productRouteLoader>();
  const { quantity, setQuantity } = useProductQuantity(product?.id);

  if (!product) {
    return null;
  }

  return (
    <div {...rest} className="empty:hidden">
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
