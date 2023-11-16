import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

interface DescriptionTextItemProps extends HydrogenComponentProps {
  descriptionText: string;
  descriptionSize: string;
  descriptionColor: string;
}

let DescriptionTextItem = forwardRef<HTMLDivElement, DescriptionTextItemProps>(
  (props, ref) => {
    let {descriptionText, descriptionSize, descriptionColor, ...rest} = props;
    return (
      <div ref={ref} {...rest}>
        <p style={{fontSize: descriptionSize, color: descriptionColor}}
          className="font-normal"
        >{descriptionText}</p>
      </div>
    );
  },
);

export default DescriptionTextItem;

export let schema: HydrogenComponentSchema = {
  type: 'description-text--item',
  title: 'Descripttion text item',
  inspector: [
    {
      group: 'Description text',
      inputs: [
        {
          type: 'textarea',
          label: 'Text',
          name: 'descriptionText',
          defaultValue: 'Pair large text with an image to tell a story.',
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
    },
  ],
};
