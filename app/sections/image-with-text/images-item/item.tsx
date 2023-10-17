import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { Image } from '@shopify/hydrogen';


interface ImageItemProps extends HydrogenComponentProps {
  image: {
    url: string;
    altText: string;
    width?: number;
    height?: number;
  }
  loading: HTMLImageElement['loading'];
}

let ImageItems = forwardRef<HTMLDivElement, ImageItemProps>((props, ref) => {
  let { image, loading, ...rest } = props;
  return (
    <div ref={ref} {...rest} className='h-full'>
      {image && <Image data={image} loading={loading} className='h-full sm:object-contain sm-max:object-contain' />}
    </div>
  );
});

export default ImageItems;

export let schema: HydrogenComponentSchema = {
  type: 'Image--Item',
  title: 'Image item',
  limit: 2,
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
    }
  ],
};
