import type {Media} from '@shopify/hydrogen/storefront-api-types';
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseLoaderArgs,
} from '@weaverse/hydrogen';
import clsx from 'clsx';
import {forwardRef} from 'react';
import type {SeoCollectionContentQuery} from 'storefrontapi.generated';
import {Heading, Link, Text} from '~/components';
import {SpreadMedia} from '~/components/Hero';
import {HOMEPAGE_SEO_QUERY} from '~/data/queries';

interface HeroProps
  extends HydrogenComponentProps<Awaited<ReturnType<typeof loader>>> {
  collectionHandle?: string;
  height?: 'full';
  top?: boolean;
  loading?: HTMLImageElement['loading'];
}

let Hero = forwardRef<HTMLElement, HeroProps>((props, ref) => {
  let {loaderData, height, loading, top, collectionHandle, ...rest} = props;
  if (loaderData) {
    let {byline, cta, handle, heading, spread, spreadSecondary} = loaderData;
    return (
      <section ref={ref} {...rest}>
        <Link to={`/collections/${handle}`}>
          <div
            className={clsx(
              'relative justify-end flex flex-col w-full',
              top && '-mt-nav',
              height === 'full'
                ? 'h-screen'
                : 'aspect-[4/5] sm:aspect-square md:aspect-[5/4] lg:aspect-[3/2] xl:aspect-[2/1]',
            )}
          >
            <div className="absolute inset-0 grid flex-grow grid-flow-col pointer-events-none auto-cols-fr -z-10 content-stretch overflow-clip">
              {spread?.reference && (
                <div>
                  <SpreadMedia
                    sizes={
                      spreadSecondary?.reference
                        ? '(min-width: 48em) 50vw, 100vw'
                        : '100vw'
                    }
                    data={spread.reference as Media}
                    loading={loading}
                  />
                </div>
              )}
              {spreadSecondary?.reference && (
                <div className="hidden md:block">
                  <SpreadMedia
                    sizes="50vw"
                    data={spreadSecondary.reference as Media}
                    loading={loading}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col items-baseline justify-between gap-4 px-6 py-8 sm:px-8 md:px-12 bg-gradient-to-t dark:from-contrast/60 dark:text-primary from-primary/60 text-contrast">
              {heading?.value && (
                <Heading format as="h2" size="display" className="max-w-md">
                  {heading.value}
                </Heading>
              )}
              {byline?.value && (
                <Text format width="narrow" as="p" size="lead">
                  {byline.value}
                </Text>
              )}
              {cta?.value && <Text size="lead">{cta.value}</Text>}
            </div>
          </div>
        </Link>
      </section>
    );
  }
  return <section ref={ref} {...rest} />;
});

export default Hero;

export let loader = async ({context, itemData}: WeaverseLoaderArgs) => {
  let {hero} = await context.storefront.query<SeoCollectionContentQuery>(
    HOMEPAGE_SEO_QUERY,
    {
      variables: {handle: itemData.data.collectionHandle || 'freestyle'},
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
  toolbar: ['general-settings', ['duplicate', 'delete']],
};
