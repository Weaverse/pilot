import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { CSSProperties } from 'react';

interface ImageWithTextProps extends HydrogenComponentProps {
  textAlignment: string;
}

let ImageWithText = forwardRef<HTMLElement, ImageWithTextProps>((props, ref) => {
  let { textAlignment, children, ...rest } = props;
  let styleSection: CSSProperties = {
    '--section-height': '410px',
    textAlign: `${textAlignment}`,
  } as CSSProperties;

  return (
    <section ref={ref} {...rest} style={styleSection} className='bg-blue-100 h-[var(--section-height)] overflow-hidden w-full sm-max:h-auto sm-max:overflow-hidden'>
      <div className='box-border h-full px-10 sm-max:px-6 sm-max:w-full'>
        <div className='flex justify-center box-border h-full w-full sm-max:flex-col'>
          {children}
        </div>
      </div>
    </section>
  );
});

export default ImageWithText;

export let schema: HydrogenComponentSchema = {
  type: 'image-with-text',
  title: 'Image with text',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Image',
      inputs: [
        {
          type: 'toggle-group',
          label: 'Text alignment',
          name: 'textAlignment',
          configs: {
            options: [
              { label: 'Left', value: 'left' },
              { label: 'Center', value: 'center' },
              { label: 'Right', value: 'right' },
            ],
          },
          defaultValue: 'left',
        },
      ],
    },
  ],
  childTypes: ['Content--Item','Image--Component'],
  presets: {
    children: [
      {
        type: 'Content--Item',
      },
      {
        type: 'Image--Component',
      },
    ],
  },
};
