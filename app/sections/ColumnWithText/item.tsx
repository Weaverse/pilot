import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseImage,
} from '@weaverse/hydrogen';
import type {CSSProperties} from 'react';
import {forwardRef} from 'react';
import {Image} from '@shopify/hydrogen';
import clsx from 'clsx';
import {IconImageBlank} from '~/components';

interface ContentColumnItemProps extends HydrogenComponentProps {
  imageSrc: WeaverseImage;
  titleText: string;
  contentAlignment: string;
  descriptionText: string;
  buttonLabel: string;
  buttonLink: string;
  openInNewTab: boolean;
  buttonStyle: string;
  hideOnMobile: boolean;
}

let ContentColumnItem = forwardRef<HTMLDivElement, ContentColumnItemProps>(
  (props, ref) => {
    let {
      imageSrc,
      titleText,
      contentAlignment,
      descriptionText,
      buttonLabel,
      buttonLink,
      openInNewTab,
      buttonStyle,
      hideOnMobile,
      ...rest
    } = props;
    let contentStyle: CSSProperties = {
      textAlign: `${contentAlignment}`,
    } as CSSProperties;
    return (
      <div
        ref={ref}
        {...rest}
        className={clsx(
          'flex flex-col items-center sm-max:w-full sm-max:pt-0',
          hideOnMobile && 'hidden sm:block',
        )}
      >
        <div className="h-64 w-64 border border-solid border-gray-500 rounded-md">
          {imageSrc ? (
            <Image data={imageSrc} sizes="auto" className="w-full h-full" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex justify-center items-center">
              <IconImageBlank
                viewBox="0 0 100 100"
                className="!w-24 !h-24 opacity-40"
              />
            </div>
          )}
        </div>
        <div className="text-center w-full sm-max:w-64" style={contentStyle}>
          {titleText && (
            <p className="text-[var(--text-color)] font-normal mt-4 text-sm">
              {titleText}
            </p>
          )}
          {descriptionText && (
            <p className="text-sm font-normal mt-2 text-[var(--text-color)]">
              {descriptionText}
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
              {label: 'Left', value: 'left'},
              {label: 'Center', value: 'center'},
              {label: 'Right', value: 'right'},
            ],
          },
          defaultValue: 'center',
        },
        {
          type: 'textarea',
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
          name: 'openInNewTab',
          label: 'Open in new tab',
          defaultValue: true,
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
          type: 'switch',
          label: 'Hide on Mobile',
          name: 'hideOnMobile',
          defaultValue: false,
        },
      ],
    },
  ],
};
