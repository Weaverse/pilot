import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

interface TestimonialProps extends HydrogenComponentProps {
  heading: string;
}

let Testimonial = forwardRef<HTMLElement, TestimonialProps>((props, ref) => {
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
  inspector: [
    {
      group: 'Testimonial',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          placeholder: 'Enter heading here',
          defaultValue: 'Testimonials',
        },
      ],
    },
  ],
  toolbar: ['general-settings', ['duplicate', 'delete']],
  presets: {
    children: [
      {
        type: 'testimonial--item',
      },
      {
        type: 'testimonial--item',
      },
    ],
  },
  flags: {
    isSection: true,
  },
};
