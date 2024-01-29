import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import type {CSSProperties} from 'react';
import {forwardRef} from 'react';
import {IconMapBlank} from '~/components';
import clsx from 'clsx';

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
  buttonStyle: string;
}

let Map = forwardRef<HTMLElement, MapProps>((props, ref) => {
  let {
    heading,
    textColor,
    contentAlignment,
    descriptionText,
    address,
    buttonLabel,
    buttonLink,
    openInNewTab,
    sectionHeight,
    buttonStyle,
    ...rest
  } = props;
  let sectionStyle: CSSProperties = {
    '--section-height': `${sectionHeight}px`,
    justifyContent: `${contentAlignment}`,
  } as CSSProperties;

  return (
    <section
      ref={ref}
      {...rest}
      className="flex relative p-10 overflow-hidden h-[var(--section-height)]"
      style={sectionStyle}
    >
      <div className="absolute inset-0">
        {address ? (
          <iframe
            className="w-full h-full object-cover"
            title="map"
            src={`https://maps.google.com/maps?t=m&q=${address}&ie=UTF8&&output=embed`}
          ></iframe>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <IconMapBlank
              viewBox="0 0 230 230"
              className="!w-56 !h-56 opacity-20"
            />
          </div>
        )}
      </div>
      <div className="relative bg-white rounded-3xl p-8 border-2 border-solid border-gray-200 h-fit w-80">
        <div className="z-10 flex flex-col gap-6">
          {heading && (
            <p className="text-2xl font-bold" style={{color: textColor}}>
              {heading}
            </p>
          )}
          {address && (
            <p className="text-sm font-normal" style={{color: textColor}}>
              {address}
            </p>
          )}
          {descriptionText && (
            <p className="text-sm font-normal" style={{color: textColor}}>
              {descriptionText}
            </p>
          )}
          {buttonLabel && (
            <a
              href={buttonLink}
              target={openInNewTab ? '_blank' : ''}
              className={clsx(
                'px-4 py-3 w-fit cursor-pointer rounded inline-block',
                buttonStyle,
              )}
              rel="noreferrer"
            >
              {buttonLabel}
            </a>
          )}
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
              {label: 'Left', value: 'flex-start'},
              {label: 'Center', value: 'center'},
              {label: 'Right', value: 'flex-end'},
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
          defaultValue:
            'Pair large text with an image to tell a story, explain a detail about your product, or describe a new promotion.',
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
              {
                label: '1',
                value:
                  'transition hover:bg-white border-2 border-solid hover:border-gray-900 hover:text-black bg-black text-white',
              },
              {
                label: '2',
                value:
                  'transition bg-white border-2 border-solid border-gray-900 text-black hover:bg-black hover:text-white',
              },
              {
                label: '3',
                value:
                  'transition hover:bg-white border-2 border-solid border-white hover:text-black bg-gray-200 text-white',
              },
            ],
          },
          defaultValue:
            'transition bg-white border-2 border-solid border-gray-900 text-black hover:bg-black hover:text-white',
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
