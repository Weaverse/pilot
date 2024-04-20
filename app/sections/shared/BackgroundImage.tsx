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
  if (backgroundImage) {
    return (
      <Image
        className="absolute inset-0 w-full h-full"
        data={backgroundImage}
        sizes="auto"
        style={{
          objectFit: backgroundFit,
          objectPosition: backgroundPosition,
        }}
      />
    );
  }
  return null;
}

export let backgroundInputs: InspectorGroup['inputs'] = [
  {
    type: 'heading',
    label: 'Background',
  },
  {
    type: 'color',
    name: 'backgroundColor',
    label: 'Background color',
    defaultValue: '',
  },
  {
    type: 'image',
    name: 'backgroundImage',
    label: 'Background image',
  },
  {
    type: 'select',
    name: 'backgroundFit',
    label: 'Background fit',
    configs: {
      options: [
        {value: 'fill', label: 'Fill'},
        {value: 'cover', label: 'Cover'},
        {value: 'contain', label: 'Contain'},
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
