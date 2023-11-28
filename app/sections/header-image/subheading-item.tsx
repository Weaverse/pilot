import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import type { CSSProperties } from 'react';
import { forwardRef  } from 'react';


interface SubHeadingItemProps extends HydrogenComponentProps {
  subHeading: string;
  subHeadingSize: string;
  subHeadingColor: string;
}

let SubHeadingItem = forwardRef<HTMLDivElement, SubHeadingItemProps>((props, ref) => {
  let { subHeading, subHeadingSize, subHeadingColor, ...rest } = props;
  let headingStyle: CSSProperties = {
    fontSize: subHeadingSize,
    color: subHeadingColor,
  } as CSSProperties;
  return (
    <div ref={ref} {...rest}>
      <p style={headingStyle} className='font-normal'>{subHeading}</p>
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
        {
          type: 'color',
          name: 'subHeadingColor',
          label: 'Subheading color',
          defaultValue: '#333333',
        },
      ],
    },
  ],
}
