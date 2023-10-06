import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  ComponentLoaderArgs,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';
import type {HomepageFeaturedProductsQuery} from 'storefrontapi.generated';
import {ProductSwimlane} from '~/components';
import {HOMEPAGE_FEATURED_PRODUCTS_QUERY} from '~/data/queries';

interface FeaturedProductsProps
  extends HydrogenComponentProps<Awaited<ReturnType<typeof loader>>> {
  heading: string;
  productsCount: number;
}

let FeaturedProducts = forwardRef<HTMLElement, FeaturedProductsProps>(
  (props, ref) => {
    let {loaderData, heading, productsCount, ...rest} = props;
    return (
      <section ref={ref} {...rest}>
        {loaderData?.products?.nodes ? (
          <ProductSwimlane
            products={loaderData.products}
            title={heading}
            count={productsCount}
          />
        ) : null}
      </section>
    );
  },
);

export default FeaturedProducts;

export let loader = async ({weaverse}: ComponentLoaderArgs) => {
  let {language, country} = weaverse.storefront.i18n;
  return await weaverse.storefront.query<HomepageFeaturedProductsQuery>(
    HOMEPAGE_FEATURED_PRODUCTS_QUERY,
    {
      variables: {
        country,
        language,
      },
    },
  );
};

export let schema: HydrogenComponentSchema = {
  type: 'featured-products',
  title: 'Featured products',
  limit: 1,
  enabledOn: {
    pages: ['INDEX'],
  },
  inspector: [
    {
      group: 'Featured products',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Featured Products',
          placeholder: 'Featured Products',
        },
        {
          type: 'range',
          name: 'productsCount',
          label: 'Number of products',
          defaultValue: 12,
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
