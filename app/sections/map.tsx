import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { CSSProperties } from 'react';


interface MapProps extends HydrogenComponentProps {
  heading: string;
  textColor: string;
  contentAlignment: string;
  descriptionText: string;
  address: string;
  buttonLabel: string;
  buttonLink: string;
  enableNewtab: boolean;
  sectionHeight: string;
}

let Map = forwardRef<HTMLElement, MapProps>((props, ref) => {
  let { heading, textColor, contentAlignment, descriptionText, address, buttonLabel, buttonLink, enableNewtab, sectionHeight, ...rest } = props;
  let sectionStyle: CSSProperties = {
    '--section-height': `${sectionHeight}px`,
    justifyContent: `${contentAlignment}`,
  } as CSSProperties;

  return (
    <section ref={ref} {...rest} className='flex relative p-10 overflow-hidden h-[var(--section-height)]' style={sectionStyle}>
      <div className='absolute inset-0'>
        {address ? <iframe className='w-full h-full object-cover' title="map" src={`https://maps.google.com/maps?t=m&q=${address}&ie=UTF8&&output=embed`}></iframe> :
        <div className='absolute inset-0 flex items-center justify-center bg-gray-200'>
          <svg xmlns="http://www.w3.org/2000/svg" width="230" height="230" viewBox="0 0 230 230" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M171.168 30.3128C171.673 30.4812 172.184 30.6519 172.702 30.8246L184.222 34.6645C188.66 36.1436 192.55 37.44 195.636 38.8757C198.972 40.4278 202.03 42.427 204.367 45.67C206.705 48.913 207.635 52.4459 208.052 56.1018C208.438 59.4836 208.438 63.5839 208.438 68.2621V146.966C208.438 153.66 208.438 159.305 207.919 163.767C207.38 168.403 206.172 172.987 202.793 176.684C200.789 178.877 198.354 180.633 195.64 181.84C191.064 183.876 186.333 183.573 181.764 182.618C177.367 181.699 172.012 179.914 165.662 177.797L165.253 177.661C154.514 174.082 150.835 172.966 147.262 173.088C145.839 173.137 144.424 173.326 143.038 173.654C139.559 174.476 136.302 176.52 126.884 182.799L113.636 191.631C113.182 191.934 112.733 192.234 112.291 192.529C102.118 199.319 95.0431 204.041 86.7721 205.149C78.501 206.256 70.4327 203.562 58.8317 199.688C58.3272 199.519 57.8161 199.349 57.298 199.176L45.778 195.336C41.3399 193.857 37.45 192.561 34.3639 191.125C31.0276 189.573 27.9701 187.574 25.6326 184.331C23.2952 181.088 22.3655 177.555 21.9481 173.899C21.562 170.517 21.5622 166.417 21.5625 161.739L21.5625 83.0345C21.5623 76.3411 21.5621 70.6961 22.081 66.2335C22.6201 61.5972 23.8285 57.0138 27.2067 53.3164C29.2107 51.1233 31.6462 49.3678 34.3605 48.1603C38.9364 46.1246 43.6667 46.4276 48.2356 47.3823C52.6333 48.3012 57.9885 50.0865 64.3383 52.2034L64.7468 52.3396C75.4856 55.9191 79.1654 57.0343 82.7378 56.9124C84.1612 56.8638 85.5762 56.6743 86.9622 56.3466C90.4409 55.5243 93.6976 53.4802 103.116 47.2012L116.364 38.3693C116.818 38.0664 117.267 37.7672 117.709 37.4719C127.882 30.6819 134.957 25.9595 143.228 24.8519C151.499 23.7442 159.567 26.4386 171.168 30.3128ZM150.938 39.344V158.885C156.071 159.441 161.477 161.246 168.6 163.624C168.994 163.755 169.394 163.889 169.799 164.024C176.667 166.313 181.224 167.82 184.705 168.547C188.109 169.258 189.276 168.938 189.797 168.706C190.701 168.304 191.513 167.719 192.181 166.988C192.566 166.567 193.239 165.561 193.64 162.107C194.051 158.575 194.063 153.775 194.063 146.536V68.6388C194.063 63.4727 194.052 60.2017 193.77 57.7323C193.509 55.4466 193.082 54.5968 192.706 54.0752C192.33 53.5536 191.659 52.8798 189.573 51.9094C187.319 50.8611 184.22 49.8164 179.319 48.1828L168.156 44.462C159.662 41.6306 154.623 40.0195 150.938 39.344ZM136.563 160.613V42.4867C133.58 44.21 129.755 46.7184 124.338 50.3301L111.09 59.1619C110.735 59.3988 110.384 59.6325 110.039 59.8633C103.443 64.2647 98.5258 67.5457 93.4375 69.3874V187.514C96.42 185.791 100.245 183.282 105.662 179.671L118.91 170.839C119.265 170.602 119.616 170.368 119.961 170.137C126.557 165.736 131.474 162.455 136.563 160.613ZM79.0625 190.657V71.1158C73.9288 70.5593 68.5228 68.7547 61.3997 66.3769C61.0055 66.2452 60.606 66.1119 60.201 65.9769C53.3332 63.6876 48.7762 62.1808 45.2953 61.4534C41.8916 60.7422 40.7244 61.0625 40.2035 61.2942C39.2987 61.6967 38.4869 62.2819 37.8189 63.0129C37.4344 63.4338 36.7614 64.4398 36.3598 67.8938C35.9491 71.4261 35.9375 76.2257 35.9375 83.465V161.362C35.9375 166.528 35.9484 169.799 36.2303 172.268C36.4913 174.554 36.9183 175.404 37.2942 175.925C37.6702 176.447 38.3413 177.121 40.4272 178.091C42.6807 179.14 45.7804 180.184 50.6814 181.818L61.8437 185.539C70.3379 188.37 75.3774 189.981 79.0625 190.657Z" fill="#0F0F0F" fill-opacity="0.05" />
          </svg>
        </div>}
      </div>
      <div className='relative bg-white rounded-3xl p-8 border-2 border-solid border-gray-200 h-fit w-80'>
        <div className='z-10 flex flex-col gap-6'>
          {heading && <p className='font-sans text-2xl font-bold' style={{ color: textColor }}>{heading}</p>}
          {address && <p className='font-sans text-sm font-normal' style={{ color: textColor }}>{address}</p>}
          {descriptionText && <p className='font-sans text-sm font-normal' style={{ color: textColor }}>{descriptionText}</p>}
          {buttonLabel && <a href={buttonLink} target={enableNewtab ? '_blank' : ''} className='px-4 py-3 w-fit cursor-pointer rounded border-2 border-solid border-gray-900 inline-block'>{buttonLabel}</a>}
        </div>
      </div>
    </section>
  );
});

export default Map;

export let schema: HydrogenComponentSchema = {
  type: 'map',
  title: 'Map',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Map',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Our store address',
        },
        {
          type: 'color',
          name: 'textColor',
          label: 'Text color',
          defaultValue: '#333333',
        },
        {
          type: 'toggle-group',
          label: 'Content alignment',
          name: 'contentAlignment',
          configs: {
            options: [
              { label: 'Left', value: 'flex-start' },
              { label: 'Center', value: 'center' },
              { label: 'Right', value: 'flex-end' },
            ],
          },
          defaultValue: 'center',
        },
        {
          type: 'map-autocomplete',
          name: 'address',
          label: 'Map address',
          defaultValue: 'San Francisco, CA',
        },
        {
          type: 'textarea',
          label: 'Description text',
          name: 'descriptionText',
          defaultValue: 'Pair large text with an image to tell a story, explain a detail about your product, or describe a new promotion.',
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
          name: 'enableNewtab',
          label: 'Open in new tab',
          defaultValue: true,
        },
        {
          type: 'toggle-group',
          label: 'Button style',
          name: 'buttonStyle',
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
          type: 'range',
          name: 'sectionHeight',
          label: 'Section height',
          defaultValue: 500,
          configs: {
            min: 400,
            max: 900,
            step: 10,
            unit: 'px',
          },
        },
      ],
    },
  ],
};
