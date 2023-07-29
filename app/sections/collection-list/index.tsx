import {useLoaderData} from '@remix-run/react';
import {Pagination} from '@shopify/hydrogen';
import type {Collection} from '@shopify/hydrogen/storefront-api-types';
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';
import type {CollectionsQuery} from 'storefrontapi.generated';
import {Button, Grid, PageHeader, Section} from '~/components';
import {getImageLoadingPriority} from '~/lib/const';
import {CollectionCard} from './collection-card';

interface CollectionListProps extends HydrogenComponentProps {
  heading: string;
  prevButtonText: string;
  nextButtonText: string;
  imageAspectRatio: string;
}

let CollectionList = forwardRef<HTMLElement, CollectionListProps>(
  (props, ref) => {
    let {collections} = useLoaderData<CollectionsQuery>();
    let {heading, prevButtonText, nextButtonText, imageAspectRatio, ...rest} =
      props;
    return (
      <section ref={ref} {...rest}>
        <PageHeader heading={heading} />
        <Section as="div">
          <Pagination connection={collections}>
            {({nodes, isLoading, PreviousLink, NextLink}) => (
              <>
                <div className="flex items-center justify-center mb-6">
                  <Button as={PreviousLink} variant="secondary" width="full">
                    {isLoading ? 'Loading...' : prevButtonText}
                  </Button>
                </div>
                <Grid
                  items={nodes.length === 3 ? 3 : 2}
                  data-test="collection-grid"
                >
                  {nodes.map((collection, i) => (
                    <CollectionCard
                      key={collection.id}
                      collection={collection as Collection}
                      imageAspectRatio={imageAspectRatio}
                      loading={getImageLoadingPriority(i, 2)}
                    />
                  ))}
                </Grid>
                <div className="flex items-center justify-center mt-6">
                  <Button as={NextLink} variant="secondary" width="full">
                    {isLoading ? 'Loading...' : nextButtonText}
                  </Button>
                </div>
              </>
            )}
          </Pagination>
        </Section>
      </section>
    );
  },
);

export default CollectionList;

export let schema: HydrogenComponentSchema = {
  type: 'collection-list',
  title: 'Collection list',
  limit: 1,
  enabledOn: {
    pages: ['COLLECTION_LIST'],
  },
  toolbar: ['general-settings'],
  inspector: [
    {
      group: 'Collection list',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Collections',
          placeholder: 'Collections',
        },
        {
          type: 'text',
          name: 'prevButtonText',
          label: 'Previous collections text',
          defaultValue: 'Previous collections',
          placeholder: 'Previous collections',
        },
        {
          type: 'text',
          name: 'nextButtonText',
          label: 'Next collections text',
          defaultValue: 'Next collections',
          placeholder: 'Next collections',
        },
      ],
    },
    {
      group: 'Collection card',
      inputs: [
        {
          type: 'select',
          label: 'Image aspect ratio',
          name: 'imageAspectRatio',
          configs: {
            options: [
              {value: 'auto', label: 'Adapt to image'},
              {value: '1/1', label: '1/1'},
              {value: '3/4', label: '3/4'},
              {value: '4/3', label: '4/3'},
              {value: '6/4', label: '6/4'},
            ],
          },
          defaultValue: 'auto',
        },
      ],
    },
  ],
};
