import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseImage,
} from '@weaverse/hydrogen';
import type {CSSProperties} from 'react';
import {forwardRef} from 'react';
import {Image} from '@shopify/hydrogen';
import clsx from 'clsx';

import {IconImageBlank} from '~/components';

interface CountDownProps extends HydrogenComponentProps {
  backgroundImage: WeaverseImage;
  overlayColor: string;
  overlayOpacity: number;
  contentPosition: string;
}

let SlideShowItem = forwardRef<HTMLDivElement, CountDownProps>((props, ref) => {
  let {
    backgroundImage,
    overlayColor,
    overlayOpacity,
    contentPosition,
    children,
    ...rest
  } = props;

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

  let slideStyle: CSSProperties = {
    '--overlay-color': overlayColor,
    '--overlay-opacity': `${overlayOpacity}%`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      {...rest}
      className={clsx(
        'flex relative h-full px-10 py-16 w-full sm-max:px-4',
        positionClass[contentPosition],
      )}
      style={slideStyle}
    >
      <div className="absolute inset-0">
        {backgroundImage ? (
          <Image
            data={backgroundImage}
            sizes="auto"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex justify-center items-center bg-gray-200">
            <IconImageBlank
              className="!w-24 !h-24 opacity-30"
              viewBox="0 0 100 100"
            />
          </div>
        )}
        {backgroundImage && (
          <div className="absolute inset-0 bg-[var(--overlay-color)] opacity-[var(--overlay-opacity)]"></div>
        )}
      </div>
      <div className="flex flex-col gap-3 items-center w-5/6 sm-max:w-full z-10">
        {children}
      </div>
    </div>
  );
});

export default SlideShowItem;

export let schema: HydrogenComponentSchema = {
  type: 'slide-show--item',
  title: 'Slide',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Slide',
      inputs: [
        {
          type: 'image',
          name: 'backgroundImage',
          label: 'Background image',
        },
        {
          type: 'position',
          name: 'contentPosition',
          label: 'Content position',
          defaultValue: 'center center',
        },
        {
          type: 'color',
          name: 'overlayColor',
          label: 'Overlay color',
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
        content: 'Slide Heading',
      },
      {
        type: 'description',
        content:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown.",
      },
      {
        type: 'button',
        content: 'Button section',
      },
    ],
  },
};
