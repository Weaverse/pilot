import {Image} from '@shopify/hydrogen';
import type {
  InspectorGroup,
  PositionInputValue,
  WeaverseImage,
} from '@weaverse/hydrogen';
import type {CSSProperties} from 'react';

export type BackgroundImageProps = {
  backgroundImage?: WeaverseImage;
  backgroundFit?: CSSProperties['objectFit'];
  backgroundPosition?: PositionInputValue;
};

export function BackgroundImage(props: BackgroundImageProps) {
  let {backgroundImage, backgroundFit, backgroundPosition} = props;
  return (
    <Image
      className="absolute inset-0 w-full h-full"
      data={backgroundImage}
      sizes="100vw"
      style={{
        objectFit: backgroundFit,
        objectPosition: backgroundPosition,
      }}
    />
  );
}

export let backgroundImageInputs: InspectorGroup['inputs'] = [
  {
    type: 'heading',
    label: 'Background',
  },
  {
    type: 'color',
    name: 'backgroundColor',
    label: 'Background color',
    defaultValue: '#ffffff',
  },
  {
    type: 'image',
    name: 'backgroundImage',
    label: 'Background image',
  },
  {
    type: 'toggle-group',
    name: 'backgroundFit',
    label: 'Background fit',
    configs: {
      options: [
        {value: 'fill', label: 'Fill', icon: 'CornersOut'},
        {value: 'cover', label: 'Cover', icon: 'ArrowsOut'},
        {value: 'contain', label: 'Contain', icon: 'ArrowsIn'},
      ],
    },
    defaultValue: 'cover',
    condition: 'backgroundImage.ne.nil',
  },
  {
    type: 'position',
    name: 'backgroundPosition',
    label: 'Background position',
    defaultValue: 'center',
    condition: 'backgroundImage.ne.nil',
  },
];
