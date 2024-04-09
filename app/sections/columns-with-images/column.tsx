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
  size: 'large' | 'medium';
}

let sizeMap = {
  large: 'col-span-6',
  medium: 'col-span-4',
};

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
      size,
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
        className={clsx(hideOnMobile && 'hidden sm:block', sizeMap[size])}
      >
        <Image
          data={imageData}
          sizes="auto"
          className="h-72 object-cover object-center w-full rounded-lg"
        />
        <div className="text-center w-full sm-max:w-64">
          {heading && (
            <h3 className="text-[var(--text-color)] font-normal mt-4 text-sm">
              {heading}
            </h3>
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
          type: 'select',
          name: 'size',
          label: 'Size',
          configs: {
            options: [
              {
                label: 'Large',
                value: 'large',
              },
              {
                label: 'Medium',
                value: 'medium',
              },
            ],
          },
          defaultValue: 'medium',
        },
        {
          type: 'switch',
          label: 'Hide on Mobile',
          name: 'hideOnMobile',
          defaultValue: false,
        },
        {
          type: 'heading',
          label: 'Button (optional)',
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
                label: 'Primary',
                value: 'primary',
              },
              {
                label: 'Secondary',
                value: 'secondary',
              },
              {
                label: 'Subtle',
                value: 'subtle',
              },
            ],
          },
          defaultValue: 'secondary',
        },
        {
          type: 'url',
          label: 'Button link',
          name: 'buttonLink',
          placeholder: '/products',
          defaultValue: '/products',
        },
        {
          type: 'switch',
          name: 'openInNewTab',
          label: 'Open link in new tab',
          defaultValue: true,
          condition: 'buttonLink.ne.nil',
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
