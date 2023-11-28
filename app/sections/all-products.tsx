import {useLoaderData} from '@remix-run/react';
import {Pagination} from '@shopify/hydrogen';
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';
import type {AllProductsQuery} from 'storefrontapi.generated';
import {Grid, PageHeader, ProductCard, Section} from '~/components';
import {getImageLoadingPriority} from '~/lib/const';

interface AllProductsProps extends HydrogenComponentProps {
  heading: string;
  prevPageText: string;
  nextPageText: string;
  paddingTop: number;
  paddingBottom: number;
}

let AllProducts = forwardRef<HTMLElement, AllProductsProps>((props, ref) => {
  let {
    heading,
    prevPageText,
    nextPageText,
    paddingTop,
    paddingBottom,
    ...rest
  } = props;
  let {products} = useLoaderData<AllProductsQuery>();

  return (
    <section ref={ref} {...rest}>
      <div
        style={{
          paddingTop: `${paddingTop}px`,
          paddingBottom: `${paddingBottom}px`,
        }}
      >
        <PageHeader heading={heading} variant="allCollections" />
        <Section>
          <Pagination connection={products}>
            {({nodes, isLoading, NextLink, PreviousLink}) => {
              let itemsMarkup = nodes.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  loading={getImageLoadingPriority(i)}
                />
              ));

              return (
                <>
                  <div className="flex items-center justify-center mt-6">
                    <PreviousLink className="inline-block rounded font-medium text-center py-3 px-6 border border-bar/10 bg-contrast text-body w-full">
                      {isLoading ? 'Loading...' : prevPageText}
                    </PreviousLink>
                  </div>
                  <Grid data-test="product-grid">{itemsMarkup}</Grid>
                  <div className="flex items-center justify-center mt-6">
                    <NextLink className="inline-block rounded font-medium text-center py-3 px-6 border border-bar/10 bg-contrast text-body w-full">
                      {isLoading ? 'Loading...' : nextPageText}
                    </NextLink>
                  </div>
                </>
              );
            }}
          </Pagination>
        </Section>
      </div>
    </section>
  );
});

export default AllProducts;

export let schema: HydrogenComponentSchema = {
  type: 'all-products',
  title: 'All products',
  limit: 1,
  enabledOn: {
    pages: ['ALL_PRODUCTS'],
  },
  toolbar: ['general-settings'],
  inspector: [
    {
      group: 'All products',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'All Products',
          placeholder: 'All Products',
        },
        {
          type: 'text',
          name: 'prevPageText',
          label: 'Previous page text',
          defaultValue: 'Previous',
          placeholder: 'Previous',
        },
        {
          type: 'text',
          name: 'nextPageText',
          label: 'Next page text',
          defaultValue: 'Next',
          placeholder: 'Next',
        },
        {
          type: 'range',
          label: 'Top padding',
          name: 'paddingTop',
          configs: {
            min: 0,
            max: 100,
            step: 4,
            unit: 'px',
          },
          defaultValue: 32,
        },
        {
          type: 'range',
          label: 'Bottom padding',
          name: 'paddingBottom',
          configs: {
            min: 0,
            max: 100,
            step: 4,
            unit: 'px',
          },
          defaultValue: 32,
        },
      ],
    },
  ],
};
