import {
  type HydrogenComponentProps,
  type HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {clsx} from 'clsx';
import {forwardRef} from 'react';

type TestimonialsItemsProps = HydrogenComponentProps & {
  gap?: number;
};

let gapClasses: Record<number, string> = {
  16: 'gap-4',
  24: 'gap-6',
  32: 'gap-8',
  40: 'gap-10',
};

let Testimonials = forwardRef<HTMLDivElement, TestimonialsItemsProps>(
  (props, ref) => {
    let {gap, children, ...rest} = props;

    return (
      <div
        ref={ref}
        {...rest}
        className={clsx(gapClasses[gap!], 'grid lg:grid-cols-3')}
      >
        <div className="space-y-6">
          {children?.filter((_, i) => i % 3 === 0)}
        </div>
        <div className="space-y-6">
          {children?.filter((_, i) => i % 3 === 1)}
        </div>
        <div className="space-y-6">
          {children?.filter((_, i) => i % 3 === 2)}
        </div>
      </div>
    );
  },
);

Testimonials.defaultProps = {
  gap: 32,
};

export default Testimonials;

export let schema: HydrogenComponentSchema = {
  type: 'testimonials-items',
  title: 'Items',
  childTypes: ['testimonial--item'],
  inspector: [
    {
      group: 'Items',
      inputs: [
        {
          type: 'range',
          name: 'gap',
          label: 'Items gap',
          configs: {
            min: 16,
            max: 40,
            step: 8,
            unit: 'px',
          },
          defaultValue: 32,
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
