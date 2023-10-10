import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  ComponentLoaderArgs,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';
import type {HomepageFeaturedCollectionsQuery} from 'storefrontapi.generated';
import {FeaturedCollections as HomeFeaturedCollections} from '~/components';
import {FEATURED_COLLECTIONS_QUERY} from '~/data/queries';

interface FeaturedCollectionsProps
  extends HydrogenComponentProps<Awaited<ReturnType<typeof loader>>> {
  heading: string;
  collectionsCount: number;
}

let FeaturedCollections = forwardRef<HTMLElement, FeaturedCollectionsProps>(
  (props, ref) => {
    let {loaderData, heading, collectionsCount, ...rest} = props;
    return (
      <section ref={ref} {...rest}>
        {loaderData?.collections?.nodes ? (
          <HomeFeaturedCollections
            collections={loaderData.collections}
            count={collectionsCount}
            title={heading}
          />
        ) : null}
      </section>
    );
  },
);

export default FeaturedCollections;

export let loader = async ({weaverse}: ComponentLoaderArgs) => {
  let {language, country} = weaverse.storefront.i18n;
  return await weaverse.storefront.query<HomepageFeaturedCollectionsQuery>(
    FEATURED_COLLECTIONS_QUERY,
    {
      variables: {
        country,
        language,
      },
    },
  );
};

export let schema: HydrogenComponentSchema = {
  type: 'featured-collections',
  title: 'Featured collections',
  limit: 1,
  enabledOn: {
    pages: ['INDEX'],
  },
  inspector: [
    {
      group: 'Featured collections',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Featured Collections',
          placeholder: 'Featured Collections',
        },
        {
          type: 'range',
          name: 'collectionsCount',
          label: 'Number of collections',
          defaultValue: 4,
          configs: {
            min: 1,
            max: 4,
            step: 1,
          },
        },
      ],
    },
  ],
  toolbar: ['general-settings', ['duplicate', 'delete']],
};
