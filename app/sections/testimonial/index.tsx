import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

interface TestimonialProps extends HydrogenComponentProps {
  heading: string;
  description: string;
}

let Testimonial = forwardRef<HTMLElement, TestimonialProps>((props, ref) => {
  let {heading, description, children, ...rest} = props;
  return (
    <section ref={ref} {...rest} className="bg-white dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-md text-center">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            {heading}
          </h2>
          {description && (
            <p className="mb-8 font-light text-gray-500 lg:mb-16 dark:text-gray-400 sm:text-xl">
              {description}
            </p>
          )}
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6">
            {children?.map((child, idx) => {
              if (idx % 3 === 0) return child;
            })}
          </div>
          <div className="space-y-6">
            {children?.map((child, idx) => {
              if (idx % 3 === 1) return child;
            })}
          </div>
          <div className="space-y-6">
            {children?.map((child, idx) => {
              if (idx % 3 === 2) return child;
            })}
          </div>
        </div>
      </div>
    </section>
  );
});

export default Testimonial;

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
          defaultValue: 'Testimonials',
          placeholder: 'Testimonials',
        },
        {
          type: 'textarea',
          name: 'description',
          label: 'Description',
          defaultValue:
            'Hear from real customers about their experiences shopping with us. From fast shipping and easy returns to quality products and excellent service, see why customers love buying from our store.',
          placeholder: 'Optional description',
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
        hideOnMobile: true,
      },
      {
        type: 'testimonial--item',
        hideOnMobile: true,
      },
      {
        type: 'testimonial--item',
      },
      {
        type: 'testimonial--item',
        hideOnMobile: true,
      },
      {
        type: 'testimonial--item',
        hideOnMobile: true,
      },
    ],
  },
};
