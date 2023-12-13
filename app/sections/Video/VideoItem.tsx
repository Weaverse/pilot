import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

interface VideoItemProps extends HydrogenComponentProps {
  videoUrl: string;
}

let VideoItem = forwardRef<HTMLIFrameElement, VideoItemProps>((props, ref) => {
  let {videoUrl, ...rest} = props;
  return (
    <iframe
      ref={ref}
      {...rest}
      className="mx-auto mt-8 w-full max-w-2xl h-64 rounded-lg lg:mt-12 sm:h-96"
      src={videoUrl}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      sandbox={'allow-presentation allow-same-origin allow-scripts'}
    />
  );
});

export default VideoItem;

export let schema: HydrogenComponentSchema = {
  type: 'video--item',
  title: 'Video',
  inspector: [
    {
      group: 'Video',
      inputs: [
        {
          type: 'text',
          name: 'videoUrl',
          label: 'Video URL',
          defaultValue: 'https://www.youtube.com/embed/-akQyQN8rYM',
          placeholder: 'https://www.youtube.com/embed/-akQyQN8rYM',
        },
      ],
    },
  ],
};
