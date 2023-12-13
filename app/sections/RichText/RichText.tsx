import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import type {CSSProperties} from 'react';
import {forwardRef} from 'react';

interface RichTextProps extends HydrogenComponentProps {
  contentAlignment: string;
  sectionHeight: string;
  backgroundColor: string;
  topPadding: string;
  bottomPadding: string;
}

let RichText = forwardRef<HTMLElement, RichTextProps>((props, ref) => {
  let {
    contentAlignment,
    sectionHeight,
    backgroundColor,
    topPadding,
    bottomPadding,
    children,
    ...rest
  } = props;
  let sectionStyle: CSSProperties = {
    alignItems: `${contentAlignment}`,
    '--section-height': `${sectionHeight}px`,
    backgroundColor: `${backgroundColor}`,
    paddingTop: `${topPadding}px`,
    paddingBottom: `${bottomPadding}px`,
    '--max-width-content': '600px',
  } as CSSProperties;
  return (
    <section
      ref={ref}
      {...rest}
      className="py-16 px-10 h-[var(--section-height)] flex flex-col justify-center"
      style={sectionStyle}
    >
      <div className="text-center w-full flex flex-col gap-5 sm:w-[var(--max-width-content)]">
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
              {label: 'Left', value: 'flex-start'},
              {label: 'Center', value: 'center'},
              {label: 'Right', value: 'flex-end'},
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
        {
          type: 'range',
          name: 'topPadding',
          label: 'Top padding',
          defaultValue: 40,
          configs: {
            min: 10,
            max: 100,
            step: 10,
            unit: 'px',
          },
        },
        {
          type: 'range',
          name: 'bottomPadding',
          label: 'Bottom padding',
          defaultValue: 40,
          configs: {
            min: 10,
            max: 100,
            step: 10,
            unit: 'px',
          },
        },
      ],
    },
  ],
  childTypes: ['heading', 'description', 'button'],
  presets: {
    children: [
      {
        type: 'heading',
        content: 'Rich text',
      },
      {
        type: 'description',
        content:
          'Pair large text with an image to tell a story, explain a detail about your product, or describe a new promotion.',
      },
      {
        type: 'button',
        content: 'Button section',
      },
    ],
  },
};
