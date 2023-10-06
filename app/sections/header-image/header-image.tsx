import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { CSSProperties } from 'react';
import clsx from 'clsx';
import { Image } from '@shopify/hydrogen';

interface HeaderImageProps extends HydrogenComponentProps {
  backgroundImage: {
    url: string;
    altText: string;
    width?: number;
    height?: number;
  };
  contentAlignment: string;
  enableOverlay: boolean;
  overlayColor: string;
  overlayOpacity: number;
  sectionHeight: string;
  buttonLabel: string;
  buttonLink: string;
  loading: HTMLImageElement['loading'];
}

let HeaderImage = forwardRef<HTMLElement, HeaderImageProps>((props, ref) => {
  let { backgroundImage, contentAlignment, enableOverlay, overlayColor, overlayOpacity, sectionHeight, buttonLabel, buttonLink, loading, children, ...rest } = props;
  let sectionStyle: CSSProperties = {
    justifyContent: `${contentAlignment}`,
    '--section-height': `${sectionHeight}`,
    '--overlay-opacity': `${overlayOpacity}%`,
    '--overlay-color': `${overlayColor}`
  } as CSSProperties;


  return (
    <section ref={ref} {...rest} className={clsx(
      'flex relative self-stretch gap-3 items-center overflow-hidden h-[var(--section-height)]',
      enableOverlay && backgroundImage ? 'text-white' : 'text-black'
    )} style={sectionStyle}>
      <div className='absolute inset-0'>
        {backgroundImage && <Image data={backgroundImage} loading={loading} className='w-full h-full object-cover' />}
        {enableOverlay && backgroundImage && <div className='absolute inset-0 bg-[var(--overlay-color)] opacity-[var(--overlay-opacity)]'></div>}
      </div>
      <div className='text-center relative mx-12 z-10'>
        {children?.map((child) => {
              return child;
            })}
        {buttonLabel && <a href={`${buttonLink}`} className='bg-gray-900 text-white py-3 px-4 rounded'>{buttonLabel}</a>}
      </div>
    </section>
  );
});

export default HeaderImage;

export let schema: HydrogenComponentSchema = {
  type: 'header-image',
  title: 'Image',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Image',
      inputs: [
        {
          type: 'image',
          name: 'backgroundImage',
          label: 'Background image',
        },
        {
          type: 'toggle-group',
          label: 'Content alignment',
          name: 'contentAlignment',
          configs: {
            options: [
              { label: 'Left', value: 'flex-start' },
              { label: 'Center', value: 'center' },
              { label: 'Right', value: 'flex-end' },
            ],
          },
          defaultValue: 'center',
        },
        {
          type: 'switch',
          name: 'enableOverlay',
          label: 'Enable overlay',
          defaultValue: true,
        },
        {
          type: 'color',
          name: 'overlayColor',
          label: 'Overlay color',
          defaultValue: '#333333',
          condition: `enableOverlay.eq.true`,
        },
        {
          type: 'range',
          name: 'overlayOpacity',
          label: 'Overlay opacity',
          defaultValue: 50,
          configs: {
            min: 10,
            max: 100,
            step: 10,
            unit: '%',
          },
          condition: `enableOverlay.eq.true`
        },
        {
          type: 'text',
          name: 'sectionHeight',
          label: 'Section height',
          defaultValue: '480px',
          placeholder: 'Example: 100px',
        },
        {
          type: 'text',
          name: 'buttonLabel',
          label: 'Button label',
          defaultValue: 'Button',
        },
        {
          type: 'text',
          name: 'buttonLink',
          label: 'Button link',
          placeholder: 'https://',
        },
        {
          type: 'toggle-group',
          name: 'loading',
          label: 'Background image loading',
          defaultValue: 'eager',
          configs: {
            options: [
              { label: 'Eager', value: 'eager', icon: 'Lightning' },
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
      ],
    },
  ],
  childTypes: ['heading--item', 'subheading--item', 'description-text--item'],
  presets: {
    children: [
      {
        type: 'heading--item',
      },
      {
        type: 'subheading--item',
      },
      {
        type: 'description-text--item',
      }
    ],
  },
};
