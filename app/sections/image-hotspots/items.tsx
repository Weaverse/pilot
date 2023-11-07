import {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  ComponentLoaderArgs,
  getSelectedProductOptions,
  WeaverseProduct,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { Image } from '@shopify/hydrogen';
import { ProductQuery } from 'storefrontapi.generated';
import { PRODUCT_QUERY } from '~/data/queries';
import clsx from 'clsx';
import { CSSProperties } from 'react';
import { IconImageBlank } from '~/components';


type ProductData = {
  verticalPosition: number;
  horizontalPosition: number;
  product: WeaverseProduct;
};

type ProductsHotspotProps = HydrogenComponentProps<
  Awaited<ReturnType<typeof loader>>
> &
  ProductData;

let ProductHotspotItems = forwardRef<HTMLDivElement, ProductsHotspotProps>((props, ref) => {
  let { product, verticalPosition, horizontalPosition, loaderData, ...rest } = props;
  const ProductImage = loaderData?.product?.variants.nodes.map((variant) => variant.image);
  const ProductPrice = loaderData?.product?.variants.nodes.map((variant) => variant.price.amount) || '0.00';
  const ProductCurrency = loaderData?.product?.variants.nodes.map((variant) => variant.price.currencyCode) || '$';
  const ProductTittle = loaderData?.product?.title || 'Product title';
  console.log(loaderData?.product);

  let Horizontal = horizontalPosition >= 50 ? 'left-auto right-1/2' : 'right-auto left-1/2';
  let Vertical = verticalPosition >= 50 ? 'top-auto bottom-full' : 'bottom-auto top-full';
  let sectionStyle: CSSProperties = {
    left: `${horizontalPosition}%`,
    top: `${verticalPosition}%`,
  } as CSSProperties;
  return (
    <div ref={ref} {...rest} className='absolute group flex flex-col' style={sectionStyle} >
      <svg xmlns="http://www.w3.org/2000/svg" className='sm-max:w-4 sm-max:h-4 z-10 cursor-pointer' width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" fill="white" stroke="#0F0F0F" strokeWidth='8' />
      </svg>
      <div className={clsx('hidden z-20 aspect-[2/1] bg-white absolute group-hover:flex flex-row justify-center items-center w-96 sm-max:w-36', Horizontal, Vertical)}>
        <div className='w-1/2 bg-gray-300 h-full flex justify-center items-center'>
          {ProductImage ? ProductImage.map((image, index) => (
            <Image
              key={index}
              data={image ?? {}}
            />
          )) :
            <IconImageBlank className='!w-9 !h-9' viewBox='0 0 100 100' />}
        </div>
        <div className='text-center w-1/2 flex flex-col gap-2 justify-center items-center sm-max:gap-1'>
          <p className='box-border font-medium text text-[10px] sm:text-sm'>{ProductTittle}</p>
          <p className='box-content font-normal text-[10px] sm:text-sm'>{`${ProductPrice} ${ProductCurrency}`}</p>
        </div>
      </div>
    </div>
  );
});

export default ProductHotspotItems;

export let loader = async (args: ComponentLoaderArgs<ProductData>) => {
  let { weaverse, data } = args;
  let { storefront, request } = weaverse;
  if (data.product) {
    return await storefront.query<ProductQuery>(PRODUCT_QUERY, {
      variables: {
        handle: data.product.handle,
        selectedOptions: getSelectedProductOptions(request),
        language: storefront.i18n.language,
        country: storefront.i18n.country,
      },
    });
  }
  return null;
};


export let schema: HydrogenComponentSchema = {
  type: 'product-hotspot--items',
  title: 'Product hotspot items',
  inspector: [
    {
      group: 'Hotspot',
      inputs: [
        {
          type: 'product',
          name: 'product',
          label: 'Product',
        },
        {
          type: 'range',
          name: 'verticalPosition',
          label: 'Vertical position',
          defaultValue: 50,
          configs: {
            min: 5,
            max: 90,
            step: 5,
            unit: '%',
          },
        },
        {
          type: 'range',
          name: 'horizontalPosition',
          label: 'Horizontal position',
          defaultValue: 50,
          configs: {
            min: 5,
            max: 90,
            step: 5,
            unit: '%',
          },
        },
      ],
    },
  ],
};
