import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseImage,
} from '@weaverse/hydrogen';
import type {CSSProperties} from 'react';
import {forwardRef} from 'react';
import {Image} from '@shopify/hydrogen';

interface CountdownProps extends HydrogenComponentProps {
  backgroundColor: string;
  backgroundImage: WeaverseImage;
  overlayColor: string;
  overlayOpacity: number;
  sectionHeight: number;
}

let Countdown = forwardRef<HTMLElement, CountdownProps>((props, ref) => {
  let {
    backgroundColor,
    backgroundImage,
    overlayColor,
    overlayOpacity,
    sectionHeight,
    children,
    ...rest
  } = props;
  let sectionStyle: CSSProperties = {
    '--section-height': `${sectionHeight}px`,
    '--section-background-color': backgroundColor,
    '--overlay-color': overlayColor,
    '--overlay-opacity': `${overlayOpacity}%`,
  } as CSSProperties;

  return (
    <section
      ref={ref}
      {...rest}
      className="flex relative items-center justify-center text-center px-10 py-16 w-full sm-max:px-4 h-[var(--section-height)]"
      style={sectionStyle}
    >
      <div className="absolute inset-0 bg-[var(--section-background-color)]">
        {backgroundImage && (
          <Image
            data={backgroundImage}
            sizes="auto"
            className="w-full h-full object-cover"
          />
        )}
        {backgroundImage && (
          <div className="absolute inset-0 bg-[var(--overlay-color)] opacity-[var(--overlay-opacity)]"></div>
        )}
      </div>
      <div className="flex flex-col gap-3 items-center w-5/6 sm-max:w-full z-10">
        {children}
      </div>
    </section>
  );
});

export default Countdown;

export let schema: HydrogenComponentSchema = {
  type: 'count-down',
  title: 'Countdown',
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
  childTypes: [
    'heading',
    'subheading',
    'countdown--timer',
    'countdown--actions',
  ],
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
        type: 'countdown--timer',
      },
      {
        type: 'countdown--actions',
      },
    ],
  },
};
