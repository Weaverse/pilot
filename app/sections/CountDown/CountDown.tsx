import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseImage,
} from '@weaverse/hydrogen';
import { forwardRef, CSSProperties } from 'react';
import clsx from 'clsx';
import { Image } from '@shopify/hydrogen';


interface CountDownProps extends HydrogenComponentProps {
  backgroundColor: string;
  backgroundImage: WeaverseImage;
  overlayColor: string;
  overlayOpacity: number;
  buttonLabel1: string;
  buttonLink1: string;
  buttonLabel2: string;
  buttonLink2: string;
  enableNewtab: boolean;
  buttonStyle1: string;
  buttonStyle2: string;
  sectionHeight: number;
}

let Countdown = forwardRef<HTMLElement, CountDownProps>((props, ref) => {
  let { backgroundColor, backgroundImage, overlayColor, overlayOpacity, buttonLabel1, buttonLink1, buttonLabel2, buttonLink2, enableNewtab, buttonStyle1, buttonStyle2, sectionHeight, children, ...rest } = props;
  let sectionStyle: CSSProperties = {
    '--section-height': `${sectionHeight}px`,
    '--section-background-color': backgroundColor,
    '--overlay-color': overlayColor,
    '--overlay-opacity': `${overlayOpacity}%`,
  } as CSSProperties;

  return (
    <section ref={ref} {...rest} className='flex relative items-center justify-center text-center px-10 py-16 w-full sm-max:px-4 h-[var(--section-height)]' style={sectionStyle}>
      <div className='absolute inset-0 bg-[var(--section-background-color)]'>
        {backgroundImage && <Image data={backgroundImage} className='w-full h-full object-cover' />}
        {backgroundImage && <div className='absolute inset-0 bg-[var(--overlay-color)] opacity-[var(--overlay-opacity)]'></div>}
      </div>
      <div className='flex flex-col gap-3 items-center w-5/6 sm-max:w-full z-10'>
        {children}
        <div className='flex gap-3 mt-3'>
          {buttonLabel1 && <a className={clsx('py-3 px-4 cursor-pointer rounded', buttonStyle1)} href={buttonLink1} target={enableNewtab ? '_blank' : ''}>{buttonLabel1}</a>}
          {buttonLabel2 && <a className={clsx('py-3 px-4 cursor-pointer rounded', buttonStyle2)} href={buttonLink2} target={enableNewtab ? '_blank' : ''}>{buttonLabel2}</a>}
        </div>
      </div>
    </section>
  );
});

export default Countdown;

export let schema: HydrogenComponentSchema = {
  type: 'count-down',
  title: 'Count down',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Countdown',
      inputs: [
        {
          type: 'color',
          name: 'backgroundColor',
          label: 'Background color',
          defaultValue: '#ffffff',
        },
        {
          type: 'image',
          name: 'backgroundImage',
          label: 'Background image',
        },
        {
          type: 'color',
          name: 'overlayColor',
          label: 'Overlay color',
        },
        {
          type: 'range',
          name: 'overlayOpacity',
          label: 'Overlay opacity',
          defaultValue: 50,
          configs: {
            min: 10,
            max: 100,
            step: 10,
            unit: '%',
          },
        },
        {
          type: 'text',
          name: 'buttonLabel1',
          label: 'Button #1 label',
          defaultValue: 'Shop this',
        },
        {
          type: 'text',
          name: 'buttonLink1',
          label: 'Button #1 link',
          placeholder: 'https://',
        },
        {
          type: 'text',
          name: 'buttonLabel2',
          label: 'Button #2 label',
          defaultValue: 'Shop all',
        },
        {
          type: 'text',
          name: 'buttonLink2',
          label: 'Button #2 link',
          placeholder: 'https://',
        },
        {
          type: 'switch',
          name: 'enableNewtab',
          label: 'Open in new tab',
          defaultValue: true,
        },
        {
          type: 'toggle-group',
          label: 'Button #1 style',
          name: 'buttonStyle1',
          configs: {
            options: [
              { label: '1', value: 'transition hover:bg-white border-2 border-solid hover:border-gray-900 hover:text-black bg-black text-white' },
              { label: '2', value: 'transition bg-white border-2 border-solid border-gray-900 text-black hover:bg-black hover:text-white' },
              { label: '3', value: 'transition hover:bg-white border-2 border-solid border-white hover:text-black bg-gray-200 text-white' },
            ],
          },
          defaultValue: 'transition bg-white border-2 border-solid border-gray-900 text-black hover:bg-black hover:text-white',
        },
        {
          type: 'toggle-group',
          label: 'Button #2 style',
          name: 'buttonStyle2',
          configs: {
            options: [
              { label: '1', value: 'transition hover:bg-white border-2 border-solid hover:border-gray-900 hover:text-black bg-black text-white' },
              { label: '2', value: 'transition bg-white border-2 border-solid border-gray-900 text-black hover:bg-black hover:text-white' },
              { label: '3', value: 'transition hover:bg-white border-2 border-solid border-white hover:text-black bg-gray-200 text-white' },
            ],
          },
          defaultValue: 'transition bg-white border-2 border-solid border-gray-900 text-black hover:bg-black hover:text-white',
        },
        {
          type: 'range',
          name: 'sectionHeight',
          label: 'Section height',
          defaultValue: 450,
          configs: {
            min: 400,
            max: 700,
            step: 10,
            unit: 'px',
          },
        },
      ],
    },
  ],
  childTypes: ['heading', 'subheading', 'count-down--timer'],
  presets: {
    children: [
      {
        type: 'heading',
        content: 'Countdown heading',
      },
      {
        type: 'subheading',
        content: 'Countdown to our upcoming event',
      },
      {
        type: 'count-down--timer',
      },
    ],
  },
};
