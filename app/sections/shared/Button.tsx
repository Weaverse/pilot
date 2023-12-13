import {
  type HydrogenComponentProps,
  type HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {clsx} from 'clsx';
import {forwardRef} from 'react';
import type {CSSProperties} from 'react';

type ButtonStyle = 'primary' | 'secondary' | 'subtle';
type ButtonProps = HydrogenComponentProps & {
  content: string;
  className?: string;
  buttonStyle?: ButtonStyle;
  buttonLink?: string;
  openInNewTab?: boolean;
};

let buttonStyleClasses: Record<ButtonStyle, string> = {
  primary: 'transition btn-primary',
  secondary: 'transition btn-secondary',
  subtle: 'transition btn-subtle',
};

let Button = forwardRef<HTMLAnchorElement, ButtonProps>((props, ref) => {
  let {content, buttonStyle, buttonLink, openInNewTab, className, ...rest} =
    props;
  let style = {} as CSSProperties;
  return (
    <a ref={ref}
      {...rest}
      style={style}
      className={clsx(
        'py-3 px-4 rounded cursor-pointer mt-3 w-fit mx-auto',
        buttonStyleClasses[buttonStyle!],
        className,
      )}
      href={`${buttonLink}`} target={openInNewTab ? '_blank' : ''}
    >
      {content}
    </a>
  );
});

Button.defaultProps = {
  content: 'Button',
  buttonStyle: 'secondary',
};

export default Button;

export let schema: HydrogenComponentSchema = {
  type: 'button',
  title: 'Button',
  inspector: [
    {
      group: 'Button',
      inputs: [
        {
          type: 'text',
          name: 'content',
          label: 'Content',
          defaultValue: 'Button',
          placeholder: 'Button label',
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
          type: 'select',
          name: 'buttonStyle',
          label: 'Button style',
          configs: {
            options: [
              {label: 'primary', value: 'primary'},
              {label: 'secondary', value: 'secondary'},
              {label: 'subtle', value: 'subtle'},
            ],
          },
          defaultValue: 'secondary',
        },
      ],
    },
  ],
  toolbar: ['general-settings', ['duplicate', 'delete']],
};
