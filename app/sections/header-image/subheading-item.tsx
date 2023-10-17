import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { CSSProperties } from 'react';


interface SubHeadingItemProps extends HydrogenComponentProps {
  subHeading: string;
  subHeadingSize: string;
}

let SubHeadingItem = forwardRef<HTMLDivElement, SubHeadingItemProps>((props, ref) => {
  let { subHeading, subHeadingSize, ...rest } = props;
  let headingStyle: CSSProperties = {
    '--font-size-heading': `${subHeadingSize}`,
  } as CSSProperties;
  return (
    <div ref={ref} {...rest} style={headingStyle}>
      <p className='font-sans mb-4 text-2xl font-normal leading-6'>{subHeading}</p>
    </div>
  );
});

export default SubHeadingItem;

export let schema: HydrogenComponentSchema = {
  type: 'subheading--item',
  title: 'Subheading item',
  inspector: [
    {
      group: 'Subheading',
      inputs: [
        {
          type: 'text',
          name: 'subHeading',
          label: 'Subheading',
          defaultValue: 'Subheading',
          placeholder: 'Subheading',
        },
        {
          type: 'toggle-group',
          label: 'Subheading size',
          name: 'subHeadingSize',
          configs: {
            options: [
              { label: 'XS', value: '14px' },
              { label: 'S', value: '16px' },
              { label: 'M', value: '18px' },
              { label: 'L', value: '20px' },
              { label: 'XL', value: '22px' },
            ],
          },
          defaultValue: '16px',
        },
      ],
    },
  ],
}
