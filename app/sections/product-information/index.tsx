import {useLoaderData} from '@remix-run/react';
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import clsx from 'clsx';
import {forwardRef} from 'react';
import type {ProductQuery, VariantsQuery} from 'storefrontapi.generated';
import {Heading, ProductGallery, Section, Text} from '~/components';
import {getExcerpt} from '~/lib/utils';
import {ProductDetail} from './product-detail';
import {ProductForm} from './product-form';

let gallerySizeMap = {
  small: 'lg:col-span-2',
  medium: 'lg:col-span-3',
  large: 'lg:col-span-4',
};

interface ProductInformationProps extends HydrogenComponentProps {
  gallerySize: 'small' | 'medium' | 'large';
  addToCartText: string;
  soldOutText: string;
  showVendor: boolean;
  showSalePrice: boolean;
  showDetails: boolean;
  showShippingPolicy: boolean;
  showRefundPolicy: boolean;
}

let ProductInformation = forwardRef<HTMLDivElement, ProductInformationProps>(
  (props, ref) => {
    let {product, shop, variants} = useLoaderData<
      ProductQuery & {
        variants: VariantsQuery;
      }
    >();
    let {
      gallerySize,
      addToCartText,
      soldOutText,
      showVendor,
      showSalePrice,
      showDetails,
      showShippingPolicy,
      showRefundPolicy,
      ...rest
    } = props;
    if (product && variants) {
      const {media, title, vendor, descriptionHtml} = product;
      const {shippingPolicy, refundPolicy} = shop;
      return (
        <section ref={ref} {...rest}>
          <Section as="div" className="px-0 md:px-8 lg:px-12">
            <div className="grid items-start md:gap-6 lg:gap-20 md:grid-cols-2 lg:grid-cols-6">
              <ProductGallery
                media={media.nodes}
                className={clsx('w-full', gallerySizeMap[gallerySize])}
              />
              <div
                className={clsx(
                  'sticky md:-mb-nav md:top-nav md:-translate-y-nav md:h-screen md:pt-nav hiddenScroll md:overflow-y-scroll',
                  gallerySizeMap[
                    gallerySize === 'small'
                      ? 'large'
                      : gallerySize === 'large'
                      ? 'small'
                      : 'medium'
                  ],
                )}
              >
                <section className="flex flex-col w-full gap-8 p-6 md:mx-auto md:px-0">
                  <div className="grid gap-2">
                    <Heading as="h1" className="whitespace-normal">
                      {title}
                    </Heading>
                    {showVendor && vendor && (
                      <Text className={'opacity-50 font-medium'}>{vendor}</Text>
                    )}
                  </div>
                  <ProductForm
                    variants={variants.product?.variants.nodes || []}
                    addToCartText={addToCartText}
                    soldOutText={soldOutText}
                    showSalePrice={showSalePrice}
                  />
                  <div className="grid gap-4 py-4">
                    {showDetails && descriptionHtml && (
                      <ProductDetail
                        title="Product Details"
                        content={descriptionHtml}
                      />
                    )}
                    {showShippingPolicy && shippingPolicy?.body && (
                      <ProductDetail
                        title="Shipping"
                        content={getExcerpt(shippingPolicy.body)}
                        learnMore={`/policies/${shippingPolicy.handle}`}
                      />
                    )}
                    {showRefundPolicy && refundPolicy?.body && (
                      <ProductDetail
                        title="Returns"
                        content={getExcerpt(refundPolicy.body)}
                        learnMore={`/policies/${refundPolicy.handle}`}
                      />
                    )}
                  </div>
                </section>
              </div>
            </div>
          </Section>
        </section>
      );
    }
    return <div ref={ref} {...rest} />;
  },
);

export default ProductInformation;

export let schema: HydrogenComponentSchema = {
  type: 'product-information',
  title: 'Product information',
  limit: 1,
  enabledOn: {
    pages: ['PRODUCT'],
  },
  inspector: [
    {
      group: 'Product gallery',
      inputs: [
        {
          type: 'toggle-group',
          label: 'Gallery size',
          name: 'gallerySize',
          configs: {
            options: [
              {value: 'small', label: 'Small'},
              {value: 'medium', label: 'Medium'},
              {value: 'large', label: 'Large'},
            ],
          },
          defaultValue: 'large',
          helpText: 'Apply on large screens only.',
        },
      ],
    },
    {
      group: 'Product form',
      inputs: [
        {
          type: 'text',
          label: 'Add to cart text',
          name: 'addToCartText',
          defaultValue: 'Add to cart',
          placeholder: 'Add to cart',
        },
        {
          type: 'text',
          label: 'Sold out text',
          name: 'soldOutText',
          defaultValue: 'Sold out',
          placeholder: 'Sold out',
        },
        {
          type: 'switch',
          label: 'Show vendor',
          name: 'showVendor',
          defaultValue: true,
        },
        {
          type: 'switch',
          label: 'Show sale price',
          name: 'showSalePrice',
          defaultValue: true,
        },
        {
          type: 'switch',
          label: 'Show details',
          name: 'showDetails',
          defaultValue: true,
        },
        {
          type: 'switch',
          label: 'Show shipping policy',
          name: 'showShippingPolicy',
          defaultValue: true,
        },
        {
          type: 'switch',
          label: 'Show refund policy',
          name: 'showRefundPolicy',
          defaultValue: true,
        },
      ],
    },
  ],
  toolbar: ['general-settings', ['duplicate', 'delete']],
};
