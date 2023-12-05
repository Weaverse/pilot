import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseImage,
} from '@weaverse/hydrogen';
import type { CSSProperties } from 'react';
import { forwardRef  } from 'react';
import { Image } from '@shopify/hydrogen';
import { IconImageBlank } from '~/components';

interface ImageWithTextProps extends HydrogenComponentProps {
  image: WeaverseImage,
  textAlignment: string;
  sectionHeight: number;
  backgroundColor: string;
  loading: HTMLImageElement['loading'];
}

let ImageWithText = forwardRef<HTMLElement, ImageWithTextProps>((props, ref) => {
  let { textAlignment, image, sectionHeight, backgroundColor, loading, children, ...rest } = props;
  let styleSection: CSSProperties = {
    '--section-height': `${sectionHeight}px`,
    backgroundColor: backgroundColor,
    textAlign: `${textAlignment}`,
  } as CSSProperties;

  return (
    <section ref={ref} {...rest} style={styleSection} className='h-[var(--section-height)] sm-max:h-auto sm-max:overflow-hidden'>
      <div className='h-full px-10 sm-max:px-6 sm-max:w-full'>
        <div className='flex justify-center items-center gap-5 h-full w-full sm-max:flex-col'>
          <div className='w-1/2 flex flex-col justify-center gap-5 p-16 sm-max:w-full sm-max:pt-0 sm-max:px-0 sm-max:pb-10'>
            {children}
          </div>
          <div className='w-1/2 flex flex-1 items-center justify-center sm-max:order-first sm-max:w-full sm-max:py-10 sm-max:pb-0 sm-max:justify-center'>
            {image ? <Image data={image} loading={loading} className='!w-1/2 !aspect-square sm-max:!w-full' /> :
              <div className='flex justify-center items-center bg-gray-200 w-1/2 aspect-square'>
                <IconImageBlank className='h-32 w-32 opacity-80' viewBox='0 0 100 100' />
              </div>
            }
          </div>
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
          type: 'image',
          name: 'image',
          label: 'Image',
        },
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
        {
          type: 'range',
          name: 'sectionHeight',
          label: 'Section height',
          defaultValue: 450,
          configs: {
            min: 400,
            max: 700,
            step: 10,
            unit: 'px',
          },
        },
        {
          type: 'color',
          name: 'backgroundColor',
          label: 'Background color',
          defaultValue: '#f4f4f4',
        },
        {
          type: 'toggle-group',
          name: 'loading',
          label: 'Image loading',
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
  childTypes: ['subheading', 'heading', 'description', 'button'],
  presets: {
    children: [
      {
        type: 'subheading',
        content: 'Subheading',
      },
      {
        type: 'heading',
        content: 'Heading for image',
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
