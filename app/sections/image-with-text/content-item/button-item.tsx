import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';


interface ButtonItemProps extends HydrogenComponentProps {
  buttonLabel: string;
  buttonLink: string;
}

let ImageWTextButtonItem = forwardRef<HTMLDivElement, ButtonItemProps>((props, ref) => {
  let { buttonLabel, buttonLink, ...rest } = props;
  return (
    <div ref={ref} {...rest}>
      <a className='text-center py-3 px-4 rounded bg-gray-950 text-white' href={buttonLink}>{buttonLabel}</a>
    </div>
  );
});

export default ImageWTextButtonItem;

export let schema: HydrogenComponentSchema = {
  type: 'Button--Item',
  title: 'Button item',
  limit: 1,
  inspector: [
    {
      group: 'Button',
      inputs: [
        {
          type: 'text',
          name: 'buttonLabel',
          label: 'Button label',
          defaultValue: 'Button',
        },
        {
          type: 'text',
          name: 'buttonLink',
          label: 'Button link',
          placeholder: 'https://'
        },
      ],
    }
  ],
};
