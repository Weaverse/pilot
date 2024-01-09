import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';
import type {SectionProps} from '~/sections/shared/Section';
import {Section, sectionConfigs} from '~/sections/shared/Section';

type ImageGalleryProps = SectionProps & {
  heading: string;
  description: string;
};

let ImageGallery = forwardRef<HTMLElement, ImageGalleryProps>((props, ref) => {
  let {heading, description, children, ...rest} = props;
  return (
    <Section ref={ref} {...rest}>
      {children}
    </Section>
  );
});

export default ImageGallery;

export let schema: HydrogenComponentSchema = {
  type: 'image-gallery',
  title: 'Image Gallery',
  childTypes: ['heading', 'description', 'image-gallery--items'],
  inspector: [sectionConfigs],
  toolbar: ['general-settings', ['duplicate', 'delete']],
  presets: {
    children: [
      {
        type: 'heading',
        content: 'Hello World from Weaverse!',
      },
      {
        type: 'description',
        content:
          "Stay on trend this season with our newest arrivals. We've curated the latest looks in women's fashion so you can refresh your wardrobe with ease. From flowy dresses and printed blouses perfect for summer, to cozy sweaters and tall boots for cooler months, our new collection has versatile pieces to take you from work to weekend. Shop cute and comfortable athleisure wear, chic handbags, and so much more.",
      },
      {
        type: 'image-gallery--items',
      },
    ],
  },
};
