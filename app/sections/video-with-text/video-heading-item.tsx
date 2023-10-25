import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';

interface VideoHeadingProps extends HydrogenComponentProps {
  heading: string;
  headingSize: string;
  headingColor: string;
}

let VideoHeadingItem = forwardRef<HTMLDivElement, VideoHeadingProps>((props, ref) => {
  let {heading, headingSize, headingColor, ...rest} = props;
  return (
    <div ref={ref} {...rest}>
      <h1 className='font-sans mb-4 font-medium leading-5' style={{fontSize: `${headingSize}`, color: headingColor}}>{heading}</h1>
    </div>
  );
});

export default VideoHeadingItem;

export let schema: HydrogenComponentSchema = {
  type: 'video-heading--item',
  title: 'Heading item',
  limit: 1,
  inspector: [
    {
      group: 'Heading',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Heading for Video',
          placeholder: 'Heading for video section',
        },
        {
          type: 'toggle-group',
          label: 'Heading size',
          name: 'headingSize',
          configs: {
            options: [
              { label: 'XS', value: '22px' },
              { label: 'S', value: '24px' },
              { label: 'M', value: '26px' },
              { label: 'L', value: '28px' },
              { label: 'XL', value: '30px' },
            ],
          },
          defaultValue: '24px',
        },
        {
          type: 'color',
          name: 'headingColor',
          label: 'Heading color',
          defaultValue: '#333333',
        },
      ],
    },
  ],
}
