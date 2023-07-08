import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseLoaderArgs,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';
import type {HomepageFeaturedProductsQuery} from 'storefrontapi.generated';
import {ProductSwimlane} from './product-swimlane';
import {HOMEPAGE_FEATURED_PRODUCTS_QUERY} from './queries';

interface FeaturedProductProps
  extends HydrogenComponentProps<Awaited<ReturnType<typeof loader>>> {
  heading: string;
  productCount: number;
}

let FeaturedProduct = forwardRef<HTMLElement, FeaturedProductProps>(
  (props, ref) => {
    let {loaderData, heading, productCount, ...rest} = props;
    return (
      <section ref={ref} {...rest}>
        {loaderData?.products?.nodes ? (
          <ProductSwimlane
            products={loaderData.products}
            title={heading}
            count={productCount}
          />
        ) : null}
      </section>
    );
  },
);

export default FeaturedProduct;

export let loader = async ({context}: WeaverseLoaderArgs) => {
  let {language, country} = context.storefront.i18n;
  return await context.storefront.query<HomepageFeaturedProductsQuery>(
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
  inspector: [
    {
      group: 'Featured products',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Featured Products',
        },
        {
          type: 'range',
          name: 'productCount',
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
  flags: {
    isSection: true,
  },
};
