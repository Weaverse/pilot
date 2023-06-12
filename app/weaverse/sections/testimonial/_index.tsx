import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  HydrogenComponentTemplate,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

type TestimonialData = {
  heading: string;
};

let Testimonial = forwardRef<
  HTMLElement,
  HydrogenComponentProps<TestimonialData>
>((props, ref) => {
  let {heading, children, ...rest} = props;
  return (
    <section ref={ref} {...rest} className="text-gray-600 body-font">
      <div className="container px-5 py-24 mx-auto">
        <h1 className="text-3xl font-medium title-fon mb-12 text-center text-white">
          {heading}
        </h1>
        <div className="flex flex-wrap -m-4">{children}</div>
      </div>
    </section>
  );
});

export default Testimonial;

Testimonial.defaultProps = {
  heading: 'Testimonials',
};

export let schema: HydrogenComponentSchema = {
  type: 'testimonial',
  title: 'Testimonial',
  childTypes: ['testimonial--item'],
  inspector: {
    settings: [],
    styles: [],
  },
  toolbar: ['general-settings', ['duplicate', 'delete']],
  flags: {
    isSection: true,
  },
};

export let template: HydrogenComponentTemplate = {
  type: 'testimonial',
  data: {
    heading: 'Testimonials',
  },
  children: [
    {
      type: 'testimonial--item',
      content:
        'Synth chartreuse iPhone lomo cray raw denim brunch everyday carry neutra before they sold out fixie 90&apos;s microdosing. Tacos pinterest fanny pack venmo, post-ironic heirloom try-hard pabst authentic iceland.',
      authorImage: 'https://dummyimage.com/106x106',
      authorName: 'Jean Doe',
      authorTitle: 'UI DEVELOPER',
    },
    {
      type: 'testimonial--item',
      parentId: '11',
      content:
        'Synth chartreuse iPhone lomo cray raw denim brunch everyday carry neutra before they sold out fixie 90&apos;s microdosing. Tacos pinterest fanny pack venmo, post-ironic heirloom try-hard pabst authentic iceland.',
      authorImage: 'https://dummyimage.com/106x106',
      authorName: 'Katie Jenkins',
      authorTitle: 'UX DEVELOPER',
    },
  ],
};
