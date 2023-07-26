import {useLoaderData} from '@remix-run/react';
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseLoaderArgs,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';
import {Heading, ProductGallery, Section, Text} from '~/components';
import {getExcerpt} from '~/lib/utils';
import {ProductDetail} from './product-detail';
import {ProductForm} from './product-form';
import {ProductQuery} from 'storefrontapi.generated';
import {PRODUCT_QUERY} from '~/data/queries';
import {SelectedOptionInput} from '@shopify/hydrogen/storefront-api-types';
import {AnalyticsPageType, ShopifyAnalyticsProduct} from '@shopify/hydrogen';

interface ProductInformationProps
  extends HydrogenComponentProps<Awaited<ReturnType<typeof loader>>> {
  // heading: string;
  // productsCount: number;
}

let ProductInformation = forwardRef<HTMLDivElement, ProductInformationProps>(
  (props, ref) => {
    let {loaderData, ...rest} = props;
    if (loaderData) {
      let {product, shop, analytics, storeDomain} = loaderData;
      if (product) {
        let {media, title, vendor, descriptionHtml} = product;
        let {shippingPolicy, refundPolicy} = shop;
        return (
          <section ref={ref} {...rest}>
            <Section as="div" className="px-0 md:px-8 lg:px-12">
              <div className="grid items-start md:gap-6 lg:gap-20 md:grid-cols-2 lg:grid-cols-3">
                <ProductGallery
                  media={media.nodes}
                  className="w-full lg:col-span-2"
                />
                <div className="sticky md:-mb-nav md:top-nav md:-translate-y-nav md:h-screen md:pt-nav hiddenScroll md:overflow-y-scroll">
                  <section className="flex flex-col w-full max-w-xl gap-8 p-6 md:mx-auto md:max-w-sm md:px-0">
                    <div className="grid gap-2">
                      <Heading as="h1" className="whitespace-normal">
                        {title}
                      </Heading>
                      {vendor && (
                        <Text className={'opacity-50 font-medium'}>
                          {vendor}
                        </Text>
                      )}
                    </div>
                    <ProductForm
                      product={product}
                      analytics={analytics}
                      storeDomain={storeDomain}
                    />
                    <div className="grid gap-4 py-4">
                      {descriptionHtml && (
                        <ProductDetail
                          title="Product Details"
                          content={descriptionHtml}
                        />
                      )}
                      {shippingPolicy?.body && (
                        <ProductDetail
                          title="Shipping"
                          content={getExcerpt(shippingPolicy.body)}
                          learnMore={`/policies/${shippingPolicy.handle}`}
                        />
                      )}
                      {refundPolicy?.body && (
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
    }
    return <div ref={ref} {...rest} />;
  },
);

export default ProductInformation;

export let loader = async ({context, request, params}: WeaverseLoaderArgs) => {
  let {productHandle} = params;
  let searchParams = new URL(request.url).searchParams;
  let selectedOptions: SelectedOptionInput[] = [];
  searchParams.forEach((value, name) => {
    selectedOptions.push({name, value});
  });

  let {shop, product} = await context.storefront.query<ProductQuery>(
    PRODUCT_QUERY,
    {
      variables: {
        handle: productHandle,
        selectedOptions,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    },
  );

  if (product) {
    let firstVariant = product.variants.nodes[0];
    let selectedVariant = product.selectedVariant ?? firstVariant;
    let productAnalytics: ShopifyAnalyticsProduct = {
      productGid: product.id,
      variantGid: selectedVariant.id,
      name: product.title,
      variantName: selectedVariant.title,
      brand: product.vendor,
      price: selectedVariant.price.amount,
    };
    return {
      shop,
      product,
      storeDomain: shop.primaryDomain.url,
      analytics: {
        pageType: AnalyticsPageType.product,
        resourceId: product.id,
        products: [productAnalytics],
        totalValue: parseFloat(selectedVariant.price.amount),
      },
    };
  }
  return null;
};

export let schema: HydrogenComponentSchema = {
  type: 'product-information',
  title: 'Product information',
  inspector: [
    {
      group: 'Product information',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Featured Products',
        },
        {
          type: 'range',
          name: 'productsCount',
          label: 'Number of products',
          defaultValue: 4,
          configs: {
            min: 1,
            max: 12,
            step: 1,
          },
        },
      ],
    },
  ],
  toolbar: ['general-settings', ['duplicate', 'delete']],
};
