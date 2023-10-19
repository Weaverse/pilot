import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';

interface ButtonItemProps extends HydrogenComponentProps {
  buttonLabel: string;
  buttonLink: string;
}

let RichTextButtonItem = forwardRef<HTMLDivElement, ButtonItemProps>((props, ref) => {
  let { buttonLabel, buttonLink, ...rest } = props;
  return (
    <div ref={ref} {...rest} className='text-white'>
      <a href={buttonLink} className='px-4 py-3 cursor-pointer bg-black rounded inline-block'>{buttonLabel}</a>
    </div>
  );
});

export default RichTextButtonItem;

export let schema: HydrogenComponentSchema = {
  type: 'rich-text-button--item',
  title: 'Button item',
  inspector: [
    {
      group: 'Button',
      inputs: [
        {
          type: 'text',
          label: 'Button label',
          name: 'buttonLabel',
          placeholder: 'Button label',
          defaultValue: 'Optional button',
        },
        {
          type: 'text',
          label: 'Button link',
          name: 'buttonLink',
          placeholder: 'Button link',
        }
      ],
    },
  ],
};
