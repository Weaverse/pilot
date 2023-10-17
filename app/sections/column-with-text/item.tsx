import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { Image } from '@shopify/hydrogen';
import clsx from 'clsx';
import { CSSProperties } from 'react';


interface ContentColumnItemProps extends HydrogenComponentProps {
  imageSrc: {
    url: string;
    altText: string;
    width?: number;
    height?: number;
  };
  titleText: string;
  contentAlignment: string;
  descriptionText: string;
  buttonLabel: string;
  buttonLink: string;
  hideOnMobile: boolean;
}

let ContentColumnItem = forwardRef<HTMLDivElement, ContentColumnItemProps>((props, ref) => {
  let { imageSrc, titleText, contentAlignment, descriptionText, buttonLabel, buttonLink, hideOnMobile, ...rest } = props;
  let contentStyle: CSSProperties = {
    textAlign: `${contentAlignment}`,
  } as CSSProperties;
  return (
    <div ref={ref} {...rest} className={clsx(
      'flex flex-col items-center pt-8 sm-max:w-full sm-max:pt-0',
      hideOnMobile && 'hidden sm:block',
      )}>
      <div className='h-64 w-64 border border-solid border-gray-500 rounded-md'>
        <Image data={imageSrc} className='w-full h-full' />
      </div>
      <div className='text-center w-full sm-max:w-64' style={contentStyle}>
        {titleText && <p className='font-sans font-semibold mt-4 text-sm'>{titleText}</p>}
        {descriptionText && <p className='font-sans text-sm font-normal mt-2' dangerouslySetInnerHTML={{ __html: descriptionText }}></p>}
        {buttonLabel && <a href={buttonLink} className='px-4 py-3 mt-4 cursor-pointer rounded border-2 border-solid border-gray-900 inline-block'>{buttonLabel}</a>}
      </div>
    </div>
  );
});

export default ContentColumnItem;

export let schema: HydrogenComponentSchema = {
  type: 'column--item',
  title: 'Column item',
  inspector: [
    {
      group: 'Column',
      inputs: [
        {
          type: 'image',
          name: 'imageSrc',
          label: 'Image',
          defaultValue: {
            id: 'image-placeholder',
            url: 'https://cdn.shopify.com/s/files/1/0728/0410/6547/files/pilot-image-placeholder.svg',
            alt: 'Image index',
            width: 0,
            height: 0,
          },
        },
        {
          type: 'text',
          name: 'titleText',
          label: 'Title',
          placeholder: 'Item title',
          defaultValue: 'Item title',
        },
        {
          type: 'toggle-group',
          label: 'Content alignment',
          name: 'contentAlignment',
          configs: {
            options: [
              { label: 'Left', value: 'left' },
              { label: 'Center', value: 'center' },
              { label: 'Right', value: 'right' },
            ],
          },
          defaultValue: 'center',
        },
        {
          type: 'richtext',
          label: 'Text',
          name: 'descriptionText',
          placeholder: 'Brief description',
          defaultValue: 'Brief description',
        },
        {
          type: 'text',
          label: 'Button label',
          name: 'buttonLabel',
          placeholder: 'Button label',
          defaultValue: 'Optional button',
        },
        {
          type: 'text',
          label: 'Button link',
          name: 'buttonLink',
          placeholder: 'Button link',
        },
        {
          type: 'switch',
          label: 'Hide on Mobile',
          name: 'hideOnMobile',
          defaultValue: false,
        },
      ],
    },
  ],
};
