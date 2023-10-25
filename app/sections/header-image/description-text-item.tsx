import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

interface DescriptionTextItemProps extends HydrogenComponentProps {
  descriptionText: string;
}

let DescriptionTextItem = forwardRef<HTMLDivElement, DescriptionTextItemProps>(
  (props, ref) => {
    let {descriptionText, ...rest} = props;
    return (
      <div ref={ref} {...rest}>
        <p
          className="font-sans mb-5 font-normal leading-6"
          dangerouslySetInnerHTML={{__html: descriptionText}}
        ></p>
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
          type: 'richtext',
          label: 'Text',
          name: 'descriptionText',
          defaultValue: 'Pair large text with an image to tell a story.',
        },
      ],
    },
  ],
};
