import {
  type HydrogenComponentProps,
  type HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

interface ColumnsWithImagesItemsProps extends HydrogenComponentProps {
  gap: number;
}

let ColumnsWithImagesItems = forwardRef<
  HTMLDivElement,
  ColumnsWithImagesItemsProps
>((props, ref) => {
  let {children, gap, ...rest} = props;

  return (
    <div
      ref={ref}
      {...rest}
      className="flex flex-col sm:grid sm:grid-cols-12"
      style={{gap: `${gap}px`}}
    >
      {children}
    </div>
  );
});

export default ColumnsWithImagesItems;

export let schema: HydrogenComponentSchema = {
  type: 'columns-with-images--items',
  title: 'Items',
  inspector: [
    {
      group: 'Items',
      inputs: [
        {
          type: 'range',
          label: 'Items gap',
          name: 'gap',
          configs: {
            min: 16,
            max: 40,
            step: 6,
            unit: 'px',
          },
          defaultValue: 24,
        },
      ],
    },
  ],
  childTypes: ['column-with-image--item'],
  toolbar: ['general-settings', ['duplicate', 'delete']],
  presets: {
    children: [
      {
        type: 'column-with-image--item',
        imageSrc:
          'https://cdn.shopify.com/s/files/1/0838/0052/3057/files/h2-placeholder-image.svg',
      },
      {
        type: 'column-with-image--item',
        imageSrc:
          'https://cdn.shopify.com/s/files/1/0838/0052/3057/files/h2-placeholder-image.svg',
      },
      {
        type: 'column-with-image--item',
        imageSrc:
          'https://cdn.shopify.com/s/files/1/0838/0052/3057/files/h2-placeholder-image.svg',
      },
    ],
  },
};
