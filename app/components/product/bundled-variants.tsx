import type {
  ProductVariantComponent,
  Image as ShopifyImage,
} from "@shopify/hydrogen/storefront-api-types";
import { Image } from "~/components/image";
import Link from "~/components/link";

export function BundledVariants({
  variants,
}: {
  variants: ProductVariantComponent[];
}) {
  return (
    <div className="flex flex-col gap-4">
      {variants
        ?.map(({ productVariant: bundledVariant, quantity }) => {
          const url = `/products/${bundledVariant.product.handle}`;
          return (
            <Link to={url} key={bundledVariant.id}>
              <Image
                alt={bundledVariant.title}
                aspectRatio="1/1"
                height={60}
                loading="lazy"
                width={60}
                data={bundledVariant.image as ShopifyImage}
                className="h-15 w-15"
              />
              <div className="flex flex-col pl-3">
                <span className="underline-offset-4 hover:underline">
                  {bundledVariant.product.title}
                  {bundledVariant.title !== "Default Title"
                    ? `- ${bundledVariant.title}`
                    : null}
                </span>
                <span className="text-sm">Qty: {quantity}</span>
              </div>
            </Link>
          );
        })
        .filter(Boolean)}
    </div>
  );
}
