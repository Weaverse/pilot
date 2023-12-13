import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseImage,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';
import {Image} from '@shopify/hydrogen';
import {IconImageBlank} from '~/components';

interface PromotionItemProps extends HydrogenComponentProps {
  backgroundImage: WeaverseImage;
}

let PromotionGridItem = forwardRef<HTMLDivElement, PromotionItemProps>(
  (props, ref) => {
    let {backgroundImage, children, ...rest} = props;
    return (
      <div ref={ref} {...rest} className="relative w-96 aspect-video">
        <div className="absolute inset-0">
          {backgroundImage ? (
            <Image
              data={backgroundImage}
              sizes="auto"
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <div className="w-full h-full flex justify-center items-center rounded-2xl bg-black bg-opacity-5">
              <IconImageBlank
                viewBox="0 0 100 101"
                className="!w-24 !h-24 opacity-20"
              />
            </div>
          )}
        </div>
        <div className="relative flex flex-col items-center z-10 w-full py-10">
          <div className="w-5/6 flex flex-col text-center items-center gap-5">
            {children}
          </div>
        </div>
      </div>
    );
  },
);

export default PromotionGridItem;

export let schema: HydrogenComponentSchema = {
  type: 'promotion-item',
  title: 'Promotion',
  inspector: [
    {
      group: 'Promotion',
      inputs: [
        {
          type: 'image',
          name: 'backgroundImage',
          label: 'Background image',
        },
      ],
    },
  ],
  childTypes: ['subheading', 'heading', 'description', 'promotion-buttons'],
  presets: {
    children: [
      {
        type: 'subheading',
        content: 'Subheading',
      },
      {
        type: 'heading',
        content: 'Heading for Image',
      },
      {
        type: 'description',
        content:
          'Include the smaller details of your promotion in text below the title.',
      },
      {
        type: 'promotion-buttons',
      },
    ],
  },
};
