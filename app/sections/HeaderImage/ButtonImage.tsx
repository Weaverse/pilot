import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import clsx from 'clsx';


interface ButtonItemProps extends HydrogenComponentProps {
  buttonLink: string;
  buttonLabel: string;
  openInNewTab: boolean;
  buttonStyle: string;
}

let buttonItem = forwardRef<HTMLDivElement, ButtonItemProps>((props, ref) => {
  let { buttonLink, buttonLabel, openInNewTab, buttonStyle, ...rest } = props;
  return (
    <div ref={ref} {...rest} className='mt-3'>
      {buttonLabel && <a href={`${buttonLink}`} target={openInNewTab ? '_blank' : ''} className={clsx('py-3 px-4 rounded', buttonStyle)} rel="noreferrer">{buttonLabel}</a>}
    </div>
  );
});

export default buttonItem;

export let schema: HydrogenComponentSchema = {
  type: 'button-image--item',
  title: 'Button',
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
          placeholder: 'https://',
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
}
