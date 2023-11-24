import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

interface HeadingItemProps extends HydrogenComponentProps {
  heading: string;
}

let RichTextHeadingItem = forwardRef<HTMLParagraphElement, HeadingItemProps>(
  (props, ref) => {
    let {heading, ...rest} = props;
    return (
      <p
        ref={ref}
        {...rest}
        className="text-2xl font-bold text-[var(--text-color)]"
      >
        {heading}
      </p>
    );
  },
);

export default RichTextHeadingItem;

export let schema: HydrogenComponentSchema = {
  type: 'rich-text-heading--item',
  title: 'Heading item',
  inspector: [
    {
      group: 'Heading',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Rich text',
          placeholder: 'Rich text',
        },
      ],
    },
  ],
};
