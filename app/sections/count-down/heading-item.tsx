import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef, CSSProperties } from 'react';


interface CountDownHeadingProps extends HydrogenComponentProps {
  heading: string;
  textColor: string;
}

let CountDownHeading = forwardRef<HTMLDivElement, CountDownHeadingProps>((props, ref) => {
  let { heading, textColor, ...rest } = props;
  let headingStyle: CSSProperties = {
    '--heading-text-color': textColor,
  } as CSSProperties;
  return (
    <div ref={ref} {...rest} style={headingStyle}>
      {heading && <h3 className='font-medium text-[var(--heading-text-color)]'>{heading}</h3>}
    </div>
  );
});

export default CountDownHeading;

export let schema: HydrogenComponentSchema = {
  type: 'count-down--heading',
  title: 'Heading',
  inspector: [
    {
      group: 'Heading',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Countdown heading',
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
