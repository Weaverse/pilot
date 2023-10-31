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
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M24.5455 9.40918C23.4159 9.40918 22.5001 10.325 22.5001 11.4546C22.5001 12.5843 23.4159 13.5001 24.5455 13.5001C25.6752 13.5001 26.591 12.5843 26.591 11.4546C26.591 10.325 25.6752 9.40918 24.5455 9.40918ZM20.0455 11.4546C20.0455 8.96935 22.0603 6.95463 24.5455 6.95463C27.0308 6.95463 29.0455 8.96935 29.0455 11.4546C29.0455 13.9399 27.0308 15.9546 24.5455 15.9546C22.0603 15.9546 20.0455 13.9399 20.0455 11.4546Z" fill="#0F0F0F" fill-opacity="0.5" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M17.9062 0.40918H18.094C21.8713 0.409159 24.8316 0.409142 27.1413 0.719674C29.5054 1.03752 31.3709 1.7008 32.8351 3.16504C34.2994 4.62927 34.9626 6.49476 35.2805 8.85888C35.591 11.1686 35.591 14.1288 35.591 17.9062V18.094C35.591 21.8713 35.591 24.8316 35.2805 27.1413C34.9626 29.5054 34.2994 31.3709 32.8351 32.8351C31.3709 34.2994 29.5054 34.9626 27.1413 35.2805C24.8316 35.591 21.8713 35.591 18.094 35.591H17.9062C14.1288 35.591 11.1686 35.591 8.85888 35.2805C6.49476 34.9626 4.62927 34.2994 3.16504 32.8351C1.7008 31.3709 1.03752 29.5054 0.719674 27.1413C0.409142 24.8316 0.409159 21.8713 0.40918 18.094V17.9062C0.409159 14.1288 0.409142 11.1686 0.719674 8.85888C1.03752 6.49476 1.7008 4.62927 3.16504 3.16504C4.62927 1.7008 6.49476 1.03752 8.85888 0.719674C11.1686 0.409142 14.1288 0.409159 17.9062 0.40918ZM4.90066 31.0995C3.9685 30.1673 3.43358 28.9062 3.15233 26.8142C2.90119 24.9462 2.86857 22.5631 2.86435 19.3748L5.31084 17.2342C6.31576 16.3549 7.83032 16.4053 8.77452 17.3495L15.7941 24.3691C17.3403 25.9153 19.7744 26.1262 21.5635 24.8688L22.0515 24.5259C23.4558 23.539 25.3557 23.6533 26.6315 24.8015L31.9063 29.5489C31.9638 29.6006 32.0247 29.6458 32.0883 29.6847C31.8238 30.2425 31.4979 30.7011 31.0995 31.0995C30.1673 32.0317 28.9062 32.5666 26.8142 32.8478C24.687 33.1338 21.8917 33.1364 18.0001 33.1364C14.1084 33.1364 11.3132 33.1338 9.18594 32.8478C7.09401 32.5666 5.83283 32.0317 4.90066 31.0995ZM9.18594 3.15233C7.09401 3.43358 5.83283 3.9685 4.90066 4.90066C3.9685 5.83283 3.43358 7.09401 3.15233 9.18594C2.91484 10.9524 2.87276 13.1795 2.86532 16.1125L3.69452 15.3869C5.67194 13.6567 8.65221 13.7559 10.5101 15.6139L17.5297 22.6334C18.2325 23.3363 19.3389 23.4321 20.1522 22.8606L20.6401 22.5177C22.9806 20.8728 26.1472 21.0634 28.2735 22.9771L32.8127 27.0624C32.8248 26.981 32.8365 26.8983 32.8478 26.8142C33.1338 24.687 33.1364 21.8917 33.1364 18.0001C33.1364 14.1084 33.1338 11.3132 32.8478 9.18594C32.5666 7.09401 32.0317 5.83283 31.0995 4.90066C30.1673 3.9685 28.9062 3.43358 26.8142 3.15233C24.687 2.86633 21.8917 2.86373 18.0001 2.86373C14.1084 2.86373 11.3132 2.86633 9.18594 3.15233Z" fill="#0F0F0F" fill-opacity="0.5" />
            </svg>}
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
