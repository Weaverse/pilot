import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';

interface VideoButtonProps extends HydrogenComponentProps {
  buttonLabel: string;
  buttonLink: string;
}

let VideoButtonItem = forwardRef<HTMLDivElement, VideoButtonProps>((props, ref) => {
  let {buttonLabel, buttonLink, ...rest} = props;
  return (
    <div ref={ref} {...rest}>
      <a href={buttonLink} className='bg-gray-900 text-white py-3 px-4 rounded'>{buttonLabel}</a>
    </div>
  );
});

export default VideoButtonItem;

export let schema: HydrogenComponentSchema = {
  type: 'video-button--item',
  title: 'Button item',
  limit: 1,
  inspector: [
    {
      group: 'Button',
      inputs: [
        {
          type: 'text',
          name: 'buttonLabel',
          label: 'Button label',
          defaultValue: 'Button',
        },
        {
          type: 'text',
          name: 'buttonLink',
          label: 'Button link',
          placeholder: 'https://',
        },
      ],
    },
  ],
}
