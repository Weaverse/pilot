import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseImage,
} from '@weaverse/hydrogen';
import type {CSSProperties} from 'react';
import {forwardRef} from 'react';
import {Image} from '@shopify/hydrogen';

import {IconImageBlank} from '~/components';

interface ImageHotspotProps extends HydrogenComponentProps {
  imageHostpots: WeaverseImage;
  heading: string;
  sectionHeight: number;
  topPadding: number;
  bottomPadding: number;
}

let ImageHotspot = forwardRef<HTMLElement, ImageHotspotProps>((props, ref) => {
  let {
    imageHostpots,
    heading,
    children,
    sectionHeight,
    topPadding,
    bottomPadding,
    ...rest
  } = props;
  let sectionStyles: CSSProperties = {
    '--section-height': `${sectionHeight}px`,
    paddingTop: `${topPadding}px`,
    paddingBottom: `${bottomPadding}px`,
  } as CSSProperties;
  return (
    <section
      ref={ref}
      {...rest}
      className="flex flex-col gap-5 px-10 sm-max:px-6"
      style={sectionStyles}
    >
      <h3>{heading}</h3>
      <div className="relative w-full h-[var(--section-height)] sm-max:w-full">
        {imageHostpots ? (
          <Image
            data={imageHostpots}
            className="w-full h-full object-cover"
            sizes="auto"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <IconImageBlank
              className="!w-24 !h-24 opacity-20"
              viewBox="0 0 100 101"
            />
          </div>
        )}
        {children}
      </div>
    </section>
  );
});

export default ImageHotspot;

export let schema: HydrogenComponentSchema = {
  type: 'image-hotspot',
  title: 'Image hotspot',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Image',
      inputs: [
        {
          type: 'image',
          name: 'imageHostpots',
          label: 'Image hotspots',
        },
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Shop the look',
        },
        {
          type: 'range',
          name: 'sectionHeight',
          label: 'Section height',
          defaultValue: 400,
          configs: {
            min: 400,
            max: 700,
            step: 10,
            unit: 'px',
          },
        },
        {
          type: 'range',
          name: 'topPadding',
          label: 'Top padding',
          defaultValue: 10,
          configs: {
            min: 5,
            max: 70,
            step: 5,
            unit: 'px',
          },
        },
        {
          type: 'range',
          name: 'bottomPadding',
          label: 'Bottom padding',
          defaultValue: 10,
          configs: {
            min: 5,
            max: 70,
            step: 5,
            unit: 'px',
          },
        },
      ],
    },
  ],
  childTypes: ['product-hotspot--items'],
  presets: {
    children: [
      {
        type: 'product-hotspot--items',
      },
    ],
  },
};
