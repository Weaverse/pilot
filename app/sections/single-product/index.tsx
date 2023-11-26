import {Image, Money, ShopPayButton} from '@shopify/hydrogen';
import {
  ComponentLoaderArgs,
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseProduct,
} from '@weaverse/hydrogen';
import {forwardRef, useEffect, useState} from 'react';
import { ProductQuery } from 'storefrontapi.generated';
import { AddToCartButton } from '~/components';
import { PRODUCT_QUERY, VARIANTS_QUERY } from '~/data/queries';
import { Quantity } from './quantity';
import { ProductVariants } from './variants';
import { ProductPlaceholder } from './placeholder';
import { defer } from '@shopify/remix-oxygen';

type SingleProductData = {
  productsCount: number;
  product: WeaverseProduct;
};

type SingleProductProps = HydrogenComponentProps<
  Awaited<ReturnType<typeof loader>>
> &
  SingleProductData;


let SingleProduct = forwardRef<HTMLElement, SingleProductProps>(
  (props, ref) => {
    let {loaderData, children, product: _product, ...rest} = props;
    if (!loaderData?.data)
    return (
        <section className="w-full py-12 md:py-24 lg:py-32" ref={ref}>
          <ProductPlaceholder/>
        </section>
      );
    let {storeDomain, product, variants, variantSwatch} = loaderData.data;
    let [selectedVariant, setSelectedVariant] = useState(variants?.nodes[0]);
    let [quantity, setQuantity] = useState<number>(1);
    useEffect(() => {
      setSelectedVariant(variants?.nodes[0]);
    }, [_product.handle]);
    
    return (
      <section ref={ref} className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
            <Image
              data={selectedVariant.image}
              aspectRatio={'4/5'}
              className="object-cover w-full h-full aspect-square fadeIn"
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
                <p className="max-w-[600px] leading-relaxed">
                  {product?.descriptionHtml}
                </p>
                <ProductVariants
                  product={product}
                  selectedVariant={selectedVariant}
                  onSelectedVariantChange={setSelectedVariant}
                  swatch={variantSwatch}
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

interface swatchConfig {
  name: string;
  size: string;
  type: string;
  shape: string;
  displayName: string;
}

interface swatchData {
  colors: {
    name: string;
    value: string;
  }[];
  images: {
    name: string;
    value: string;
  }[];
}

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

  let swatchConfigs = [
    {
      name: 'Color',
      size: 'md',
      type: 'variant',
      shape: 'circle',
      displayName: 'Color',
    },
    {
      name: 'Size',
      size: 'md',
      type: 'button',
      shape: 'round',
      displayName: 'Size',
    },
  ];

  let swatchData = {
    colorSwatches: [
      {
        name: 'red',
        value: '#bc3535',
      },
      {
        name: 'blue',
        value: '#0000ff',
      },
      {
        name: 'green',
        value: '#00ff00',
      },
      {
        name: 'yellow',
        value: '#ffff00',
      },
      {
        name: 'black',
        value: '#000000',
      },
      {
        name: 'white',
        value: '#ffffff',
      },
    ],
    imageSwatches: [
      {
        name: 'white',
        value:
          'https://cdn.shopify.com/s/files/1/0838/0052/3057/files/photo-1657960526734-108dcd75a24e.avif?v=1699076026',
        // "value": {
        //   url: ".."
        //   id: "gid..."
        //   alt: ...
        //   width: ...
        // }
      },
      {
        name: 'red',
        value:
          'https://cdn.shopify.com/s/files/1/0838/0052/3057/files/photo-1657960526734-108dcd75a24e.avif?v=1699076026',
      },
      {
        name: 'black',
        value:
          'https://cdn.shopify.com/s/files/1/0838/0052/3057/files/photo-1657960526734-108dcd75a24e.avif?v=1699076026',
      },
    ],
  }

  return defer({
    product,
    variants: variants?.product?.variants,
    storeDomain: shop.primaryDomain.url,
    variantSwatch: {
      configs: swatchConfigs,
      swatches: swatchData,
    }
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
