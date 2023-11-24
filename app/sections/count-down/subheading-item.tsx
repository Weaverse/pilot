import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef, CSSProperties } from 'react';


interface CountDownSubheadingProps extends HydrogenComponentProps {
  subHeading: string;
  textColor: string;
  subHeadingSize: string;
}

let CountDownSubheading = forwardRef<HTMLDivElement, CountDownSubheadingProps>((props, ref) => {
  let { subHeading, subHeadingSize, textColor, ...rest } = props;
  let subHeadingStyle: CSSProperties = {
    '--subheading-text-color': textColor,
    fontSize: subHeadingSize,
  } as CSSProperties;
  return (
    <div ref={ref} {...rest}>
      {subHeading && <p className='font-normal text-base text-[var(--subheading-text-color)]' style={subHeadingStyle}>{subHeading}</p>}
    </div>
  );
});

export default CountDownSubheading;

export let schema: HydrogenComponentSchema = {
  type: 'count-down--subheading',
  title: 'Subheading',
  inspector: [
    {
      group: 'Subheading',
      inputs: [
        {
          type: 'text',
          name: 'subHeading',
          label: 'Subheading',
          defaultValue: 'Countdown to our upcoming event',
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
          name: 'textColor',
          label: 'Color',
          defaultValue: '#000000',
        }
      ],
    },
  ],
};
