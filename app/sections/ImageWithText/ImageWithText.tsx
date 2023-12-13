import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import type { CSSProperties } from 'react';
import { forwardRef  } from 'react';
import { clsx } from 'clsx';

type AlignImage = 'left' | 'right';
interface ImageWithTextProps extends HydrogenComponentProps {
  sectionHeight: number;
  backgroundColor: string;
  imageAlignment?: AlignImage;
}

let AlignImageClasses: Record<AlignImage, string> = {
  left: 'flex-row-reverse',
  right: 'flex-row',
};

let ImageWithText = forwardRef<HTMLElement, ImageWithTextProps>((props, ref) => {
  let { imageAlignment, sectionHeight, backgroundColor, children, ...rest } = props;
  let styleSection: CSSProperties = {
    '--section-height': `${sectionHeight}px`,
    backgroundColor: backgroundColor,
  } as CSSProperties;

  return (
    <section ref={ref} {...rest} style={styleSection} className='h-[var(--section-height)] sm-max:h-auto sm-max:overflow-hidden'>
      <div className='h-full px-10 sm-max:px-6 sm-max:w-full'>
        <div className={clsx('flex justify-center items-center gap-5 h-full w-full sm-max:flex-col', AlignImageClasses[imageAlignment!] )}>
          {children}
        </div>
      </div>
    </section>
  );
});

export default ImageWithText;

export let schema: HydrogenComponentSchema = {
  type: 'image-with-text',
  title: 'Image with text',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Image',
      inputs: [
        {
          type: 'toggle-group',
          label: 'Image alignment',
          name: 'imageAlignment',
          configs: {
            options: [
              { label: 'Left', value: 'left', icon: 'AlignLeft' },
              { label: 'Right', value: 'right', icon: 'AlignRight' },
            ],
          },
          defaultValue: 'left',
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
        {
          type: 'color',
          name: 'backgroundColor',
          label: 'Background color',
          defaultValue: '#f4f4f4',
        },
      ],
    },
  ],
  childTypes: ['content-items', 'image-items'],
  presets: {
    children: [
      {
        type: 'content-items',
      },
      {
        type: 'image-items',
      },
    ],
  },
};
