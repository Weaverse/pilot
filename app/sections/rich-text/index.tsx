import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { CSSProperties } from 'react';

interface RichTextProps extends HydrogenComponentProps {
  contentAlignment: string;
  sectionHeight: string;
  backgroundColor: string;
}

let RichText = forwardRef<HTMLElement, RichTextProps>((props, ref) => {
  let { contentAlignment, sectionHeight, backgroundColor, children, ...rest } = props;
  let sectionStyle: CSSProperties = {
    alignItems: `${contentAlignment}`,
    '--section-height': `${sectionHeight}px`,
    backgroundColor: `${backgroundColor}`,
  } as CSSProperties;
  return (
    <section ref={ref} {...rest} className='py-16 px-10 h-[var(--section-height)] flex flex-col justify-center' style={sectionStyle}>
      <div className='text-center w-full flex flex-col gap-5 sm:w-1/2'>
        {children}
      </div>
    </section>
  );
});

export default RichText;

export let schema: HydrogenComponentSchema = {
  type: 'rich-text',
  title: 'Rich text',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Text',
      inputs: [
        {
          type: 'color',
          name: 'backgroundColor',
          label: 'Background color',
          defaultValue: '#F7F7F7',
        },
        {
          type: 'toggle-group',
          label: 'Content alignment',
          name: 'contentAlignment',
          configs: {
            options: [
              { label: 'Left', value: 'flex-start' },
              { label: 'Center', value: 'center' },
              { label: 'Right', value: 'flex-end' },
            ],
          },
          defaultValue: 'center',
        },
        {
          type: 'range',
          name: 'sectionHeight',
          label: 'Section height',
          defaultValue: 400,
          configs: {
            min: 300,
            max: 500,
            step: 10,
            unit: 'px',
          },
        },
      ],
    },
  ],
  childTypes: ['rich-text-heading--item', 'rich-text-description--item', 'rich-text-button--item'],
  presets: {
    children: [
      {
        type: 'rich-text-heading--item',
      },
      {
        type: 'rich-text-description--item',
      },
      {
        type: 'rich-text-button--item',
      }
    ],
  },
}
