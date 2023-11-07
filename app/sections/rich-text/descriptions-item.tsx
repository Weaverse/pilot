import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';

interface DescriptionItemProps extends HydrogenComponentProps {
  descriptionText: string;
}

let RichTextDescriptionItem = forwardRef<HTMLParagraphElement, DescriptionItemProps>((props, ref) => {
  let { descriptionText, ...rest } = props;
  return (
    <p ref={ref} {...rest} className='font-sans text-sm font-normal text-[var(--text-color)]' dangerouslySetInnerHTML={{ __html: descriptionText }}></p>
  );
});

export default RichTextDescriptionItem;

export let schema: HydrogenComponentSchema = {
  type: 'rich-text-description--item',
  title: 'Description item',
  inspector: [
    {
      group: 'Description',
      inputs: [
        {
          type: 'richtext',
          label: 'Text',
          name: 'descriptionText',
          defaultValue: 'Pair large text with an image to tell a story, explain a detail about your product, or describe a new promotion.',
        },
      ],
    },
  ],
};
