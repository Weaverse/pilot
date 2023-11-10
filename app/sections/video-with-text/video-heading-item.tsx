import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';

interface VideoHeadingProps extends HydrogenComponentProps {
  heading: string;
  headingColor: string;
}

let VideoHeadingItem = forwardRef<HTMLDivElement, VideoHeadingProps>((props, ref) => {
  let {heading, headingColor, ...rest} = props;
  return (
    <div ref={ref} {...rest}>
      <h3 className='font-medium' style={{color: headingColor}}>{heading}</h3>
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
          type: 'color',
          name: 'headingColor',
          label: 'Heading color',
          defaultValue: '#333333',
        },
      ],
    },
  ],
}
