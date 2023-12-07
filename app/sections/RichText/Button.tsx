import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import clsx from 'clsx';

interface ButtonItemProps extends HydrogenComponentProps {
  buttonLabel: string;
  buttonLink: string;
  openInNewTab: boolean;
  buttonStyle: string;
}

let RichTextButtonItem = forwardRef<HTMLDivElement, ButtonItemProps>((props, ref) => {
  let { buttonLabel, buttonLink, openInNewTab, buttonStyle, ...rest } = props;
  return (
    <div ref={ref} {...rest}>
      <a href={buttonLink} target={openInNewTab ? '_blank' : ''} className={clsx('px-4 py-3 rounded cursor-pointer inline-block', buttonStyle)} rel="noreferrer">{buttonLabel}</a>
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
        },
        {
          type: 'switch',
          name: 'openInNewTab',
          label: 'Open in new tab',
          defaultValue: true,
        },
        {
          type: 'toggle-group',
          label: 'Button style',
          name: 'buttonStyle',
          configs: {
            options: [
              { label: '1', value: 'transition hover:bg-white border-2 border-solid hover:border-gray-900 hover:text-black bg-black text-white' },
              { label: '2', value: 'transition bg-white border-2 border-solid border-gray-900 text-black hover:bg-black hover:text-white' },
              { label: '3', value: 'transition hover:bg-white border-2 border-solid border-white hover:text-black bg-gray-200 text-white' },
            ],
          },
          defaultValue: 'transition bg-white border-2 border-solid border-gray-900 text-black hover:bg-black hover:text-white',
        },
      ],
    },
  ],
};
