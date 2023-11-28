import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import type {CSSProperties} from 'react';
import {forwardRef} from 'react';
import {useLoaderData} from '@remix-run/react';
import type {CollectionDetailsQuery} from 'storefrontapi.generated';
import clsx from 'clsx';

interface HeaderProps extends HydrogenComponentProps {
  sectionHeightDesktop: number;
  sectionHeightMobile: number;
  enableBackground: boolean;
  overlayOpacity: number;
  enableOverlay: boolean;
  contentPosition: string;
}

let CollectHeader = forwardRef<HTMLElement, HeaderProps>((props, ref) => {
  let {
    sectionHeightDesktop,
    sectionHeightMobile,
    enableBackground,
    overlayOpacity,
    enableOverlay,
    contentPosition,
    ...rest
  } = props;
  let {collection} = useLoaderData<
    CollectionDetailsQuery & {
      collections: Array<{handle: string; title: string}>;
    }
  >();
  let backgroundStyle: CSSProperties = {
    '--header-height-desktop': `${sectionHeightDesktop}px`,
    '--header-height-mobile': `${sectionHeightMobile}px`,
  } as CSSProperties;

  if (enableBackground) {
    backgroundStyle.backgroundImage = `url('${collection?.image?.url}')`;
  }
  let overlayStyle: CSSProperties = {};
  if (enableOverlay && enableBackground) {
    overlayStyle = {
      '--overlay-opacity': `${overlayOpacity}`,
    } as CSSProperties;
  }
  let positionClass: {[key: string]: string} = {
    'top left': 'items-start justify-start',
    'top right': 'items-start justify-end',
    'top center': 'items-start justify-center',
    'center left': 'items-center justify-start',
    'center center': 'items-center justify-center',
    'center right': 'items-center justify-end',
    'bottom left': 'items-end justify-start',
    'bottom center': 'items-end justify-center',
    'bottom right': 'items-end justify-end',
  };
  return (
    <section
      ref={ref}
      {...rest}
      style={backgroundStyle}
      className={clsx(
        'flex relative overflow-hidden bg-center bg-no-repeat bg-cover h-[var(--header-height-mobile)] sm:h-[var(--header-height-desktop)]',
        positionClass[contentPosition],
      )}
    >
      {enableOverlay && enableBackground && (
        <div
          className="absolute inset-0 z-1 bg-black bg-opacity-[var(--overlay-opacity)]"
          style={overlayStyle}
        ></div>
      )}
      <div
        className={clsx(
          'text-center w-5/6 text-gray-700 z-2 relative',
          enableBackground ? 'text-white' : 'text-gray-700',
        )}
      >
        <h3 className="leading-tight font-medium">{collection?.title}</h3>
        {collection?.description && (
          <p className="mt-4 dark:text-gray-400 text-base md:text-sm">
            {collection.description}
          </p>
        )}
      </div>
    </section>
  );
});

export default CollectHeader;

export let schema: HydrogenComponentSchema = {
  type: 'collection-header',
  title: 'Collection header',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  enabledOn: {
    pages: ['COLLECTION'],
  },
  inspector: [
    {
      group: 'Header',
      inputs: [
        {
          type: 'switch',
          name: 'enableBackground',
          label: 'Enable background',
          defaultValue: true,
        },
        {
          type: 'range',
          name: 'sectionHeightDesktop',
          label: 'Section height desktop',
          defaultValue: 450,
          configs: {
            min: 350,
            max: 550,
            step: 10,
          },
        },
        {
          type: 'range',
          name: 'sectionHeightMobile',
          label: 'Section height mobile',
          defaultValue: 450,
          configs: {
            min: 350,
            max: 550,
            step: 10,
          },
        },
        {
          type: 'switch',
          name: 'enableOverlay',
          label: 'Enable overlay',
          defaultValue: true,
        },
        {
          type: 'range',
          name: 'overlayOpacity',
          label: 'Overlay opacity',
          defaultValue: 0.5,
          configs: {
            min: 0.1,
            max: 1,
            step: 0.1,
          },
          condition: `enableOverlay.eq.true`,
        },
        {
          type: 'position',
          name: 'contentPosition',
          label: 'Content position',
          defaultValue: 'center center',
        },
      ],
    },
  ],
};
