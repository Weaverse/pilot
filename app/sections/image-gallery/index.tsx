import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

interface ImageGalleryProps extends HydrogenComponentProps {
  heading: string;
  description: string;
}

let ImageGallery = forwardRef<HTMLElement, ImageGalleryProps>((props, ref) => {
  let {heading, description, children, ...rest} = props;
  return (
    <section ref={ref} {...rest}>
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:px-12 sm:text-center lg:py-16">
        <h2 className="mb-4 text-5xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          {heading}
        </h2>
        <p className="font-light text-gray-500 sm:text-lg md:px-20 lg:px-38 xl:px-48 dark:text-gray-400">
          {description}
        </p>
        <div className="flex flex-col gap-4 mt-8 sm:grid sm:grid-cols-4 sm:mt-12">
          {children}
        </div>
      </div>
    </section>
  );
});

export default ImageGallery;

export let schema: HydrogenComponentSchema = {
  type: 'image-gallery',
  title: 'Image Gallery',
  childTypes: ['image-gallery--item'],
  inspector: [
    {
      group: 'Image Gallery',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          placeholder: 'Section heading',
          defaultValue: 'Discover Our Latest Styles',
        },
        {
          type: 'text',
          name: 'description',
          label: 'Description',
          placeholder: 'Section description',
          defaultValue: `Stay on trend this season with our newest arrivals. We've curated the latest looks in women's fashion so you can refresh your wardrobe with ease. From flowy dresses and printed blouses perfect for summer, to cozy sweaters and tall boots for cooler months, our new collection has versatile pieces to take you from work to weekend. Shop cute and comfortable athleisure wear, chic handbags, and so much more.`,
        },
      ],
    },
  ],
  toolbar: ['general-settings', ['duplicate', 'delete']],
  presets: {
    children: [
      {
        type: 'image-gallery--item',
        columnSpan: 2,
      },
      {
        type: 'image-gallery--item',
        hideOnMobile: true,
      },
      {
        type: 'image-gallery--item',
        hideOnMobile: true,
      },
      {
        type: 'image-gallery--item',
        hideOnMobile: true,
      },
      {
        type: 'image-gallery--item',
        hideOnMobile: true,
      },
      {
        type: 'image-gallery--item',
        columnSpan: 2,
      },
    ],
  },
};
