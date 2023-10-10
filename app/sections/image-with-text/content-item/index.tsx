import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { CSSProperties } from 'react';

interface ContentsProps extends HydrogenComponentProps {
  subHeading: string;
  subHeadingSize: string;
}

let ContentComponent = forwardRef<HTMLDivElement, ContentsProps>((props, ref) => {
  let { subHeading, subHeadingSize, children, ...rest } = props;
  let styleContent: CSSProperties = {
    '--font-size-heading': `${subHeadingSize}`,
  } as CSSProperties;
  return (
    <div ref={ref} {...rest} className='w-2/5 py-16 mr-5 sm-max:mr-0 sm-max:w-full sm-max:pb-12' style={styleContent}>
      {subHeading && <p className='font-sans text-heading mb-5 leading-6'>{subHeading}</p>}
      {children}
    </div>
  );
});

export default ContentComponent;

export let schema: HydrogenComponentSchema = {
  type: 'Content--Item',
  title: 'Content',
  limit: 1,
  inspector: [
    {
      group: 'Content',
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
    }
  ],
  childTypes: ['Heading--Item', 'Description--Item', 'Button--Item'],
  presets: {
    children: [
      {
        type: 'Heading--Item',
      },
      {
        type: 'Description--Item',
      },
      {
        type: 'Button--Item',
      },
    ],
  },
};
