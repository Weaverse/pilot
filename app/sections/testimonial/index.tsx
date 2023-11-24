import {
  type HydrogenComponentProps,
  type HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';
import {
  Container,
  ContainerProps,
  containerConfigs,
} from '~/sections/shared/Container';

type TestimonialProps = HydrogenComponentProps &
  ContainerProps & {
    heading: string;
    description: string;
  };

let Testimonial = forwardRef<HTMLElement, TestimonialProps>((props, ref) => {
  let {
    heading,
    description,
    children,
    width,
    divider,
    verticalPadding,
    ...rest
  } = props;

  return (
    <section ref={ref} {...rest}>
      <Container
        width={width}
        verticalPadding={verticalPadding}
        divider={divider}
      >
        <div className="mx-auto max-w-screen-md text-center">
          <h2 className="mb-4 font-medium">{heading}</h2>
          {description && (
            <p className="mb-8 font-light text-gray-500 lg:mb-16 sm:text-lg">
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
      </Container>
    </section>
  );
});

export default Testimonial;

export let schema: HydrogenComponentSchema = {
  type: 'testimonials',
  title: 'Testimonials',
  childTypes: ['testimonial--item'],
  inspector: [
    containerConfigs,
    {
      group: 'Content',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Testimonials',
          placeholder: 'Testimonials',
        },
        {
          type: 'product',
          name: 'product',
          label: 'Product',
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
