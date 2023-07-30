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
        heading: 'Reliable shipping for every order',
        content:
          'This online store has a very robust and beautiful collection of products. Under the hood it integrates seamlessly with the best ecommerce platforms and fulfillment services.',
        authorImage:
          'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/bonnie-green.png',
        authorName: 'Bonnie Green',
        authorTitle: 'Shipping Manager at Acme Co.',
      },
      {
        type: 'testimonial--item',
        heading: 'Fast delivery across the country',
        content:
          'I order from this store weekly and my packages always arrive on time. Their logistics network ensures speedy delivery no matter where I am.',
        authorImage:
          'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/joseph-mcfall.png',
        authorName: 'James Davis',
        authorTitle: 'Repeat Customer',
      },
      {
        type: 'testimonial--item',
        heading: 'User-friendly online shopping',
        content:
          'As someone new to online shopping, I found this store so easy to navigate. Checking out is a breeze and customer service is very responsive.',
        authorImage:
          'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/michael-gouch.png',
        authorName: 'Sarah Kim',
        authorTitle: 'First-time Online Shopper',
      },
      {
        type: 'testimonial--item',
        heading: 'Top-notch customer service',
        content: `I had an issue with an order and their customer service resolved it quickly and pleasantly. I'll definitely shop here again due to their support.`,
        authorImage:
          'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/karen-nelson.png',
        authorName: 'Michael Davis',
        authorTitle: 'Satisfied Customer',
      },
      {
        type: 'testimonial--item',
        heading: 'High-quality products',
        content: `Everything I've purchased from this store has been top-notch. The products are made well and worth the price.`,
        authorImage:
          'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/helene-engels.png',
        authorName: 'Jessica Lee',
        authorTitle: 'Repeat Customer',
      },
      {
        type: 'testimonial--item',
        heading: 'Fast shipping worldwide',
        content: `I've ordered from this store from multiple countries and always receive my packages quicker than expected.`,
        authorImage:
          'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/neil-sims.png',
        authorName: 'John Smith',
        authorTitle: 'Global Customer',
      },
    ],
  },
};
