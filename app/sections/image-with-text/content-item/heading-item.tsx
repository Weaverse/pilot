import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { CSSProperties } from 'react';


interface HeadingItemProps extends HydrogenComponentProps {
  heading: string;
  headingSize: string;
}

let ImageWTextHeadingItem = forwardRef<HTMLDivElement, HeadingItemProps>((props, ref) => {
  let { heading, headingSize, ...rest } = props;
  let styleSubheading: CSSProperties = {
    '--font-size-display': `${headingSize}`,
  } as CSSProperties;
  return (
    <div ref={ref} {...rest} style={styleSubheading}>
      <p className='mb-5 text-gray-950 font-sans text-display font-bold leading-5'>{heading}</p>
    </div>
  );
});

export default ImageWTextHeadingItem;

export let schema: HydrogenComponentSchema = {
  type: 'Heading--Item',
  title: 'heading item',
  limit: 1,
  inspector: [
    {
      group: 'Heading',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Heading for Image',
          placeholder: 'Heading for image section',
        },
        {
          type: 'toggle-group',
          label: 'Heading size',
          name: 'headingSize',
          configs: {
            options: [
              { label: 'XS', value: '22px' },
              { label: 'S', value: '24px' },
              { label: 'M', value: '26px' },
              { label: 'L', value: '28px' },
              { label: 'XL', value: '30px' },
            ],
          },
          defaultValue: '24px',
        },
      ],
    }
  ],
};
