import { Money, ShopPayButton } from '@shopify/hydrogen';
import { defer } from '@shopify/remix-oxygen';
import {
  ComponentLoaderArgs,
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseProduct,
  getSelectedProductOptions,
} from '@weaverse/hydrogen';
import { forwardRef, useState } from 'react';
import { ProductQuery } from 'storefrontapi.generated';
import { AddToCartButton, ProductGallery } from '~/components';
import { PRODUCT_QUERY, VARIANTS_QUERY } from '~/data/queries';
import { Quantity } from './quantity';
import { ProductVariants } from './variants';

type SingleProductData = {
  heading: string;
  productsCount: number;
  product: WeaverseProduct;
};

type SingleProductProps = HydrogenComponentProps<
  Awaited<ReturnType<typeof loader>>
> &
  SingleProductData;

let SingleProduct = forwardRef<HTMLElement, SingleProductProps>(
  (props, ref) => {
    let {loaderData, children, ...rest} = props;
    if (!loaderData) return <section {...rest} className='h-20 bg-gray-200 p-6' ref={ref}>
        Please select product to show single product
    </section>;
    let {storeDomain, product, variants} = loaderData.data  ;
    let productTitle = product?.title;
    let [selectedVariant, setSelectedVariant] = useState(variants?.nodes[0]);
    let [quantity, setQuantity] = useState<number>(1);
    return (
      <section ref={ref} {...rest} className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
            <ProductGallery
              media={product?.media.nodes}
              className="mx-auto aspect-[1/1] overflow-hidden rounded-xl object-cover object-center sm:w-full"
            />
            <div className="flex flex-col justify-start space-y-5">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  {productTitle}
                </h2>
                <p className="text-2xl text-zinc-500 md:text-3xl/relaxed lg:text-2xl/relaxed xl:text-3xl/relaxed dark:text-zinc-400">
                  <Money
                    withoutTrailingZeros
                    data={selectedVariant?.price!}
                    as="span"
                  />
                </p>
                {children}
                <p className="max-w-[600px] text-zinc-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-zinc-400">
                  {product?.descriptionHtml}
                </p>
                <ProductVariants
                  selectedVariant={selectedVariant}
                  onSelectedVariantChange={setSelectedVariant}
                  variants={variants}
                  options={product?.options}
                  handle={product?.handle}
                />
              </div>
              <Quantity value={quantity} onChange={setQuantity} />
              <AddToCartButton
                lines={[
                  {
                    merchandiseId: selectedVariant.id!,
                    quantity,
                  },
                ]}
                variant="primary"
                data-test="add-to-cart"
              >
                <span> Add to Cart</span>
              </AddToCartButton>
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
  let selectedOptions = getSelectedProductOptions(weaverse.request);
  if (!data?.product) {
    return null;
  }
  let productHandle = data.product.handle;
  let {product, shop} = await storefront.query<ProductQuery>(PRODUCT_QUERY, {
    variables: {
      handle: productHandle,
      // Should not get from request since this section could be used everywhere
      // TODO: update the query to not require `selectedOptions` or create a new query for this component
      selectedOptions,
      language: storefront.i18n.language,
      country: storefront.i18n.country,
    },
  });
  // In order to show which variants are available in the UI, we need to query
  // all of them. But there might be a *lot*, so instead separate the variants
  // into it's own separate query that is deferred. So there's a brief moment
  // where variant options might show as available when they're not, but after
  // this deferred query resolves, the UI will update.
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
      ],
    },
  ],
};

export default SingleProduct;
