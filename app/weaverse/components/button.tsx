import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef, type ButtonHTMLAttributes} from 'react';

interface ButtonProps extends HydrogenComponentProps {
  _type: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  text: string;
}

let Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  let {_type, text, ...rest} = props;
  rest.className ??=
    'inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg';
  return (
    <button ref={ref} {...rest} type={_type}>
      {text}
    </button>
  );
});

export let schema: HydrogenComponentSchema = {
  type: 'button',
  title: 'Button',
  inspector: [
    {
      group: 'Button',
      inputs: [
        {
          type: 'text',
          label: 'Button text',
          name: 'text',
          placeholder: 'Button text',
          defaultValue: 'Click me',
        },
        {
          type: 'select',
          label: 'Click action',
          name: 'clickAction',
          configs: {
            options: [
              {value: 'none', label: 'None'},
              {value: 'openLink', label: 'Open link'},
            ],
          },
          defaultValue: 'none',
        },
        {
          type: 'text',
          label: 'Link to',
          name: 'linkTo',
          placeholder: 'https://example.com',
          condition: 'clickAction.eq.openLink',
          defaultValue: 'https://example.com',
        },
        {
          type: 'switch',
          label: 'Open in new tab',
          name: 'openInNewTab',
          condition: 'clickAction.eq.openLink',
          defaultValue: false,
        },
      ],
    },
  ],
  toolbar: ['general-settings', ['duplicate', 'delete']],
};

export default Button;
