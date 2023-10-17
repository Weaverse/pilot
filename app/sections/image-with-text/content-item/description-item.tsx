import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';


interface DescriptionItemProps extends HydrogenComponentProps {
  descriptionText: string;
}

let ImageWTextDescriptionItem = forwardRef<HTMLDivElement, DescriptionItemProps>((props, ref) => {
  let { descriptionText, ...rest } = props;
  return (
    <div ref={ref} {...rest}>
      <p className='text-sm font-sans font-normal mb-5 leading-6 sm-max:w-full'>{descriptionText}</p>
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
      ],
    }
  ],
};
