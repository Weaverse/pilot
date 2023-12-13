import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseImage,
} from '@weaverse/hydrogen';
import type {CSSProperties} from 'react';
import {forwardRef} from 'react';
import clsx from 'clsx';
import {Image} from '@shopify/hydrogen';
import {IconImageBlank} from '~/components';

interface HeaderImageProps extends HydrogenComponentProps {
  backgroundImage: WeaverseImage;
  contentAlignment: string;
  enableOverlay: boolean;
  overlayColor: string;
  overlayOpacity: number;
  sectionHeightDesktop: number;
  sectionHeightMobile: number;
}

let HeaderImage = forwardRef<HTMLElement, HeaderImageProps>((props, ref) => {
  let {
    backgroundImage,
    contentAlignment,
    enableOverlay,
    overlayColor,
    overlayOpacity,
    sectionHeightDesktop,
    sectionHeightMobile,
    children,
    ...rest
  } = props;
  let sectionStyle: CSSProperties = {
    justifyContent: `${contentAlignment}`,
    '--section-height-desktop': `${sectionHeightDesktop}px`,
    '--section-height-mobile': `${sectionHeightMobile}px`,
    '--overlay-opacity': `${overlayOpacity}%`,
    '--overlay-color': `${overlayColor}`,
    '--max-width-content': '600px',
  } as CSSProperties;

  return (
    <section
      ref={ref}
      {...rest}
      className={clsx(
        'flex relative gap-3 items-center h-[var(--section-height-mobile)] sm:h-[var(--section-height-desktop)]',
      )}
      style={sectionStyle}
    >
      <div className="absolute inset-0">
        {backgroundImage ? (
          <Image
            data={backgroundImage}
            className="w-full h-full object-cover"
            sizes="auto"
          />
        ) : (
          <div className="w-full h-full flex justify-center items-center bg-gray-200">
            <IconImageBlank
              className="!w-24 !h-24 opacity-30"
              viewBox="0 0 100 100"
            />
          </div>
        )}
        {enableOverlay && (
          <div className="absolute inset-0 bg-[var(--overlay-color)] opacity-[var(--overlay-opacity)]"></div>
        )}
      </div>
      <div className="z-10 w-[var(--max-width-content)] sm-max:w-5/6 h-fit flex flex-col text-center gap-5">
        {children}
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
              {label: 'Left', value: 'flex-start'},
              {label: 'Center', value: 'center'},
              {label: 'Right', value: 'flex-end'},
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
          condition: `enableOverlay.eq.true`,
        },
        {
          type: 'range',
          name: 'sectionHeightDesktop',
          label: 'Section height desktop',
          defaultValue: 450,
          configs: {
            min: 400,
            max: 700,
            step: 10,
            unit: 'px',
          },
        },
        {
          type: 'range',
          name: 'sectionHeightMobile',
          label: 'Section height mobile',
          defaultValue: 350,
          configs: {
            min: 300,
            max: 600,
            step: 10,
            unit: 'px',
          },
        },
      ],
    },
  ],
  childTypes: ['subheading', 'heading', 'description', 'button'],
  presets: {
    children: [
      {
        type: 'subheading',
        content: 'Subheading',
      },
      {
        type: 'heading',
        content: 'Heading for Image',
      },
      {
        type: 'description',
        content: 'Pair large text with an image to tell a story.',
      },
      {
        type: 'button',
        content: 'Button section',
      },
    ],
  },
};
