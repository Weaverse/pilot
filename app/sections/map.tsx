import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { CSSProperties } from 'react';
import {IconMapBlank} from '~/components';


interface MapProps extends HydrogenComponentProps {
  heading: string;
  textColor: string;
  contentAlignment: string;
  descriptionText: string;
  address: string;
  buttonLabel: string;
  buttonLink: string;
  openInNewTab: boolean;
  sectionHeight: string;
}

let Map = forwardRef<HTMLElement, MapProps>((props, ref) => {
  let { heading, textColor, contentAlignment, descriptionText, address, buttonLabel, buttonLink, openInNewTab, sectionHeight, ...rest } = props;
  let sectionStyle: CSSProperties = {
    '--section-height': `${sectionHeight}px`,
    justifyContent: `${contentAlignment}`,
  } as CSSProperties;

  return (
    <section ref={ref} {...rest} className='flex relative p-10 overflow-hidden h-[var(--section-height)]' style={sectionStyle}>
      <div className='absolute inset-0'>
        {address ? <iframe className='w-full h-full object-cover' title="map" src={`https://maps.google.com/maps?t=m&q=${address}&ie=UTF8&&output=embed`}></iframe> :
        <div className='absolute inset-0 flex items-center justify-center bg-gray-200'>
          <IconMapBlank viewBox="0 0 230 230" className='!w-56 !h-56 opacity-20' />
        </div>}
      </div>
      <div className='relative bg-white rounded-3xl p-8 border-2 border-solid border-gray-200 h-fit w-80'>
        <div className='z-10 flex flex-col gap-6'>
          {heading && <p className='font-sans text-2xl font-bold' style={{ color: textColor }}>{heading}</p>}
          {address && <p className='font-sans text-sm font-normal' style={{ color: textColor }}>{address}</p>}
          {descriptionText && <p className='font-sans text-sm font-normal' style={{ color: textColor }}>{descriptionText}</p>}
          {buttonLabel && <a href={buttonLink} target={openInNewTab ? '_blank' : ''} className='px-4 py-3 w-fit cursor-pointer rounded border-2 border-solid border-gray-900 inline-block'>{buttonLabel}</a>}
        </div>
      </div>
    </section>
  );
});

export default Map;

export let schema: HydrogenComponentSchema = {
  type: 'map',
  title: 'Map',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Map',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Our store address',
        },
        {
          type: 'color',
          name: 'textColor',
          label: 'Text color',
          defaultValue: '#333333',
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
          type: 'map-autocomplete',
          name: 'address',
          label: 'Map address',
          defaultValue: 'San Francisco, CA',
        },
        {
          type: 'textarea',
          label: 'Description text',
          name: 'descriptionText',
          defaultValue: 'Pair large text with an image to tell a story, explain a detail about your product, or describe a new promotion.',
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
          defaultValue: '1',
        },
        {
          type: 'range',
          name: 'sectionHeight',
          label: 'Section height',
          defaultValue: 500,
          configs: {
            min: 400,
            max: 900,
            step: 10,
            unit: 'px',
          },
        },
      ],
    },
  ],
};
