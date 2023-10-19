import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { CSSProperties } from 'react';


interface MapProps extends HydrogenComponentProps {
  heading: string;
  contentAlignment: string;
  descriptionText: string;
  address: string;
  buttonLabel: string;
  buttonLink: string;
  sectionHeight: string;
}

let Map = forwardRef<HTMLElement, MapProps>((props, ref) => {
  let { heading, contentAlignment, descriptionText, address, buttonLabel, buttonLink, sectionHeight, ...rest } = props;
  let sectionStyle: CSSProperties = {
    '--section-height': `${sectionHeight}`,
    justifyContent: `${contentAlignment}`,
  } as CSSProperties;

  return (
    <section ref={ref} {...rest} className='flex relative p-10 overflow-hidden h-[var(--section-height)]' style={sectionStyle}>
      <div className='absolute inset-0'>
        <iframe className='w-full h-full object-cover' title="map" src={`https://maps.google.com/maps?t=m&q=${address}&ie=UTF8&&output=embed`} loading="lazy"></iframe>
      </div>
      <div className='relative bg-white rounded-3xl p-8 border-2 border-solid border-gray-200 h-fit w-80'>
        <div className='z-10 flex flex-col gap-6'>
          {heading && <p className='font-sans text-2xl font-bold'>{heading}</p>}
          {address && <p className='font-sans text-sm font-normal'>{address}</p>}
          {descriptionText && <p className='font-sans text-sm font-normal'>{descriptionText}</p>}
          {buttonLabel && <a href={buttonLink} className='px-4 py-3 w-fit cursor-pointer rounded border-2 border-solid border-gray-900 inline-block'>{buttonLabel}</a>}
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
          type: 'textarea',
          label: 'Description text',
          name: 'descriptionText',
          defaultValue: 'Pair large text with an image to tell a story, explain a detail about your product, or describe a new promotion.',
        },
        {
          type: 'map-autocomplete',
          name: 'address',
          label: 'Map address',
          defaultValue: 'Inglewood, CaliforninaUS, 90301',
        },
        {
          type: 'text',
          name: 'sectionHeight',
          label: 'Section height',
          placeholder: '500px',
          defaultValue: '500px',
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
};
