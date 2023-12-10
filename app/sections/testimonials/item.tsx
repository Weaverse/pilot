import {Image} from '@shopify/hydrogen';
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseImage,
} from '@weaverse/hydrogen';
import clsx from 'clsx';
import {forwardRef} from 'react';

interface TestimonialItemProps extends HydrogenComponentProps {
  heading: string;
  content: string;
  authorImage: WeaverseImage;
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
        <figure className="p-6 bg-gray-50 rounded">
          <blockquote className="text-gray-500">
            <h4 className="font-medium text-gray-900">{heading}</h4>
            <p className="my-4">"{content}"</p>
          </blockquote>
          <figcaption className="flex items-center space-x-3">
            <Image
              className="h-9 rounded-full object-cover object-center"
              data={
                typeof authorImage === 'object'
                  ? authorImage
                  : {url: authorImage}
              }
              alt={authorName}
              width={36}
              sizes="auto"
            />
            <div className="space-y-0.5 font-medium">
              <div>{authorName}</div>
              <div className="text-sm font-light text-gray-500">
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
  title: 'Testimonial',
  inspector: [
    {
      group: 'Testimonial',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Reliable international shipping',
          placeholder: 'Testimonial heading',
        },
        {
          type: 'textarea',
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
