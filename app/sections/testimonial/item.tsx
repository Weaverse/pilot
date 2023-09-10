import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import clsx from 'clsx';
import {forwardRef} from 'react';
import {Image} from '@shopify/hydrogen';

interface TestimonialItemProps extends HydrogenComponentProps {
  heading: string;
  content: string;
  authorImage: string;
  authorName: string;
  authorTitle: string;
  hideOnMobile: boolean;
}

let TestimonialItem = forwardRef<HTMLDivElement, TestimonialItemProps>(
  (props, ref) => {
    let {
      heading,
      content,
      authorImage,
      authorName,
      authorTitle,
      hideOnMobile,
      ...rest
    } = props;
    return (
      <div
        ref={ref}
        {...rest}
        className={clsx(hideOnMobile && 'hidden sm:block')}
      >
        <figure className="p-6 bg-gray-50 rounded dark:bg-gray-800">
          <blockquote className="text-sm text-gray-500 dark:text-gray-400">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {heading}
            </h3>
            <p className="my-4">"{content}"</p>
          </blockquote>
          <figcaption className="flex items-center space-x-3">
            <Image
              className="h-9 rounded-full"
              data={{url: authorImage}}
              alt="author profile picture"
              width={36}
            />
            <div className="space-y-0.5 font-medium dark:text-white">
              <div>{authorName}</div>
              <div className="text-sm font-light text-gray-500 dark:text-gray-400">
                {authorTitle}
              </div>
            </div>
          </figcaption>
        </figure>
      </div>
    );
  },
);

export default TestimonialItem;

export let schema: HydrogenComponentSchema = {
  type: 'testimonial--item',
  title: 'Testimonial Item',
  inspector: [
    {
      group: 'Testimonial Item',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Reliable international shipping',
          placeholder: 'Testimonial heading',
        },
        {
          type: 'text',
          name: 'content',
          label: 'Content',
          defaultValue: `I've ordered to multiple countries without issue. Their calculated duties/taxes and import fees make international delivery transparent.`,
          placeholder: 'Testimonial content',
        },
        {
          type: 'image',
          name: 'authorImage',
          label: 'Author image',
          defaultValue:
            'https://cdn.shopify.com/s/files/1/0728/0410/6547/files/wv-fashion-model-in-fur.jpg?v=1694236467',
        },
        {
          type: 'text',
          name: 'authorName',
          label: 'Author Name',
          defaultValue: 'Emma Thomas',
          placeholder: 'Author name',
        },
        {
          type: 'text',
          name: 'authorTitle',
          label: 'Author Title',
          defaultValue: 'International Customer',
          placeholder: 'Author title',
        },
        {
          type: 'switch',
          label: 'Hide on Mobile',
          name: 'hideOnMobile',
          defaultValue: false,
        },
      ],
    },
  ],
  toolbar: ['general-settings', ['duplicate', 'delete']],
};
