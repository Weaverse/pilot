import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import clsx from 'clsx';

interface VideoButtonProps extends HydrogenComponentProps {
  buttonLabel: string;
  buttonLink: string;
  enableNewtab: boolean;
  buttonStyle: string;
}

let VideoButtonItem = forwardRef<HTMLDivElement, VideoButtonProps>((props, ref) => {
  let {buttonLabel, buttonLink, enableNewtab, buttonStyle, ...rest} = props;
  return (
    <div ref={ref} {...rest} className='mt-3'>
      <a href={buttonLink} target={enableNewtab ? '_blank' : ''} className={clsx('py-3 px-4 cursor-pointer rounded', buttonStyle)}>{buttonLabel}</a>
    </div>
  );
});

export default VideoButtonItem;

export let schema: HydrogenComponentSchema = {
  type: 'video-button--item',
  title: 'Button',
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
          placeholder: 'https://',
        },
        {
          type: 'switch',
          name: 'enableNewtab',
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
