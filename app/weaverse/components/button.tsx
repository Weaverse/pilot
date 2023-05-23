import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef, type ButtonHTMLAttributes} from 'react';

interface ButtonProps
  extends HydrogenComponentProps<{
    type: ButtonHTMLAttributes<HTMLButtonElement>['type'];
    text: string;
  }> {}

let Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  let {data, ...rest} = props;
  let {type, text} = data;
  return (
    <button ref={ref} {...rest} type={type}>
      {text}
    </button>
  );
});

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
    settings: [],
    styles: [],
  },
  toolbar: ['general-settings', ['duplicate', 'delete']],
};

export default Button;
