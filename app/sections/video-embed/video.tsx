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
      allowFullScreen
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      sandbox="allow-presentation allow-same-origin allow-scripts"
    />
  );
});

export default VideoItem;

export let schema: HydrogenComponentSchema = {
  type: 'video-embed--item',
  title: 'Video',
  inspector: [
    {
      group: 'Video',
      inputs: [
        {
          type: 'text',
          name: 'videoUrl',
          label: 'Embed URL',
          defaultValue: 'https://www.youtube.com/embed/Su-x4Mo5xmU',
          placeholder: 'https://www.youtube.com/embed/Su-x4Mo5xmU',
          helpText:
            'How to get YouTube <a target="_blank" href="https://support.google.com/youtube/answer/171780?hl=en#:~:text=On%20a%20computer%2C%20go%20to,appears%2C%20copy%20the%20HTML%20code.">embed code</a>.',
        },
      ],
    },
  ],
};
