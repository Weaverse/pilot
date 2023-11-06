import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { CSSProperties } from 'react';


interface DescriptionItemProps extends HydrogenComponentProps {
  descriptionText: string;
  descriptionSize: string;
  descriptionColor: string;
}

let ImageWTextDescriptionItem = forwardRef<HTMLDivElement, DescriptionItemProps>((props, ref) => {
  let { descriptionText, descriptionSize, descriptionColor, ...rest } = props;
  let styleDescription: CSSProperties = {
    fontSize: descriptionSize,
    color: descriptionColor,
  } as CSSProperties;
  return (
    <div ref={ref} {...rest}>
      <p className='font-normal sm-max:w-full' style={styleDescription}>{descriptionText}</p>
    </div>
  );
});

export default ImageWTextDescriptionItem;

export let schema: HydrogenComponentSchema = {
  type: 'Description--Item',
  title: 'Description item',
  limit: 1,
  inspector: [
    {
      group: 'Description',
      inputs: [
        {
          type: 'textarea',
          label: 'Text',
          name: 'descriptionText',
          defaultValue: 'Pair large text with an image to tell a story, explain a detail about your product, or describe a new promotion.',
        },
        {
          type: 'toggle-group',
          label: 'Text size',
          name: 'descriptionSize',
          configs: {
            options: [
              { label: 'XS', value: '14px' },
              { label: 'S', value: '16px' },
              { label: 'M', value: '18px' },
              { label: 'L', value: '20px' },
              { label: 'XL', value: '22px' },
            ],
          },
          defaultValue: '16px',
        },
        {
          type: 'color',
          name: 'descriptionColor',
          label: 'Description color',
          defaultValue: '#333333',
        },
      ],
    }
  ],
};
