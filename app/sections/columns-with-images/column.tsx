import {Image} from '@shopify/hydrogen';
import {
  type HydrogenComponentProps,
  type HydrogenComponentSchema,
  type WeaverseImage,
} from '@weaverse/hydrogen';
import clsx from 'clsx';
import {forwardRef} from 'react';

interface ColumnWithImageItemProps extends HydrogenComponentProps {
  imageSrc: WeaverseImage;
  heading: string;
  text: string;
  buttonLabel: string;
  buttonLink: string;
  openInNewTab: boolean;
  buttonStyle: string;
  hideOnMobile: boolean;
}

let FALLBACK_IMAGE =
  'https://cdn.shopify.com/s/files/1/0838/0052/3057/files/h2-placeholder-image.svg';

let ColumnWithImageItem = forwardRef<HTMLDivElement, ColumnWithImageItemProps>(
  (props, ref) => {
    let {
      imageSrc,
      heading,
      text,
      buttonLabel,
      buttonLink,
      openInNewTab,
      buttonStyle,
      hideOnMobile,
      ...rest
    } = props;

    let imageData =
      typeof imageSrc === 'object'
        ? imageSrc
        : {url: imageSrc || FALLBACK_IMAGE, altText: imageSrc};
    return (
      <div
        ref={ref}
        {...rest}
        className={clsx(
          {
            'col-span-6':
              childCount === 1 ||
              childCount === 2 ||
              childCount === 4 ||
              (childCount === 5 && itemIndex < 3),
            'col-span-4':
              childCount === 3 ||
              (childCount === 5 && itemIndex >= 3) ||
              childCount > 5,
          },
          hideOnMobile && 'hidden sm:block',
        )}
      >
        <Image
          data={imageData}
          sizes="auto"
          className="h-72 object-cover object-center w-full rounded-lg"
        />
        <div className="text-center w-full sm-max:w-64">
          {heading && (
            <p className="text-[var(--text-color)] font-normal mt-4 text-sm">
              {heading}
            </p>
          )}
          {text && (
            <p className="text-sm font-normal mt-2 text-[var(--text-color)]">
              {text}
            </p>
          )}
          {buttonLabel && (
            <a
              href={buttonLink}
              target={openInNewTab ? '_blank' : ''}
              className={clsx(
                'px-4 py-3 mt-4 cursor-pointer rounded inline-block',
                buttonStyle,
              )}
              rel="noreferrer"
            >
              {buttonLabel}
            </a>
          )}
        </div>
      </div>
    );
  },
);

export default ColumnWithImageItem;

export let schema: HydrogenComponentSchema = {
  type: 'column-with-image--item',
  title: 'Column',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Column',
      inputs: [
        {
          type: 'image',
          name: 'imageSrc',
          label: 'Image',
        },
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          placeholder: 'Example heading',
          defaultValue: 'Example heading',
        },

        {
          type: 'richtext',
          label: 'Text',
          name: 'text',
          placeholder:
            'Use this section to promote content throughout every page of your site. Add images for further impact.',
          defaultValue:
            'Use this section to promote content throughout every page of your site. Add images for further impact.',
        },
        {
          type: 'text',
          label: 'Button label',
          name: 'buttonLabel',
          placeholder: 'Button label',
          defaultValue: 'Optional button',
        },
        {
          type: 'toggle-group',
          label: 'Button style',
          name: 'buttonStyle',
          configs: {
            options: [
              {
                label: '1',
                value:
                  'transition hover:bg-white border-2 border-solid hover:border-gray-900 hover:text-black bg-black text-white',
              },
              {
                label: '2',
                value:
                  'transition bg-white border-2 border-solid border-gray-900 text-black hover:bg-black hover:text-white',
              },
              {
                label: '3',
                value:
                  'transition hover:bg-white border-2 border-solid border-white hover:text-black bg-gray-200 text-white',
              },
            ],
          },
          defaultValue:
            'transition hover:bg-white border-2 border-solid hover:border-gray-900 hover:text-black bg-black text-white',
        },
        {
          type: 'text',
          label: 'Button link',
          name: 'buttonLink',
          placeholder: 'Button link',
        },
        {
          type: 'switch',
          name: 'openInNewTab',
          label: 'Open link in new tab',
          defaultValue: true,
          condition: 'buttonLink.ne.nil',
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
  presets: {
    imageSrc:
      'https://cdn.shopify.com/s/files/1/0838/0052/3057/files/h2-placeholder-image.svg',
    children: [
      {
        type: 'button',
      },
    ],
  },
};
