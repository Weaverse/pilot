import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef, type ButtonHTMLAttributes} from 'react';

type ButtonData = {
  type: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  text: string;
};

let Button = forwardRef<HTMLButtonElement, HydrogenComponentProps<ButtonData>>(
  (props, ref) => {
    let {data, ...rest} = props;
    let {type, text} = data;
    return (
      <button ref={ref} {...rest} type={type}>
        {text}
      </button>
    );
  },
);

Button.defaultProps = {
  data: {
    type: 'button',
    text: 'Click me',
    className:
      'inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg',
  },
};

export let schema: HydrogenComponentSchema = {
  type: 'button',
  title: 'Button',
  inspector: {
    settings: [
      {
        groupType: 'basic',
        groupHeader: 'Button',
        inputs: [
          {
            type: 'text',
            label: 'Button text',
            name: 'text',
            placeholder: 'Button text',
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
          },
          {
            type: 'switch',
            label: 'Open in new tab',
            name: 'openInNewTab',
            condition: 'clickAction.eq.openLink',
          },
        ],
      },
    ],
  },
  toolbar: ['general-settings', ['duplicate', 'delete']],
};

export default Button;
