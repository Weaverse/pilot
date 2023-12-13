import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef, CSSProperties } from 'react';

interface ContentItemsProps extends HydrogenComponentProps {
  gap: number;
}

let ContentItems = forwardRef<HTMLDivElement, ContentItemsProps>((props, ref) => {
  let { children, gap, ...rest } = props;
  let style = {
    gap: `${gap}px`,
    textAlign: 'left',
  } as CSSProperties;
  return (
    <div ref={ref} {...rest} className='w-1/2 flex flex-col justify-center gap-5 p-16 sm-max:w-full sm-max:pt-0 sm-max:px-0 sm-max:pb-10' style={style}>
      {children}
    </div>
  );
});

export default ContentItems;

export let schema: HydrogenComponentSchema = {
  type: 'content-items',
  title: 'Content',
  limit: 1,
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Content',
      inputs: [
        {
          type: 'range',
          name: 'gap',
          label: 'Items gap',
          configs: {
            min: 0,
            max: 40,
            step: 4,
            unit: 'px',
          },
          defaultValue: 20,
        },
      ],
    },
  ],
  childTypes: ['subheading', 'heading', 'description', 'button'],
  presets: {
    children: [
      {
        type: 'subheading',
        content: 'Subheading',
      },
      {
        type: 'heading',
        content: 'Heading for image',
      },
      {
        type: 'description',
        content: 'Pair large text with an image to tell a story.',
      },
      {
        type: 'button',
        content: 'Button section',
      },
    ],
  },
};
