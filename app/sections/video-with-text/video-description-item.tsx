import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';

interface VideoDescriptionProps extends HydrogenComponentProps {
  descriptionText: string;
}

let VideoDescriptionItem = forwardRef<HTMLDivElement, VideoDescriptionProps>((props, ref) => {
  let {descriptionText, ...rest} = props;
  return (
    <div ref={ref} {...rest}>
      <p className='font-sans mb-5 text-base font-normal leading-6' dangerouslySetInnerHTML={{ __html: descriptionText }}></p>
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
          type: 'richtext',
          label: 'Text',
          name: 'descriptionText',
          defaultValue: 'Pair large text with an video to tell a story.',
        },
      ],
    },
  ],
}
