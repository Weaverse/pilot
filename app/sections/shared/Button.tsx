import {
  InspectorGroup,
  type HydrogenComponentProps,
  type HydrogenComponentSchema
} from '@weaverse/hydrogen';
import { VariantProps, cva } from 'class-variance-authority';
import { clsx } from 'clsx';
import { forwardRef } from 'react';
import { Link } from '~/components';

export interface ButtonProps extends VariantProps<typeof variants> {
  as?: keyof HTMLElementTagNameMap;
  className?: string;
  text: string;
  link?: string;
  openInNewTab?: boolean;
};

let variants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-base font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'btn-primary border-2 px-5 py-3',
        secondary: 'btn-secondary border-2 px-5 py-3',
        link: 'btn-link bg-transparent py-3 border-b-2 py-3',
      },
      shape: {
        square: '',
        rounded: 'rounded-md',
        pill: 'rounded-full',
      },
      weight: {
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      }
    },
    defaultVariants: {
      variant: 'primary',
      shape: 'rounded',
      weight: 'medium',
    },
  },
);

interface Props extends ButtonProps, Partial<HydrogenComponentProps> { }

let Button = forwardRef<HTMLElement, Props>((props, ref) => {
  let { as = 'button', variant, shape = 'rounded', weight = 'medium', text, link, openInNewTab, className, ...rest } =
    props;

  if (link) {
    return (
      <Link
        ref={ref as React.ForwardedRef<HTMLAnchorElement>}
        {...rest}
        className={clsx(variants({ variant: variant, className }))}
        to={link || '/'}
        target={openInNewTab ? '_blank' : '_self'}
        rel="noreferrer"
      >
        {text}
      </Link>
    );
  }
  return (
    <button
      ref={ref as React.ForwardedRef<HTMLButtonElement>}
      {...rest}
      type='button'
      className={clsx(variants({ variant: variant, className }))}
    >
      {text}
    </button>
  )
});

export default Button;

export let buttonInputs: InspectorGroup['inputs'] = [
  {
    type: 'text',
    name: 'text',
    label: 'Text content',
    defaultValue: 'Shop now',
    placeholder: 'Shop now',
  },
  {
    type: 'url',
    name: 'link',
    label: 'Link to',
    defaultValue: '/products',
    placeholder: '/products',
  },
  {
    type: 'switch',
    name: 'openInNewTab',
    label: 'Open in new tab',
    defaultValue: false,
    condition: 'buttonLink.ne.nil'
  },
  {
    type: 'select',
    name: 'variant',
    label: 'Variant',
    configs: {
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Link', value: 'link' },
      ],
    },
    defaultValue: 'primary',
  },
]

export let schema: HydrogenComponentSchema = {
  type: 'button',
  title: 'Button',
  inspector: [
    {
      group: 'Button',
      inputs: buttonInputs,
    },
  ],
  toolbar: ['general-settings', ['duplicate', 'delete']],
};
