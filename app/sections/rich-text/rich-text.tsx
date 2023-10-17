import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { CSSProperties } from 'react';

interface RichTextProps extends HydrogenComponentProps {
  heading: string;
  contentAlignment: string;
  descriptionText: string;
  buttonLabel: string;
  buttonLink: string;
  sectionHeight: string;
  backgroundColor: string;
}

let RichText = forwardRef<HTMLElement, RichTextProps>((props, ref) => {
  let {heading, contentAlignment, descriptionText, buttonLabel, buttonLink, sectionHeight, backgroundColor, ...rest } = props;
  let sectionStyle: CSSProperties = {
    alignItems: `${contentAlignment}`,
    '--section-height': `${sectionHeight}`,
    backgroundColor: `${backgroundColor}`,
  } as CSSProperties;
  return (
    <section ref={ref} {...rest} className='py-16 px-10 h-[var(--section-height)] flex flex-col justify-center' style={sectionStyle}>
      <div className='text-center w-1/2'>
          <p className='font-sans text-2xl font-bold mb-5'>{heading}</p>
          <p className='font-sans text-sm font-normal mb-5' dangerouslySetInnerHTML={{ __html: descriptionText }}></p>
          <a href={buttonLink} className='px-4 py-3 text-white cursor-pointer bg-black rounded inline-block'>{buttonLabel}</a>
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
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Rich text',
          placeholder: 'Rich text',
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
          type: 'richtext',
          label: 'Text',
          name: 'descriptionText',
          defaultValue: 'Pair large text with an image to tell a story, explain a detail about your product, or describe a new promotion.',
        },
        {
          type: 'text',
          label: 'Section height',
          name: 'sectionHeight',
          placeholder: '400px',
          defaultValue: '400px',
        },
        {
          type: 'text',
          label: 'Button label',
          name: 'buttonLabel',
          placeholder: 'Button label',
          defaultValue: 'Optional button',
        },
        {
          type: 'text',
          label: 'Button link',
          name: 'buttonLink',
          placeholder: 'Button link',
        }
      ],
    },
  ],
}
