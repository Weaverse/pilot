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
  collectionHandle?: string;
  height?: 'full';
  top?: boolean;
  loading?: HTMLImageElement['loading'];
}

let FeaturedProduct = forwardRef<HTMLElement, FeaturedProductProps>(
  (props, ref) => {
    let {loaderData, height, loading, top, collectionHandle, ...rest} = props;
    return (
      <section ref={ref} {...rest}>
        {loaderData?.products?.nodes ? (
          <ProductSwimlane
            products={loaderData.products}
            title="Featured Products"
            count={4}
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
  type: 'featured-product',
  title: 'Featured product',
  inspector: [
    {
      group: 'Featured product',
      inputs: [
        {
          type: 'text',
          name: 'title',
          label: 'Heading',
          defaultValue: 'Featured Products',
        },
        {
          type: 'range',
          name: 'count',
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
