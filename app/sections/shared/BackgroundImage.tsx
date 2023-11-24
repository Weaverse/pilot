import {Image} from '@shopify/hydrogen';
import {
  InspectorGroup,
  PositionInputValue,
  WeaverseImage,
} from '@weaverse/hydrogen';
import {CSSProperties} from 'react';

export type BackgroundImageProps = {
  backgroundImage?: WeaverseImage;
  backgroundFit?: CSSProperties['objectFit'];
  backgroundPosition?: PositionInputValue;
};

export function BackgroundImage(props: BackgroundImageProps) {
  let {backgroundImage, backgroundFit, backgroundPosition} = props;
  return (
    <Image
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
        {value: 'auto', label: 'Auto', icon: 'CornersOut'},
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
