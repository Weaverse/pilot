import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

interface VideoProps extends HydrogenComponentProps {
  heading: string;
  description: string;
  videoUrl: string;
}

let Video = forwardRef<HTMLElement, VideoProps>((props, ref) => {
  let {heading, description, videoUrl, ...rest} = props;
  return (
    <section ref={ref} {...rest}>
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:px-12 sm:text-center lg:py-16">
        <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          {heading}
        </h2>
        <p className="font-light text-gray-500 sm:text-lg md:px-20 lg:px-38 xl:px-48 dark:text-gray-400">
          {description}
        </p>
        <iframe
          className="mx-auto mt-8 w-full max-w-2xl h-64 rounded-lg lg:mt-12 sm:h-96"
          src={videoUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>
  );
});

export default Video;

export let schema: HydrogenComponentSchema = {
  type: 'video',
  title: 'Video',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Video',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Learn More About Our Products',
          placeholder: 'Learn More About Our Products',
        },
        {
          type: 'textarea',
          name: 'description',
          label: 'Description',
          defaultValue: `Watch these short videos to see our products in action. Learn how to use them and what makes them special. See demos of our products being used in real-life situations. The videos provide extra details and showcase the full capabilities of what we offer. If you're interested in learning more before you buy, be sure to check out these informative product videos.`,
          placeholder: 'Video description',
        },
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
