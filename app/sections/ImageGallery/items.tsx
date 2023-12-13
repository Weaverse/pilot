import {
  type HydrogenComponentProps,
  type HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

interface ImageGalleyItemsProps extends HydrogenComponentProps {
  gap: number;
}

let ImageGalleyItems = forwardRef<HTMLDivElement, ImageGalleyItemsProps>(
  (props, ref) => {
    let {children, gap, ...rest} = props;

    return (
      <div
        ref={ref}
        {...rest}
        className="flex flex-col mt-8 sm:grid sm:grid-cols-4 sm:mt-12"
        style={{gap: `${gap}px`}}
      >
        {children}
      </div>
    );
  },
);

export default ImageGalleyItems;

export let schema: HydrogenComponentSchema = {
  type: 'image-gallery--items',
  title: 'Items',
  inspector: [
    {
      group: 'Image',
      inputs: [
        {
          type: 'range',
          label: 'Gap',
          name: 'gap',
          configs: {
            min: 16,
            max: 40,
            step: 6,
          },
          defaultValue: 16,
        },
      ],
    },
  ],
  childTypes: ['image-gallery--item'],
  toolbar: ['general-settings', ['duplicate', 'delete']],
  presets: {
    children: [
      {
        type: 'image-gallery--item',
        columnSpan: 2,
        src: 'https://cdn.shopify.com/s/files/1/0728/0410/6547/files/wv-hand-placed-on-the-iridescent-keys-of-a-small-piano.jpg?v=1694236467',
      },
      {
        type: 'image-gallery--item',
        hideOnMobile: true,
        src: 'https://cdn.shopify.com/s/files/1/0728/0410/6547/files/wv-open-novel-with-a-hand-on-it-by-dried-flowers.jpg?v=1694236467',
      },
      {
        type: 'image-gallery--item',
        hideOnMobile: true,
        src: 'https://cdn.shopify.com/s/files/1/0728/0410/6547/files/wv-creamy-cold-drink-sits-on-a-wooden-table.jpg?v=1694236467',
      },
      {
        type: 'image-gallery--item',
        hideOnMobile: true,
        src: 'https://cdn.shopify.com/s/files/1/0728/0410/6547/files/wv-hands-reach-to-feed-a-flying-seagull.jpg?v=1694236467',
      },
      {
        type: 'image-gallery--item',
        hideOnMobile: true,
        src: 'https://cdn.shopify.com/s/files/1/0728/0410/6547/files/wv-nati-melnychuk-5ngCICAXiH0-unsplash.jpg?v=1694231122',
      },
      {
        type: 'image-gallery--item',
        columnSpan: 2,
        src: 'https://cdn.shopify.com/s/files/1/0728/0410/6547/files/wv-flatlay-of-a-coffee-mug-and-items-to-plan-travel.jpg?v=1694236467',
      },
    ],
  },
};
