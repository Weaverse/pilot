import {useLoaderData} from '@remix-run/react';
import {Pagination} from '@shopify/hydrogen';
import type {Filter} from '@shopify/hydrogen/storefront-api-types';
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';
import {CollectionDetailsQuery} from 'storefrontapi.generated';
import {
  Button,
  Grid,
  PageHeader,
  ProductCard,
  Section,
  SortFilter,
  Text,
} from '~/components';
import type {AppliedFilter} from '~/components/SortFilter';
import {getImageLoadingPriority} from '~/lib/const';

interface CollectionFiltersProps extends HydrogenComponentProps {
  showCollectionDescription: boolean;
  loadPrevText: string;
  loadMoreText: string;
}

let CollectionFilters = forwardRef<HTMLElement, CollectionFiltersProps>(
  (props, ref) => {
    let {showCollectionDescription, loadPrevText, loadMoreText, ...rest} =
      props;
    let {collection, collections, appliedFilters} = useLoaderData<
      CollectionDetailsQuery & {
        collections: Array<{handle: string; title: string}>;
        appliedFilters: AppliedFilter[];
      }
    >();
    if (collection?.products && collections) {
      return (
        <section ref={ref} {...rest}>
          <PageHeader heading={collection.title}>
            {showCollectionDescription && collection?.description && (
              <div className="flex items-baseline justify-between w-full">
                <div>
                  <Text format width="narrow" as="p" className="inline-block">
                    {collection.description}
                  </Text>
                </div>
              </div>
            )}
          </PageHeader>
          <Section as="div">
            <SortFilter
              filters={collection.products.filters as Filter[]}
              appliedFilters={appliedFilters}
              collections={collections}
            >
              <Pagination connection={collection.products}>
                {({nodes, isLoading, PreviousLink, NextLink}) => (
                  <>
                    <div className="flex items-center justify-center mb-6">
                      <Button
                        as={PreviousLink}
                        variant="secondary"
                        width="full"
                      >
                        {isLoading ? 'Loading...' : loadPrevText}
                      </Button>
                    </div>
                    <Grid layout="products">
                      {nodes.map((product, i) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          loading={getImageLoadingPriority(i)}
                        />
                      ))}
                    </Grid>
                    <div className="flex items-center justify-center mt-6">
                      <Button as={NextLink} variant="secondary" width="full">
                        {isLoading ? 'Loading...' : loadMoreText}
                      </Button>
                    </div>
                  </>
                )}
              </Pagination>
            </SortFilter>
          </Section>
        </section>
      );
    }
    return <section ref={ref} {...rest} />;
  },
);

export default CollectionFilters;

export let schema: HydrogenComponentSchema = {
  type: 'collection-filters',
  title: 'Collection filters',
  limit: 1,
  enabledOn: {
    pages: ['COLLECTION'],
  },
  toolbar: ['general-settings'],
  inspector: [
    {
      group: 'Collection filters',
      inputs: [
        {
          type: 'switch',
          name: 'showCollectionDescription',
          label: 'Show collection description',
          defaultValue: true,
        },
        {
          type: 'text',
          name: 'loadPrevText',
          label: 'Load previous text',
          defaultValue: 'Load previous',
        },
        {
          type: 'text',
          name: 'loadMoreText',
          label: 'Load more text',
          defaultValue: 'Load more products',
        },
      ],
    },
  ],
};
