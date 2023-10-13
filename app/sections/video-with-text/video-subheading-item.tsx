import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';

interface VideoSubheadingProps extends HydrogenComponentProps {
  subHeading: string;
  subHeadingSize: string;
}

let VideoSubheadingItem = forwardRef<HTMLDivElement, VideoSubheadingProps>((props, ref) => {
  let {subHeading, subHeadingSize, ...rest} = props;
  return (
    <div ref={ref} {...rest}>
      <p className='font-sans mb-4 font-normal leading-6' style={{fontSize: `${subHeadingSize}`}}>{subHeading}</p>
    </div>
  );
});

export default VideoSubheadingItem;

export let schema: HydrogenComponentSchema = {
  type: 'video-subheading--item',
  title: 'Subheading item',
  limit: 1,
  inspector: [
    {
      group: 'Subheading',
      inputs: [
        {
          type: 'text',
          name: 'subHeading',
          label: 'Subheading',
          defaultValue: 'Subheading',
          placeholder: 'Subheading',
        },
        {
          type: 'toggle-group',
          label: 'Subheading size',
          name: 'subHeadingSize',
          configs: {
            options: [
              { label: 'XS', value: '14px' },
              { label: 'S', value: '16px' },
              { label: 'M', value: '18px' },
              { label: 'L', value: '20px' },
              { label: 'XL', value: '22px' },
            ],
          },
          defaultValue: '16px',
        },
      ],
    },
  ],
}
