import {
  type HydrogenComponentProps,
  type HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { clsx } from 'clsx';
import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import type { Alignment } from '~/lib/type';


type ButtonStyle = '1' | '2' | '3';
type ButtonProps = HydrogenComponentProps & {
  content: string;
  alignment?: Alignment;
  className?: string;
  buttonStyle?: ButtonStyle;
  buttonLink?: string;
  openInNewTab?: boolean;
};

let alignmentClasses: Record<Alignment, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

let buttonStyleClasses: Record<ButtonStyle, string> = {
  1: 'transition hover:bg-white border-2 border-solid hover:border-gray-900 hover:text-black bg-black text-white',
  2: 'transition bg-white border-2 border-solid border-gray-900 text-black hover:bg-black hover:text-white',
  3: 'transition hover:bg-white border-2 border-solid border-white hover:text-black text-white',
};

let Button = forwardRef<HTMLDivElement, ButtonProps>((props, ref) => {
  let {
    content,
    alignment,
    buttonStyle,
    buttonLink,
    openInNewTab,
    className,
    ...rest
  } = props;
  let style = {} as CSSProperties;
  return (
    <div ref={ref}
    {...rest} className={clsx(alignmentClasses[alignment!], 'mt-3')}>
      {content && <a
        style={style}
        className={clsx(
          'py-3 px-4 rounded cursor-pointer',
          buttonStyleClasses[buttonStyle!],
          className,
        )}
        href={`${buttonLink}`} target={openInNewTab ? '_blank' : ''}
      >
        {content}
      </a>}
    </div>
  );
});

Button.defaultProps = {
  alignment: 'center',
  content: 'Button',
  buttonStyle: '2',
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
          type: 'toggle-group',
          label: 'Button style',
          name: 'buttonStyle',
          configs: {
            options: [
              { label: '1', value: '1' },
              { label: '2', value: '2' },
              { label: '3', value: '3' },
            ],
          },
          defaultValue: '2',
        },
        {
          type: 'toggle-group',
          name: 'alignment',
          label: 'Alignment',
          configs: {
            options: [
              { value: 'left', label: 'Left', icon: 'AlignLeft' },
              { value: 'center', label: 'Center', icon: 'AlignCenterHorizontal' },
              { value: 'right', label: 'Right', icon: 'AlignRight' },
            ],
          },
          defaultValue: 'center',
        },
      ],
    },
  ],
  toolbar: ['general-settings', ['duplicate', 'delete']],
};
