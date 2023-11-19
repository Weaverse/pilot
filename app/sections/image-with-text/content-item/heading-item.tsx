import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';


interface HeadingItemProps extends HydrogenComponentProps {
  heading: string;
  headingColor: string;
}

let ImageWTextHeadingItem = forwardRef<HTMLDivElement, HeadingItemProps>((props, ref) => {
  let { heading, headingColor, ...rest } = props;
  return (
    <div ref={ref} {...rest}>
      <h3 className='font-medium' style={{color: headingColor}}>{heading}</h3>
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
          type: 'color',
          name: 'headingColor',
          label: 'Heading color',
          defaultValue: '#333333',
        },
      ],
    }
  ],
};
