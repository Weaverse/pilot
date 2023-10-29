import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseImage,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { Image } from '@shopify/hydrogen';
import {IconImageBlank} from '~/components';
import clsx from 'clsx';

interface PromotionItemProps extends HydrogenComponentProps {
  backgroundImage: WeaverseImage;
  subHeading: string;
  subHeadingSize: string;
  subHeadingColor: string;
  heading: string;
  headingSize: string;
  headingColor: string;
  descriptionText: string;
  descriptionSize: string;
  descriptionColor: string;
  buttonLabel1: string;
  buttonLink1: string;
  buttonLabel2: string;
  buttonLink2: string;
  openInNewTab: boolean;
  buttonStyle1: string;
  buttonStyle2: string;
}

let PromotionGridItem = forwardRef<HTMLDivElement, PromotionItemProps>((props, ref) => {
  let { backgroundImage, subHeading, subHeadingSize, subHeadingColor, heading, headingSize, headingColor, descriptionText, descriptionSize, descriptionColor, buttonLabel1, buttonLink1, buttonLabel2, buttonLink2, openInNewTab, buttonStyle1, buttonStyle2, ...rest } = props;
  return (
    <div ref={ref} {...rest} className='relative w-96 aspect-video' >
      <div className='absolute inset-0'>
        {backgroundImage ? <Image data={backgroundImage} loading='lazy' className='w-full h-full object-cover rounded-2xl' /> :
          <div className='w-full h-full flex justify-center items-center rounded-2xl bg-black bg-opacity-5'>
            <IconImageBlank viewBox="0 0 100 101" className='!w-24 !h-24 opacity-20' />
          </div>}
      </div>
      <div className='relative flex flex-col items-center z-10 w-full py-10'>
        <div className='w-5/6 flex flex-col text-center items-center gap-5'>
          {subHeading && <p className='font-normal' style={{fontSize: subHeadingSize, color: subHeadingColor}}>{subHeading}</p>}
          {heading && <p className='font-medium' style={{fontSize: headingSize, color: headingColor}}>{heading}</p>}
          {descriptionText && <p className='text-sm font-normal' style={{fontSize: descriptionSize, color: descriptionColor}}>{descriptionText}</p>}
          <div className='flex gap-3 mt-3'>
            {buttonLabel1 && <a href={buttonLink1} target={openInNewTab ? '_blank' : ''} className={clsx('px-4 py-3 w-fit cursor-pointer rounded inline-block', buttonStyle1)}>{buttonLabel1}</a>}
            {buttonLabel2 && <a href={buttonLink2} target={openInNewTab ? '_blank' : ''} className={clsx('px-4 py-3 w-fit cursor-pointer rounded inline-block', buttonStyle2)}>{buttonLabel2}</a>}
          </div>
        </div>
      </div>
    </div>
  );
});

export default PromotionGridItem;

export let schema: HydrogenComponentSchema = {
  type: 'promotion-item',
  title: 'Promotion item',
  inspector: [
    {
      group: 'Promotion item',
      inputs: [
        {
          type: 'image',
          name: 'backgroundImage',
          label: 'Background image',
        },
        {
          type: 'text',
          name: 'subHeading',
          label: 'Subheading',
          defaultValue: 'Subheading',
          placeholder: 'Subheading',
        },
        {
          type: 'toggle-group',
          label: 'Subheading size',
          name: 'subHeadingSize',
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
          name: 'subHeadingColor',
          label: 'Subheading color',
          defaultValue: '#333333',
        },
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Heading for Image',
          placeholder: 'Heading for image section',
        },
        {
          type: 'toggle-group',
          label: 'Heading size',
          name: 'headingSize',
          configs: {
            options: [
              { label: 'XS', value: '22px' },
              { label: 'S', value: '24px' },
              { label: 'M', value: '26px' },
              { label: 'L', value: '28px' },
              { label: 'XL', value: '30px' },
            ],
          },
          defaultValue: '24px',
        },
        {
          type: 'color',
          name: 'headingColor',
          label: 'Heading color',
          defaultValue: '#333333',
        },
        {
          type: 'textarea',
          name: 'descriptionText',
          label: 'Text',
          defaultValue: 'Include the smaller details of your promotion in text below the title.',
        },
        {
          type: 'toggle-group',
          label: 'Description size',
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
        {
          type: 'text',
          name: 'buttonLabel1',
          label: 'Button label 1',
          defaultValue: 'Button',
        },
        {
          type: 'text',
          name: 'buttonLink1',
          label: 'Button #1 link',
          placeholder: 'https://',
        },
        {
          type: 'text',
          name: 'buttonLabel2',
          label: 'Button label 2',
          defaultValue: 'Button',
        },
        {
          type: 'text',
          name: 'buttonLink2',
          label: 'Button #2 link',
          placeholder: 'https://',
        },
        {
          type: 'switch',
          name: 'openInNewTab',
          label: 'Open in new tab',
          defaultValue: true,
        },
        {
          type: 'toggle-group',
          label: 'Button style #1',
          name: 'buttonStyle1',
          configs: {
            options: [
              { label: '1', value: 'transition hover:bg-white border-2 border-solid hover:border-gray-900 hover:text-black bg-black text-white' },
              { label: '2', value: 'transition bg-white border-2 border-solid border-gray-900 text-black hover:bg-black hover:text-white' },
              { label: '3', value: 'transition hover:bg-white border-2 border-solid border-white hover:text-black bg-gray-200 text-white' },
            ],
          },
          defaultValue: 'transition hover:bg-white border-2 border-solid hover:border-gray-900 hover:text-black bg-black text-white',
        },
        {
          type: 'toggle-group',
          label: 'Button style #2',
          name: 'buttonStyle2',
          configs: {
            options: [
              { label: '1', value: 'transition hover:bg-white border-2 border-solid hover:border-gray-900 hover:text-black bg-black text-white' },
              { label: '2', value: 'transition bg-white border-2 border-solid border-gray-900 text-black hover:bg-black hover:text-white' },
              { label: '3', value: 'transition hover:bg-white border-2 border-solid border-white hover:text-black bg-gray-200 text-white' },
            ],
          },
          defaultValue: 'transition hover:bg-white border-2 border-solid hover:border-gray-900 hover:text-black bg-black text-white',
        },
      ],
    },
  ],
};
