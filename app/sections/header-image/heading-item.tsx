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

let HeadingItem = forwardRef<HTMLDivElement, HeadingItemProps>((props, ref) => {
  let {heading, headingSize, ...rest } = props;
  let headingStyle: CSSProperties = {
    '--font-size-display': `${headingSize}`,
  } as CSSProperties;
  return (
    <div ref={ref} {...rest} style={headingStyle}>
      <h1 className='font-sans mb-4 text-display font-medium leading-5'>{heading}</h1>
    </div>
  );
});

export default HeadingItem;

export let schema: HydrogenComponentSchema = {
  type: 'heading--item',
  title: 'Heading item',
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
    },
  ],
}
