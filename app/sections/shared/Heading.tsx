import {
  type HydrogenComponentProps,
  type HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {clsx} from 'clsx';
import {forwardRef} from 'react';
import type {CSSProperties} from 'react';
import type {Alignment} from '~/lib/type';

type Size = 'default' | 'lead' | 'heading' | 'display' | 'jumbo' | 'scale';
type Weight = 'medium' | 'semibold' | 'bold' | 'extrabold';
type Tracking = 'tight' | 'inherit' | 'wide';
type HeadingProps = HydrogenComponentProps & {
  content: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  size?: Size;
  weight?: Weight;
  tracking?: Tracking;
  alignment?: Alignment;
  className?: string;
  minSize?: number;
  maxSize?: number;
};

let alignmentClasses: Record<Alignment, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

let sizes: Record<Size, string> = {
  default: '',
  lead: 'text-lg leading-snug',
  heading: 'text-lg sm:text-2xl',
  display: 'text-xl sm:text-4xl',
  jumbo: 'text-2xl sm:text-5xl tracking-tight',
  scale: 'text-scale leading-normal',
};

let weightClasses: Record<Weight, string> = {
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

let trackingClasses: Record<Tracking, string> = {
  tight: 'tracking-tight',
  inherit: '',
  wide: 'tracking-wider',
};

let Heading = forwardRef<HTMLHeadingElement, HeadingProps>((props, ref) => {
  let {
    as: Tag = 'h2',
    content,
    size,
    weight,
    tracking,
    alignment,
    minSize,
    maxSize,
    className,
    ...rest
  } = props;
  let style = {} as CSSProperties;
  if (size === 'scale') {
    style = {
      '--min-size-px': `${minSize}px`,
      '--min-size': minSize,
      '--max-size': maxSize,
    } as CSSProperties;
  }
  return (
    <Tag
      ref={ref}
      {...rest}
      style={style}
      className={clsx(
        sizes[size!],
        weightClasses[weight!],
        trackingClasses[tracking!],
        alignmentClasses[alignment!],
        className,
      )}
    >
      {content}
    </Tag>
  );
});

Heading.defaultProps = {
  as: 'h2',
  size: 'default',
  weight: 'bold',
  tracking: 'inherit',
  alignment: 'center',
  content: 'Section heading',
  minSize: 16,
  maxSize: 72,
};

export default Heading;

export let schema: HydrogenComponentSchema = {
  type: 'heading',
  title: 'Heading',
  inspector: [
    {
      group: 'Heading',
      inputs: [
        {
          type: 'select',
          name: 'as',
          label: 'Tag name',
          configs: {
            options: [
              {value: 'h1', label: 'Heading 1'},
              {value: 'h2', label: 'Heading 2'},
              {value: 'h3', label: 'Heading 3'},
              {value: 'h4', label: 'Heading 4'},
              {value: 'h5', label: 'Heading 5'},
              {value: 'h6', label: 'Heading 6'},
            ],
          },
          defaultValue: 'h2',
        },
        {
          type: 'text',
          name: 'content',
          label: 'Content',
          defaultValue: 'Section heading',
          placeholder: 'Section heading',
        },
        {
          type: 'select',
          name: 'size',
          label: 'Text size',
          configs: {
            options: [
              {value: 'default', label: 'Default'},
              {value: 'lead', label: 'Lead'},
              {value: 'heading', label: 'Heading'},
              {value: 'display', label: 'Display'},
              {value: 'jumbo', label: 'Jumbo'},
              {value: 'scale', label: 'Auto Scale'},
            ],
          },
          defaultValue: 'default',
          helpText: 'Text size is responsive automatically.',
        },
        {
          type: 'range',
          name: 'minSize',
          label: 'Minimum scale size',
          configs: {
            min: 12,
            max: 32,
            step: 1,
            unit: 'px',
          },
          defaultValue: 16,
          condition: 'size.eq.scale',
        },
        {
          type: 'range',
          name: 'maxSize',
          label: 'Maximum scale size',
          configs: {
            min: 64,
            max: 96,
            step: 1,
            unit: 'px',
          },
          defaultValue: 72,
          condition: 'size.eq.scale',
          helpText:
            'See how scale text works <a href="https://css-tricks.com/snippets/css/fluid-typography/" target="_blank" rel="noreferrer">here</a>.',
        },
        {
          type: 'select',
          name: 'weight',
          label: 'Weight',
          configs: {
            options: [
              {value: 'medium', label: 'Medium'},
              {value: 'semibold', label: 'Semibold'},
              {value: 'bold', label: 'Bold'},
              {value: 'extrabold', label: 'Extrabold'},
            ],
          },
          defaultValue: 'bold',
        },
        {
          type: 'toggle-group',
          name: 'tracking',
          label: 'Letter spacing',
          configs: {
            options: [
              {value: 'tight', label: 'Tight', icon: 'ArrowsInLineHorizontal'},
              {value: 'inherit', label: 'Inherit', icon: 'Placeholder'},
              {value: 'wide', label: 'Wide', icon: 'ArrowsOutLineHorizontal'},
            ],
          },
          defaultValue: 'normal',
        },
        {
          type: 'toggle-group',
          name: 'alignment',
          label: 'Alignment',
          configs: {
            options: [
              {value: 'left', label: 'Left', icon: 'AlignLeft'},
              {value: 'center', label: 'Center', icon: 'AlignCenterHorizontal'},
              {value: 'right', label: 'Right', icon: 'AlignRight'},
            ],
          },
          defaultValue: 'center',
        },
      ],
    },
  ],
  toolbar: ['general-settings', ['duplicate', 'delete']],
};
