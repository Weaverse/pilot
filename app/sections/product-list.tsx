import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  ComponentLoaderArgs,
} from '@weaverse/hydrogen';
import {getPaginationVariables} from '@shopify/hydrogen';
import {forwardRef} from 'react';

import {ProductSwimlane} from '~/components';
import {COLLECTION_QUERY} from '~/data/queries';
import type {SortParam} from '~/components/SortFilter';
import {getSortValuesFromParam} from '~/routes/($locale).collections.$collectionHandle';
import {PAGINATION_SIZE} from '~/lib/const';

interface ProductListProps
  extends HydrogenComponentProps<Awaited<ReturnType<typeof loader>>> {
  heading: string;
  productsCount: number;
}

let ProductList = forwardRef<HTMLElement, ProductListProps>((props, ref) => {
  let {loaderData, heading, productsCount, ...rest} = props;
  let products = loaderData?.collection?.products;
  return (
    <section ref={ref} {...rest}>
      {products?.nodes?.length ? (
        <ProductSwimlane
          products={products}
          title={heading}
          count={productsCount}
        />
      ) : null}
    </section>
  );
});

export default ProductList;

export let loader = async ({weaverse, data}: ComponentLoaderArgs) => {
  let {language, country} = weaverse.storefront.i18n;
  let collectionHandle = data?.collection?.handle;

  const searchParams = new URL(weaverse.request.url).searchParams;

  const {sortKey, reverse} = getSortValuesFromParam(
    searchParams.get('sort') as SortParam,
  );
  const paginationVariables = getPaginationVariables(weaverse.request, {
    pageBy: PAGINATION_SIZE,
  });
  return await weaverse.storefront.query(COLLECTION_QUERY, {
    variables: {
      ...paginationVariables,
      handle: collectionHandle,
      country,
      language,
      sortKey,
      reverse,
      filters: [],
    },
  });
};

export let schema: HydrogenComponentSchema = {
  type: 'product-list',
  title: 'Product List',
  limit: 1,
  inspector: [
    {
      group: 'Product List',
      inputs: [
        {
          type: 'collection',
          name: 'collection',
          label: 'Collection',
        },
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Product List',
          placeholder: 'Product List',
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
