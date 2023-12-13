import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import type {CSSProperties} from 'react';
import {forwardRef} from 'react';

interface ContentColumnWithImageProps extends HydrogenComponentProps {
  heading: string;
  textColor: string;
  gap: number;
  headingAlignment: string;
  topPadding: number;
  bottomPadding: number;
}

let ContentColumnWithImage = forwardRef<
  HTMLElement,
  ContentColumnWithImageProps
>((props, ref) => {
  let {
    heading,
    textColor,
    headingAlignment,
    gap,
    topPadding,
    bottomPadding,
    children,
    ...rest
  } = props;
  let headingStyle: CSSProperties = {
    justifyContent: `${headingAlignment}`,
  } as CSSProperties;
  let sectionStyle: CSSProperties = {
    paddingTop: `${topPadding}px`,
    paddingBottom: `${bottomPadding}px`,
    '--text-color': `${textColor}`,
    '--gap-item': `${gap}px`,
  } as CSSProperties;

  return (
    <section ref={ref} {...rest} className="w-full h-full" style={sectionStyle}>
      <div className="px-10 py-10 flex flex-col gap-5 sm-max:px-6">
        <div className="flex" style={headingStyle}>
          <h3 className="text-[var(--text-color)] font-medium">{heading}</h3>
        </div>
        <div className="flex flex-wrap gap-[var(--gap-item)] justify-center">
          {children}
        </div>
      </div>
    </section>
  );
});

export default ContentColumnWithImage;

export let schema: HydrogenComponentSchema = {
  type: 'column-with-image',
  title: 'Column with image',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Content',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Heading for Image',
          placeholder: 'Heading for Image section',
        },
        {
          type: 'color',
          name: 'textColor',
          label: 'Text color',
          defaultValue: '#000000',
        },
        {
          type: 'toggle-group',
          label: 'Heading alignment',
          name: 'headingAlignment',
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
          name: 'gap',
          label: 'Gap',
          defaultValue: 20,
          configs: {
            min: 10,
            max: 50,
            step: 1,
            unit: 'px',
          },
        },
        {
          type: 'range',
          name: 'topPadding',
          label: 'Top padding',
          defaultValue: 0,
          configs: {
            min: 0,
            max: 100,
            step: 5,
            unit: 'px',
          },
        },
        {
          type: 'range',
          name: 'bottomPadding',
          label: 'Bottom padding',
          defaultValue: 0,
          configs: {
            min: 0,
            max: 100,
            step: 5,
            unit: 'px',
          },
        },
      ],
    },
  ],
  childTypes: ['column--item'],
  presets: {
    children: [
      {
        type: 'column--item',
      },
    ],
  },
};
