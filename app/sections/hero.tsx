import type {
  ComponentLoaderArgs,
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';
import type {SeoCollectionContentQuery} from 'storefrontapi.generated';
import {Hero} from '~/components/Hero';
import {HOMEPAGE_SEO_QUERY} from '~/data/queries';

type HeroSectionData = {
  collectionHandle: string;
  height: 'full';
  top: boolean;
  loading: HTMLImageElement['loading'];
};

let HeroSection = forwardRef<
  HTMLElement,
  HydrogenComponentProps<Awaited<ReturnType<typeof loader>>> & HeroSectionData
>((props, ref) => {
  let {loaderData, height, loading, top, collectionHandle, ...rest} = props;
  if (loaderData) {
    return (
      <section ref={ref} {...rest}>
        <Hero height={height} loading={loading} top={top} {...loaderData} />
      </section>
    );
  }
  return <section ref={ref} {...rest} />;
});

export default HeroSection;

export let loader = async (args: ComponentLoaderArgs<HeroSectionData>) => {
  let {weaverse, data} = args;
  let {hero} = await weaverse.storefront.query<SeoCollectionContentQuery>(
    HOMEPAGE_SEO_QUERY,
    {
      variables: {handle: data.collectionHandle || 'frontpage'},
    },
  );
  return hero;
};

export let schema: HydrogenComponentSchema = {
  type: 'hero',
  title: 'Hero',
  inspector: [
    {
      group: 'Hero',
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
          name: 'height',
          label: 'Height',
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
  toolbar: ['general-settings', ['duplicate', 'delete']],
};
