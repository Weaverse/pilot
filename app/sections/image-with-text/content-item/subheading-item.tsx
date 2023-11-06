import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { CSSProperties } from 'react';

interface SubheadingProps extends HydrogenComponentProps {
  subHeading: string;
  subHeadingSize: string;
  subHeadingColor: string;
}

let ImageWTextSubheadingItem = forwardRef<HTMLDivElement, SubheadingProps>((props, ref) => {
  let { subHeading, subHeadingSize, subHeadingColor, ...rest } = props;
  let styleContent: CSSProperties = {
    fontSize: subHeadingSize,
    color: subHeadingColor,
  } as CSSProperties;
  return (
    <div ref={ref} {...rest}>
      {subHeading && <p className='font-normal' style={styleContent}>{subHeading}</p>}
    </div>
  );
});

export default ImageWTextSubheadingItem;

export let schema: HydrogenComponentSchema = {
  type: 'subheading-image--Item',
  title: 'Subheading item',
  limit: 1,
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
    }
  ],
};
