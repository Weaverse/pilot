import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { Image } from '@shopify/hydrogen';
import { CSSProperties } from 'react';

interface PromotionItemProps extends HydrogenComponentProps {
  backgroundImage: {
    url: string;
    altText: string;
    width?: number;
    height?: number;
  };
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
  enableNewtab: boolean;
}

let PromotionGridItem = forwardRef<HTMLDivElement, PromotionItemProps>((props, ref) => {
  let { backgroundImage, subHeading, subHeadingSize, subHeadingColor, heading, headingSize, headingColor, descriptionText, descriptionSize, descriptionColor, buttonLabel1, buttonLink1, buttonLabel2, buttonLink2, enableNewtab, ...rest } = props;
  return (
    <div ref={ref} {...rest} className='relative w-96 aspect-video' >
      <div className='absolute inset-0'>
        {backgroundImage ? <Image data={backgroundImage} loading='lazy' className='w-full h-full object-cover rounded-2xl' /> :
          <div className='w-full h-full flex justify-center items-center rounded-2xl bg-black bg-opacity-5'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" className='w-24 h-24 text-white'>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M68.1818 26.1365C65.0438 26.1365 62.5 28.6803 62.5 31.8183C62.5 34.9563 65.0438 37.5001 68.1818 37.5001C71.3198 37.5001 73.8636 34.9563 73.8636 31.8183C73.8636 28.6803 71.3198 26.1365 68.1818 26.1365ZM55.6818 31.8183C55.6818 24.9147 61.2782 19.3183 68.1818 19.3183C75.0854 19.3183 80.6818 24.9147 80.6818 31.8183C80.6818 38.7218 75.0854 44.3183 68.1818 44.3183C61.2782 44.3183 55.6818 38.7218 55.6818 31.8183Z" fill="#0F0F0F" fill-opacity="0.05" />
              <path fill-rule="evenodd" clip-rule="evenodd" d="M49.7392 1.13648H50.2608C60.7535 1.13642 68.9764 1.13637 75.3922 1.99896C81.9592 2.88187 87.1411 4.72432 91.2084 8.79164C95.2758 12.859 97.1182 18.0409 98.0011 24.6079C98.8637 31.0237 98.8637 39.2466 98.8636 49.7393V50.2609C98.8637 60.7536 98.8637 68.9765 98.0011 75.3923C97.1182 81.9593 95.2758 87.1413 91.2084 91.2086C87.1411 95.2759 81.9592 97.1183 75.3922 98.0012C68.9764 98.8638 60.7535 98.8638 50.2608 98.8637H49.7392C39.2465 98.8638 31.0236 98.8638 24.6077 98.0012C18.0408 97.1183 12.8588 95.2759 8.79152 91.2086C4.7242 87.1413 2.88174 81.9593 1.99884 75.3923C1.13625 68.9765 1.13629 60.7536 1.13635 50.2609V49.7393C1.13629 39.2466 1.13625 31.0237 1.99884 24.6079C2.88174 18.0409 4.7242 12.859 8.79152 8.79164C12.8588 4.72432 18.0408 2.88187 24.6077 1.99896C31.0236 1.13637 39.2465 1.13642 49.7392 1.13648ZM13.6127 86.3874C11.0234 83.798 9.53748 80.2948 8.75622 74.4838C8.05859 69.295 7.96799 62.6752 7.95627 53.8189L14.7521 47.8726C17.5435 45.4301 21.7506 45.5702 24.3734 48.193L43.8722 67.6917C48.1674 71.9869 54.9286 72.5725 59.8984 69.0799L61.2538 68.1273C65.1546 65.3858 70.4322 65.7035 73.9761 68.893L88.6285 82.0801C88.788 82.2236 88.9572 82.3493 89.1339 82.4573C88.3992 84.0069 87.494 85.2806 86.3873 86.3874C83.7979 88.9767 80.2946 90.4626 74.4837 91.2439C68.5747 92.0383 60.8101 92.0455 50 92.0455C39.1899 92.0455 31.4252 92.0383 25.5162 91.2439C19.7053 90.4626 16.202 88.9767 13.6127 86.3874ZM25.5162 8.75634C19.7053 9.5376 16.202 11.0235 13.6127 13.6128C11.0234 16.2022 9.53748 19.7054 8.75622 25.5164C8.09652 30.4232 7.97964 36.6095 7.95897 44.7568L10.2623 42.7414C15.7551 37.9352 24.0337 38.2108 29.1946 43.3718L48.6933 62.8705C50.6457 64.8229 53.719 65.0891 55.978 63.5015L57.3334 62.5489C63.8348 57.9799 72.6308 58.5092 78.5372 63.825L91.1461 75.1731C91.1798 74.947 91.2124 74.7173 91.2437 74.4838C92.0382 68.5748 92.0454 60.8102 92.0454 50.0001C92.0454 39.19 92.0382 31.4254 91.2437 25.5164C90.4625 19.7054 88.9766 16.2022 86.3873 13.6128C83.7979 11.0235 80.2946 9.5376 74.4837 8.75634C68.5747 7.9619 60.8101 7.95466 50 7.95466C39.1899 7.95466 31.4252 7.9619 25.5162 8.75634Z" fill="#0F0F0F" fill-opacity="0.05" />
            </svg>
          </div>}
      </div>
      <div className='relative flex flex-col items-center z-10 w-full py-10'>
        <div className='w-5/6 flex flex-col text-center items-center gap-5'>
          {subHeading && <p className='font-normal' style={{fontSize: subHeadingSize, color: subHeadingColor}}>{subHeading}</p>}
          {heading && <p className='font-medium' style={{fontSize: headingSize, color: headingColor}}>{heading}</p>}
          {descriptionText && <p className='text-sm font-normal' style={{fontSize: descriptionSize, color: descriptionColor}}>{descriptionText}</p>}
          <div className='flex gap-3 mt-3'>
            {buttonLabel1 && <a href={buttonLink1} target={enableNewtab ? '_blank' : ''} className='px-4 py-3 w-fit cursor-pointer rounded border-2 border-solid border-gray-900 inline-block'>{buttonLabel1}</a>}
            {buttonLabel2 && <a href={buttonLink2} target={enableNewtab ? '_blank' : ''} className='px-4 py-3 w-fit cursor-pointer rounded border-2 border-solid border-gray-900 inline-block'>{buttonLabel2}</a>}
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
          name: 'enableNewtab',
          label: 'Open in new tab',
          defaultValue: true,
        },
        {
          type: 'toggle-group',
          label: 'Button #1 style',
          name: 'buttonStyle1',
          configs: {
            options: [
              { label: '1', value: '1' },
              { label: '2', value: '2' },
              { label: '3', value: '3' },
            ],
          },
          defaultValue: '1',
        },
        {
          type: 'toggle-group',
          label: 'Button #2 style',
          name: 'buttonStyle2',
          configs: {
            options: [
              { label: '1', value: '1' },
              { label: '2', value: '2' },
              { label: '3', value: '3' },
            ],
          },
          defaultValue: '1',
        },
      ],
    },
  ],
};
