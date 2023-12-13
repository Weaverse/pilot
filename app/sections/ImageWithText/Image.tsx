import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseImage,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { Image } from '@shopify/hydrogen';
import { IconImageBlank } from '~/components';

interface ImageItemsProps extends HydrogenComponentProps {
  image: WeaverseImage,
  loading: HTMLImageElement['loading'];
}

let ImageItems = forwardRef<HTMLDivElement, ImageItemsProps>((props, ref) => {
  let { image, loading, ...rest } = props;

  return (
    <div ref={ref} {...rest} className='w-1/2 flex flex-1 items-center justify-center sm-max:order-first sm-max:w-full sm-max:py-10 sm-max:pb-0 sm-max:justify-center'>
      {image ? <Image data={image} loading={loading} sizes="auto" className='!w-1/2 !aspect-square sm-max:!w-full' /> :
        <div className='flex justify-center items-center bg-gray-200 w-1/2 aspect-square'>
          <IconImageBlank className='h-32 w-32 opacity-80' viewBox='0 0 100 100' />
        </div>
      }
    </div>
  );
});

export default ImageItems;

export let schema: HydrogenComponentSchema = {
  type: 'image-items',
  title: 'Image',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  limit: 1,
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
};
