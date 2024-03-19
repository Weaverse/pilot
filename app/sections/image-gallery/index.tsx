import type {HydrogenComponentSchema} from '@weaverse/hydrogen';
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
  title: 'Image gallery',
  childTypes: ['heading', 'description', 'image-gallery--items'],
  inspector: [sectionConfigs],
  toolbar: ['general-settings', ['duplicate', 'delete']],
  presets: {
    children: [
      {
        type: 'heading',
        content: 'Image Gallery',
      },
      {
        type: 'description',
        content:
          'Pair text with an image to focus on your chosen product, collection, or blog post. Add details on availability, style, or even provide a review.',
      },
      {
        type: 'image-gallery--items',
      },
    ],
  },
};
