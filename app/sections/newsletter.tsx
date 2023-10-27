import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { CSSProperties } from 'react';
import clsx from 'clsx';

interface NewsLetterProps extends HydrogenComponentProps {
  contentAlignment: string;
  sectionHeight: string;
  backgroundColor: string;
  subheading: string;
  heading: string;
  buttonLabel: string;
  buttonLink: string;
  openInNewTab: boolean;
  buttonStyle: string;
  topPadding: string;
  bottomPadding: string;
}

let NewsLetter = forwardRef<HTMLElement, NewsLetterProps>((props, ref) => {
  let { contentAlignment, sectionHeight, backgroundColor, subheading, heading, buttonLabel, buttonLink, openInNewTab, buttonStyle, topPadding, bottomPadding, ...rest } = props;
  let sectionStyle: CSSProperties = {
    alignItems: `${contentAlignment}`,
    '--section-height': `${sectionHeight}px`,
    backgroundColor: `${backgroundColor}`,
    paddingTop: `${topPadding}px`,
    paddingBottom: `${bottomPadding}px`,
  } as CSSProperties;
  return (
    <section ref={ref} {...rest} className='w-full px-10 h-[var(--section-height)] flex flex-col justify-center sm-max:px-8' style={sectionStyle}>
      <div className='text-center w-1/2 flex flex-col gap-5 sm-max:w-full'>
        {subheading && <p className='text-2xl font-medium'>{subheading}</p>}
        {heading && <p className='text-base font-normal'>{heading}</p>}
        <div className='flex w-full mt-3 gap-2 justify-center items-center'>
          <div className='flex justify-center items-center relative sm-max:w-4/5'>
            <input type="text" className='pr-8 pl-3 py-2 rounded border-2 border-solid border-gray-400 font-normal w-full' placeholder='Enter your email' />
            <svg xmlns="http://www.w3.org/2000/svg" className='absolute z-10 right-2 cursor-pointer' width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2.5 8H13.5" stroke="#0F0F0F" stroke-opacity="0.7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M9 3.5L13.5 8L9 12.5" stroke="#0F0F0F" stroke-opacity="0.7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          {buttonLabel && <a href={buttonLink} target={openInNewTab ? '_blank' : ''} className={clsx('flex cursor-pointer py-2 px-4 rounded sm-max:px-3', buttonStyle)}>{buttonLabel}</a>}
        </div>
      </div>
    </section>
  );
});

export default NewsLetter;

export let schema: HydrogenComponentSchema = {
  type: 'news-letter',
  title: 'News letter',
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
          type: 'text',
          name: 'subheading',
          label: 'Subheading',
          defaultValue: 'Subscribe to our Newsletter',
        },
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Subscribe and save more',
        },
        {
          type: 'text',
          label: 'Button label',
          name: 'buttonLabel',
          placeholder: 'Button label',
          defaultValue: 'Button',
        },
        {
          type: 'text',
          label: 'Button link',
          name: 'buttonLink',
          placeholder: 'Button link',
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
              { label: '1', value: 'transition hover:bg-white border-2 border-solid hover:border-gray-900 hover:text-black bg-black text-white' },
              { label: '2', value: 'transition bg-white border-2 border-solid border-gray-900 text-black hover:bg-black hover:text-white' },
              { label: '3', value: 'transition hover:bg-white border-2 border-solid border-white hover:text-black bg-gray-200 text-white' },
            ],
          },
          defaultValue: 'transition hover:bg-white border-2 border-solid hover:border-gray-900 hover:text-black bg-black text-white',
        },
        {
          type: 'range',
          name: 'sectionHeight',
          label: 'Section height',
          defaultValue: 400,
          configs: {
            min: 300,
            max: 700,
            step: 10,
            unit: 'px',
          },
        },
        {
          type: 'range',
          name: 'topPadding',
          label: 'Top padding',
          defaultValue: 10,
          configs: {
            min: 0,
            max: 100,
            step: 1,
            unit: 'px',
          },
        },
        {
          type: 'range',
          name: 'bottomPadding',
          label: 'Bottom padding',
          defaultValue: 10,
          configs: {
            min: 0,
            max: 100,
            step: 1,
            unit: 'px',
          },
        },
      ],
    },
  ],
}
