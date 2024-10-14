import { useFetcher } from "@remix-run/react";
import { ShopPayButton } from "@shopify/hydrogen";
import type { ProductVariant } from "@shopify/hydrogen/storefront-api-types";
import { useThemeSettings } from "@weaverse/hydrogen";
import { useEffect, useState } from "react";
import type { ProductQuery, VariantsQuery } from "storefrontapi.generated";
import Button from "~/components/button";
import { Modal, ModalContent, ModalTrigger } from "~/components/modal";
import { Skeleton } from "~/components/skeleton";
import { VariantPrices } from "~/components/variant-prices";
import type { ProductData } from "~/lib/products";
import { AddToCartButton } from "~/modules/add-to-cart-button";
import { ProductMedia } from "~/modules/product-form/product-media";
import { Quantity } from "~/modules/product-form/quantity";
import { ProductVariants } from "~/modules/product-form/variants";

export function QuickView({
  data,
}: {
  data: {
    product: ProductQuery["product"];
    variants: VariantsQuery;
    storeDomain: string;
  };
}) {
  let themeSettings = useThemeSettings();
  let swatches = themeSettings?.swatches || {
    configs: [],
    swatches: {
      imageSwatches: [],
      colorSwatches: [],
    },
  };
  let { product, variants: _variants, storeDomain } = data || {};

  let [selectedVariant, setSelectedVariant] = useState(
    product?.selectedVariant as ProductVariant
  );

  let variants = _variants?.product?.variants;
  let [quantity, setQuantity] = useState<number>(1);
  let {
    addToCartText,
    soldOutText,
    unavailableText,
    hideUnavailableOptions,
    showThumbnails,
  } = themeSettings;
  let handleSelectedVariantChange = (variant: any) => {
    setSelectedVariant(variant);
  };

  // // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  // useEffect(() => {
  //   if (variants?.nodes?.length) {
  //     if (!selectedVariant) {
  //       setSelectedVariant(variants?.nodes?.[0]);
  //     } else if (selectedVariant?.id !== product?.selectedVariant?.id) {
  //       setSelectedVariant(product?.selectedVariant);
  //     }
  //   }
  // }, [product?.id]);

  let { title, summary } = product;
  let atcText = selectedVariant?.availableForSale
    ? addToCartText
    : selectedVariant?.quantityAvailable === -1
    ? unavailableText
    : soldOutText;
  return (
    <div className="bg-background">
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <ProductMedia
          mediaLayout="slider"
          // @ts-expect-error
          media={product?.media.nodes}
          selectedVariant={selectedVariant}
          showThumbnails={false}
        />
        <div className="flex flex-col justify-start space-y-5">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <h5>{title}</h5>
            </div>
            <VariantPrices variant={selectedVariant} />
            <ProductVariants
              // @ts-expect-error
              product={product}
              // @ts-expect-error
              options={product?.options}
              // @ts-expect-error
              handle={product?.handle}
              selectedVariant={selectedVariant}
              onSelectedVariantChange={handleSelectedVariantChange}
              swatches={swatches}
              variants={variants}
              hideUnavailableOptions={hideUnavailableOptions}
            />
          </div>
          <Quantity value={quantity} onChange={setQuantity} />
          <AddToCartButton
            disabled={!selectedVariant?.availableForSale}
            lines={[
              {
                merchandiseId: selectedVariant?.id,
                quantity,
                selectedVariant,
              },
            ]}
            data-test="add-to-cart"
            className="w-full"
          >
            {atcText}
          </AddToCartButton>
          {selectedVariant?.availableForSale && (
            <ShopPayButton
              width="100%"
              variantIdsAndQuantities={[
                {
                  id: selectedVariant?.id,
                  quantity,
                },
              ]}
              storeDomain={storeDomain}
            />
          )}
          <p className="leading-relaxed">{summary}</p>
        </div>
      </div>
    </div>
  );
}

export function QuickViewTrigger({ productHandle }: { productHandle: string }) {
  let [open, setOpen] = useState(false);
  let { load, data, state } = useFetcher<ProductData>();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (open && !data && state !== "loading") {
      load(`/api/query/products?handle=${productHandle}`);
    }
  }, [open]);

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger>
        <Button
          variant="secondary"
          loading={state === "loading"}
          className="absolute inset-x-4 bottom-4 hidden lg:group-hover:block"
        >
          Quick shop
        </Button>
      </ModalTrigger>
      <ModalContent>
        {state === "loading" ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <QuickView data={data as ProductData} />
        )}
      </ModalContent>
    </Modal>
  );
}
