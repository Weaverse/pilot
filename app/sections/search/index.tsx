import {Form, useLoaderData} from '@remix-run/react';
import {Pagination} from '@shopify/hydrogen';
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';
import {PaginatedProductsSearchQuery} from 'storefrontapi.generated';

import {
  Grid,
  Heading,
  Input,
  PageHeader,
  ProductCard,
  Section,
} from '~/components';
import {getImageLoadingPriority} from '~/lib/const';
import {FeaturedData} from '~/routes/($locale).featured-products';
import {NoResults} from './no-results';

interface SearchProps extends HydrogenComponentProps {
  heading: string;
  searchInputPlaceholder: string;
  searchButtonText: string;
  noResultsText: string;
  showRelatedCollections: boolean;
  relatedCollectionsTitle: string;
  showRelatedProducts: boolean;
  relatedProductsTitle: string;
}

let Search = forwardRef<HTMLElement, SearchProps>((props, ref) => {
  let {searchTerm, products, noResultRecommendations} = useLoaderData<
    PaginatedProductsSearchQuery & {
      searchTerm: string;
      noResultRecommendations: FeaturedData | null;
    }
  >();
  let noResults = products?.nodes?.length === 0;
  let {
    heading,
    searchInputPlaceholder,
    searchButtonText,
    noResultsText,
    showRelatedCollections,
    relatedCollectionsTitle,
    showRelatedProducts,
    relatedProductsTitle,
    ...rest
  } = props;
  return (
    <section ref={ref} {...rest}>
      <PageHeader>
        <Heading as="h1" size="copy">
          {heading}
        </Heading>
        <Form method="get" className="relative flex w-full text-heading">
          <Input
            defaultValue={searchTerm}
            name="q"
            placeholder={searchInputPlaceholder}
            type="search"
            variant="search"
          />
          <button className="absolute right-0 py-2" type="submit">
            {searchButtonText}
          </button>
        </Form>
      </PageHeader>
      {!searchTerm || noResults ? (
        <NoResults
          noResults={noResults}
          recommendations={noResultRecommendations}
          noResultsText={noResultsText}
          showRelatedCollections={showRelatedCollections}
          relatedCollectionsTitle={relatedCollectionsTitle}
          showRelatedProducts={showRelatedProducts}
          relatedProductsTitle={relatedProductsTitle}
        />
      ) : (
        <Section>
          <Pagination connection={products}>
            {({nodes, isLoading, NextLink, PreviousLink}) => {
              const itemsMarkup = nodes.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  loading={getImageLoadingPriority(i)}
                />
              ));

              return (
                <>
                  <div className="flex items-center justify-center mt-6">
                    <PreviousLink className="inline-block rounded font-medium text-center py-3 px-6 border border-primary/10 bg-contrast text-primary w-full">
                      {isLoading ? 'Loading...' : 'Previous'}
                    </PreviousLink>
                  </div>
                  <Grid data-test="product-grid">{itemsMarkup}</Grid>
                  <div className="flex items-center justify-center mt-6">
                    <NextLink className="inline-block rounded font-medium text-center py-3 px-6 border border-primary/10 bg-contrast text-primary w-full">
                      {isLoading ? 'Loading...' : 'Next'}
                    </NextLink>
                  </div>
                </>
              );
            }}
          </Pagination>
        </Section>
      )}
    </section>
  );
});

export default Search;

export let schema: HydrogenComponentSchema = {
  type: 'search',
  title: 'Search',
  limit: 1,
  enabledOn: {
    pages: ['SEARCH'],
  },
  toolbar: ['general-settings'],
  inspector: [
    {
      group: 'Search',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Search',
          placeholder: 'Search',
        },
        {
          type: 'text',
          name: 'searchInputPlaceholder',
          label: 'Search input placeholder',
          defaultValue: 'Search our store...',
          placeholder: 'Search our store...',
        },
        {
          type: 'text',
          name: 'searchButtonText',
          label: 'Search button',
          defaultValue: 'Go',
          placeholder: 'Go',
        },
      ],
    },
    {
      group: 'No results',
      inputs: [
        {
          type: 'text',
          name: 'noResultsText',
          label: 'No results text',
          defaultValue: 'No results, try a different search.',
          placeholder: 'No results, try a different search.',
        },
        {
          type: 'switch',
          name: 'showRelatedCollections',
          label: 'Show related collections',
          defaultValue: true,
        },
        {
          type: 'text',
          name: 'relatedCollectionsTitle',
          label: 'Related collections title',
          defaultValue: 'Trending Collections',
          placeholder: 'Trending Collections',
          condition: 'showRelatedCollections.eq.true',
        },
        {
          type: 'switch',
          name: 'showRelatedProducts',
          label: 'Show related products',
          defaultValue: true,
        },
        {
          type: 'text',
          name: 'relatedProductsTitle',
          label: 'Related products title',
          defaultValue: 'Trending Products',
          placeholder: 'Trending Products',
          condition: 'showRelatedProducts.eq.true',
        },
      ],
    },
  ],
};
