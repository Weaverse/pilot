import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

type TestimonialData = {
  heading: string;
};

let Testimonial = forwardRef<
  HTMLElement,
  HydrogenComponentProps<TestimonialData>
>((props, ref) => {
  let {data, children, ...rest} = props;
  let {heading} = data;
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
  data: {
    heading: 'Testimonials',
  },
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
