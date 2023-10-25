import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';

interface VideoDescriptionProps extends HydrogenComponentProps {
  descriptionText: string;
  descriptionSize: string;
  descriptionColor: string;
}

let VideoDescriptionItem = forwardRef<HTMLDivElement, VideoDescriptionProps>((props, ref) => {
  let {descriptionText, descriptionSize, descriptionColor, ...rest} = props;
  return (
    <div ref={ref} {...rest}>
      <p className='font-sans text-base font-normal leading-6' style={{fontSize: descriptionSize, color: descriptionColor}}>{descriptionText}</p>
    </div>
  );
});

export default VideoDescriptionItem;

export let schema: HydrogenComponentSchema = {
  type: 'video-description--item',
  title: 'Description item',
  limit: 1,
  inspector: [
    {
      group: 'Description',
      inputs: [
        {
          type: 'textarea',
          label: 'Text',
          name: 'descriptionText',
          defaultValue: 'Pair large text with an video to tell a story.',
        },
        {
          type: 'toggle-group',
          label: 'Description size',
          name: 'descriptionSize',
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
        {
          type: 'color',
          name: 'descriptionColor',
          label: 'Description color',
          defaultValue: '#333333',
        },
      ],
    },
  ],
}
