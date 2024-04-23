import { Image } from '@shopify/hydrogen';
import {
  IMAGES_PLACEHOLDERS,
  type HydrogenComponentProps,
  type HydrogenComponentSchema,
  type WeaverseImage,
} from '@weaverse/hydrogen';
import clsx from 'clsx';
import { forwardRef } from 'react';
import Button, { ButtonProps, buttonInputs } from '../shared/Button';

interface ColumnWithImageItemProps extends ButtonProps, HydrogenComponentProps {
  imageSrc: WeaverseImage;
  heading: string;
  content: string;
  hideOnMobile: boolean;
  size: 'large' | 'medium';
}

let sizeMap = {
  large: 'col-span-6',
  medium: 'col-span-4',
};

let ColumnWithImageItem = forwardRef<HTMLDivElement, ColumnWithImageItemProps>(
  (props, ref) => {
    let {
      imageSrc,
      heading,
      content,
      text,
      link,
      variant,
      openInNewTab,
      hideOnMobile,
      size,
      ...rest
    } = props;

    let imageData =
      typeof imageSrc === 'object'
        ? imageSrc
        : { url: imageSrc || IMAGES_PLACEHOLDERS.image, altText: imageSrc };
    return (
      <div
        ref={ref}
        {...rest}
        className={clsx(hideOnMobile && 'hidden sm:block', sizeMap[size])}
      >
        <Image
          data={imageData}
          sizes="auto"
          className="aspect-square object-cover object-center w-full rounded-lg"
        />
        <div className="text-center w-full space-y-3 mt-6">
          {heading && <h3 className="font-medium">{heading}</h3>}
          {content && <p>{content}</p>}
          {text && <Button variant={variant} text={text} link={link} openInNewTab={openInNewTab} />}
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
          name: 'content',
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
        ...buttonInputs
      ],
    },
  ],
  presets: {
    imageSrc: IMAGES_PLACEHOLDERS.image,
  },
};
