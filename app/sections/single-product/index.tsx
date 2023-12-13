import {Money, ShopPayButton} from '@shopify/hydrogen';
import {
  useThemeSettings,
  type ComponentLoaderArgs,
  type HydrogenComponentProps,
  type HydrogenComponentSchema,
  type WeaverseProduct,
} from '@weaverse/hydrogen';
import {forwardRef, useEffect, useState} from 'react';
import type {ProductQuery} from 'storefrontapi.generated';
import {AddToCartButton} from '~/components';
import {PRODUCT_QUERY, VARIANTS_QUERY} from '~/data/queries';
import {Quantity} from './quantity';
import {ProductVariants} from './variants';
import {ProductPlaceholder} from './placeholder';
import {defer} from '@remix-run/server-runtime';
import {ProductMedia} from './product-media';

type SingleProductData = {
  productsCount: number;
  product: WeaverseProduct;
  hideUnavailableOptions: boolean;
  // product media props
  showThumbnails: boolean;
  numberOfThumbnails: number;
  spacing: number;
};

type SingleProductProps = HydrogenComponentProps<
  Awaited<ReturnType<typeof loader>>
> &
  SingleProductData;

let SingleProduct = forwardRef<HTMLElement, SingleProductProps>(
  (props, ref) => {
    let {
      loaderData,
      children,
      product: _product,
      hideUnavailableOptions,
      showThumbnails,
      numberOfThumbnails,
      spacing,
      ...rest
    } = props;
    let {swatches} = useThemeSettings();

    let {storeDomain, product, variants} = loaderData?.data || {};
    let [selectedVariant, setSelectedVariant] = useState(variants?.nodes[0]);
    let [quantity, setQuantity] = useState<number>(1);
    useEffect(() => {
      setSelectedVariant(variants?.nodes?.[0]);
      setQuantity(1);
    }, [product, variants?.nodes]);
    if (!product)
      return (
        <section className="w-full py-12 md:py-24 lg:py-32" ref={ref} {...rest}>
          <ProductPlaceholder />
        </section>
      );

    let atcText = selectedVariant?.availableForSale
      ? 'Add to Cart'
      : selectedVariant?.quantityAvailable === -1
      ? 'Unavailable'
      : 'Sold Out';
    return (
      <section ref={ref} {...rest} className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-12">
            <ProductMedia
              media={product?.media.nodes}
              selectedVariant={selectedVariant}
              showThumbnails={showThumbnails}
              numberOfThumbnails={numberOfThumbnails}
              spacing={spacing}
            />
            <div className="flex flex-col justify-start space-y-5">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  {product?.title}
                </h2>
                <p className="text-2xl md:text-3xl/relaxed lg:text-2xl/relaxed xl:text-3xl/relaxed">
                  <Money
                    withoutTrailingZeros
                    data={selectedVariant?.price!}
                    as="span"
                  />
                </p>
                {children}
                <p
                  className="max-w-[600px] leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: product?.descriptionHtml,
                  }}
                />
                <ProductVariants
                  product={product}
                  selectedVariant={selectedVariant}
                  onSelectedVariantChange={setSelectedVariant}
                  swatch={swatches}
                  variants={variants}
                  options={product?.options}
                  handle={product?.handle}
                  hideUnavailableOptions={hideUnavailableOptions}
                />
              </div>
              <Quantity value={quantity} onChange={setQuantity} />
              <AddToCartButton
                disabled={!selectedVariant?.availableForSale}
                lines={[
                  {
                    merchandiseId: selectedVariant.id!,
                    quantity,
                  },
                ]}
                variant="primary"
                data-test="add-to-cart"
              >
                <span> {atcText}</span>
              </AddToCartButton>
              {selectedVariant?.availableForSale && (
                <ShopPayButton
                  width="100%"
                  variantIdsAndQuantities={[
                    {
                      id: selectedVariant.id!,
                      quantity,
                    },
                  ]}
                  storeDomain={storeDomain}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    );
  },
);

export let loader = async (args: ComponentLoaderArgs<SingleProductData>) => {
  let {weaverse, data} = args;
  let {storefront} = weaverse;
  if (!data?.product) {
    return null;
  }
  let productHandle = data.product.handle;
  let {product, shop} = await storefront.query<ProductQuery>(PRODUCT_QUERY, {
    variables: {
      handle: productHandle,
      selectedOptions: [],
      language: storefront.i18n.language,
      country: storefront.i18n.country,
    },
  });
  let variants = await storefront.query(VARIANTS_QUERY, {
    variables: {
      handle: productHandle,
      language: storefront.i18n.language,
      country: storefront.i18n.country,
    },
  });

  return defer({
    product,
    variants: variants?.product?.variants,
    storeDomain: shop.primaryDomain.url,
  });
};

export let schema: HydrogenComponentSchema = {
  type: 'single-product',
  title: 'Single product',
  childTypes: ['judgeme'],
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Single product',
      inputs: [
        {
          label: 'Choose product',
          type: 'product',
          name: 'product',
        },
        {
          label: 'Hide unavailable options',
          type: 'switch',
          name: 'hideUnavailableOptions',
        },
      ],
    },
    {
      group: 'Product Media',
      inputs: [
        {
          label: 'Show thumbnails',
          name: 'showThumbnails',
          type: 'switch',
          defaultValue: true,
        },
        {
          label: 'Number of thumbnails',
          name: 'numberOfThumbnails',
          type: 'range',
          condition: 'showThumbnails.eq.true',
          configs: {
            min: 1,
            max: 10,
          },
          defaultValue: 4,
        },
        {
          label: 'Gap between images',
          name: 'spacing',
          type: 'range',
          configs: {
            min: 0,
            step: 2,
            max: 100,
          },
          defaultValue: 10,
        },
      ],
    },
  ],
};

export default SingleProduct;
