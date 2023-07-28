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

interface CollectionFiltersProps extends HydrogenComponentProps {}

let CollectionFilters = forwardRef<HTMLElement, CollectionFiltersProps>(
  (props, ref) => {
    const {...rest} = props;
    const {collection, collections, appliedFilters} = useLoaderData<
      CollectionDetailsQuery & {
        collections: Array<{handle: string; title: string}>;
        appliedFilters: AppliedFilter[];
      }
    >();
    if (collection?.products && collections) {
      return (
        <section ref={ref} {...rest}>
          <PageHeader heading={collection.title}>
            {collection?.description && (
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
                        {isLoading ? 'Loading...' : 'Load previous'}
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
                        {isLoading ? 'Loading...' : 'Load more products'}
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
          type: 'collection',
          name: 'collectionHandle',
          label: 'Preview',
          defaultValue: 'frontpage',
        },
        {
          type: 'toggle-group',
          name: 'loading',
          label: 'Background image loading',
          defaultValue: 'eager',
          configs: {
            options: [
              {label: 'Eager', value: 'eager', icon: 'Lightning'},
              {
                label: 'Lazy',
                value: 'lazy',
                icon: 'SpinnerGap',
                weight: 'light',
              },
            ],
          },
          helpText:
            'Learn more about <a href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/loading" target="_blank" rel="noopener noreferrer">image loading strategies</a>.',
        },
        {
          type: 'select',
          label: 'Height',
          name: 'height',
          configs: {
            options: [
              {label: 'Auto', value: 'auto'},
              {label: 'Fullscreen', value: 'full'},
            ],
          },
          defaultValue: 'auto',
        },
        {
          type: 'switch',
          name: 'top',
          label: 'Top',
          defaultValue: true,
          helpText:
            'Push the hero to the top of the page by adding a negative margin.',
        },
      ],
    },
  ],
};
