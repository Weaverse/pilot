import {Storefront} from '@shopify/hydrogen';
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseLoaderArgs,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';
import {
  ProductInfoQuery,
  ProductRecommendationsQuery,
} from 'storefrontapi.generated';
import {ProductSwimlane} from '~/components';
import {PRODUCT_INFO_QUERY, RECOMMENDED_PRODUCTS_QUERY} from '~/data/queries';

interface RecommendedProductsProps
  extends HydrogenComponentProps<Awaited<ReturnType<typeof loader>>> {
  heading: string;
  productsCount: number;
}

let RecommendedProducts = forwardRef<HTMLElement, RecommendedProductsProps>(
  (props, ref) => {
    let {loaderData, heading, productsCount, ...rest} = props;
    if (loaderData) {
      let {products} = loaderData;
      if (products) {
        return (
          <section ref={ref} {...rest}>
            <ProductSwimlane
              title={heading}
              count={productsCount}
              products={products}
            />
          </section>
        );
      }
    }
    return <section ref={ref} {...rest} />;
  },
);

export default RecommendedProducts;

export let loader = async ({context, params}: WeaverseLoaderArgs) => {
  let {productHandle} = params;
  let {product} = await context.storefront.query<ProductInfoQuery>(
    PRODUCT_INFO_QUERY,
    {
      variables: {
        handle: productHandle,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    },
  );
  if (product) {
    let productId = product.id;
    let products = await context.storefront.query<ProductRecommendationsQuery>(
      RECOMMENDED_PRODUCTS_QUERY,
      {
        variables: {productId, count: 12},
      },
    );

    let mergedProducts = (products.recommended ?? [])
      .concat(products.additional.nodes)
      .filter(
        (value, index, array) =>
          array.findIndex((value2) => value2.id === value.id) === index,
      );

    let originalProduct = mergedProducts.findIndex(
      (item) => item.id === productId,
    );

    mergedProducts.splice(originalProduct, 1);

    return {products: {nodes: mergedProducts}};
  }
  return {products: {nodes: []}};
};

export let schema: HydrogenComponentSchema = {
  type: 'recommended-products',
  title: 'Recommended products',
  inspector: [
    {
      group: 'Recommended products',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'You may also like',
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
