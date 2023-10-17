import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { CSSProperties } from 'react';

interface ContentColumnWithImageProps extends HydrogenComponentProps {
  heading: string;
  headingSize: string;
  headingAlignment: string;
  loading: HTMLImageElement['loading'];
}

let ContentColumnWithImage = forwardRef<HTMLElement, ContentColumnWithImageProps>((props, ref) => {
  let {heading, headingSize, headingAlignment, children, ...rest } = props;
  let headingStyle: CSSProperties = {
    justifyContent: `${headingAlignment}`,
    fontSize: `${headingSize}`,
  } as CSSProperties;

  return (
    <section ref={ref} {...rest} className='w-full h-full'>
      <div className='px-10 py-10 sm-max:px-6'>
        <div className='mb-5 flex' style={headingStyle}>
          <p className='font-sans font-bold'>{heading}</p>
        </div>
        <div className='flex flex-wrap gap-5 justify-center'>
          {children}
        </div>
      </div>
    </section>
  );
});

export default ContentColumnWithImage;

export let schema: HydrogenComponentSchema = {
  type: 'content-column-with-image',
  title: 'Content column with image',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Content',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Heading for Image',
          placeholder: 'Heading for Image section',
        },
        {
          type: 'toggle-group',
          label: 'Heading size',
          name: 'headingSize',
          configs: {
            options: [
              { label: 'XS', value: '20px' },
              { label: 'S', value: '24px' },
              { label: 'M', value: '30px' },
              { label: 'L', value: '36px' },
              { label: 'XL', value: '40px' },
            ],
          },
          defaultValue: '24px',
        },
        {
          type: 'toggle-group',
          label: 'Heading alignment',
          name: 'headingAlignment',
          configs: {
            options: [
              { label: 'Left', value: 'flex-start' },
              { label: 'Center', value: 'center' },
              { label: 'Right', value: 'flex-end' },
            ],
          },
          defaultValue: 'center',
        },
      ],
    },
  ],
  childTypes: ['content-column--item'],
  presets: {
    children: [
      {
        type: 'content-column--item',
      },
    ],
  },
};
