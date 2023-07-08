import type {Media} from '@shopify/hydrogen/storefront-api-types';
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseLoaderArgs,
} from '@weaverse/hydrogen';
import clsx from 'clsx';
import {forwardRef} from 'react';
import type {CollectionContentFragment} from 'storefrontapi.generated';
import {Heading, Link, Text} from '~/components';
import {HOMEPAGE_SEO_QUERY} from './queries';
import {SpreadMedia} from './spred-media';

interface HeroProps
  extends HydrogenComponentProps<Awaited<ReturnType<typeof loader>>> {
  height?: 'full';
  top?: boolean;
  loading?: HTMLImageElement['loading'];
}

let Hero = forwardRef<HTMLElement, HeroProps>((props, ref) => {
  let {loaderData, height, loading, top, ...rest} = props;
  let {byline, cta, handle, heading, spread, spreadSecondary} =
    loaderData || {};
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
});

export default Hero;

export let loader = async ({context}: WeaverseLoaderArgs) => {
  let {hero} = await context.storefront.query(HOMEPAGE_SEO_QUERY, {
    variables: {handle: 'freestyle'},
  });
  return hero as CollectionContentFragment;
};

export let schema: HydrogenComponentSchema = {
  type: 'hero',
  title: 'Hero',
  childTypes: ['text'],
  inspector: [
    {
      group: 'Hero',
      inputs: [
        {
          type: 'image',
          label: 'Image',
          name: 'image',
          defaultValue:
            'https://images.unsplash.com/photo-1617606002806-94e279c22567?auto=format&fit=crop&w=1000&q=80',
        },
      ],
    },
  ],
  toolbar: ['general-settings', ['duplicate', 'delete']],
  presets: {
    children: [{type: 'text'}, {type: 'text'}],
  },
  flags: {
    isSection: true,
  },
};
