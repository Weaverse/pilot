import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import type {CSSProperties} from 'react';
import {forwardRef} from 'react';
import {Image} from '@shopify/hydrogen';

interface ImageWithTextProps extends HydrogenComponentProps {
  imageFirst: {
    url: string;
    altText: string;
    width?: number;
    height?: number;
  };
  imageSecond: {
    url: string;
    altText: string;
    width?: number;
    height?: number;
  };
  heading: string;
  subHeading: string;
  subHeadingSize: string;
  headingSize: string;
  descriptionText: string;
  textAlignment: string;
  buttonLabel: string;
  buttonLink: string;
  loading: HTMLImageElement['loading'];
}

let ImageWithText = forwardRef<HTMLElement, ImageWithTextProps>(
  (props, ref) => {
    let {
      imageFirst,
      imageSecond,
      heading,
      subHeading,
      subHeadingSize,
      headingSize,
      descriptionText,
      textAlignment,
      buttonLabel,
      buttonLink,
      loading,
      ...rest
    } = props;
    let styleSection: CSSProperties = {
      '--height-section': '410px',
      '--font-size-display': `${headingSize}`,
      '--font-size-heading': `${subHeadingSize}`,
      textAlign: `${textAlignment}`,
    } as CSSProperties;
    const isDescriptionEmpty = /^<p><br><\/p>$/i.test(descriptionText);
    return (
      <section
        ref={ref}
        {...rest}
        style={styleSection}
        className="bg-blue-100 h-[var(--height-section)] overflow-hidden w-full sm-max:h-auto sm-max:overflow-hidden"
      >
        <div className="box-border h-full px-10 sm-max:px-6 sm-max:w-full">
          <div className="flex box-border h-full w-full sm-max:flex-col">
            <div className="w-2/5 h-full py-16 mr-5 sm-max:mr-0 sm-max:w-full sm-max:pb-12">
              {subHeading && (
                <p className="text-heading mb-5 leading-6">{subHeading}</p>
              )}
              {heading && (
                <h3 className="mb-5 text-gray-950 text-display font-bold leading-5">
                  {heading}
                </h3>
              )}
              {!isDescriptionEmpty && (
                <p
                  className="text-sm font-normal mb-5 leading-6 sm-max:w-full"
                  dangerouslySetInnerHTML={{__html: descriptionText}}
                ></p>
              )}
              {buttonLabel && (
                <a
                  className="text-center py-3 px-4 rounded bg-gray-950 text-white"
                  href={buttonLink}
                >
                  {buttonLabel}
                </a>
              )}
            </div>
            <div className="w-3/5 flex h-full py-14 justify-end sm-max:order-first sm-max:w-full sm-max:py-10 sm-max:pb-0 sm-max:justify-center">
              <div className="z-10 sm:translate-x-8 sm:translate-y-8 sm-max:z-10 sm-max:translate-x-9 sm-max:translate-y-9">
                <Image
                  data={imageFirst}
                  loading={loading}
                  className="sm:object-contain sm-max:object-contain"
                  sizes="auto"
                />
              </div>
              <div>
                <Image
                  data={imageSecond}
                  loading={loading}
                  className="sm:object-contain sm-max:object-contain"
                  sizes="auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },
);

export default ImageWithText;

export let schema: HydrogenComponentSchema = {
  type: 'image-with-text',
  title: 'Image with text',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Image',
      inputs: [
        {
          type: 'image',
          name: 'imageFirst',
          label: 'Image 1',
          defaultValue: {
            url: 'https://thang-weaverse-test-shop.myshopify.com/cdn/shop/files/gift-card-envelopes.jpg?v=1696497046&width=1100',
            altText: 'imageIndex',
          },
        },
        {
          type: 'image',
          name: 'imageSecond',
          label: 'Image 2',
          defaultValue: {
            url: 'https://thang-weaverse-test-shop.myshopify.com/cdn/shop/files/gift-card.jpg?v=1696497401&width=1100',
            altText: 'imageIndex',
          },
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
              {label: 'XS', value: '14px'},
              {label: 'S', value: '16px'},
              {label: 'M', value: '18px'},
              {label: 'L', value: '20px'},
              {label: 'XL', value: '22px'},
            ],
          },
          defaultValue: '16px',
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
              {label: 'XS', value: '22px'},
              {label: 'S', value: '24px'},
              {label: 'M', value: '26px'},
              {label: 'L', value: '28px'},
              {label: 'XL', value: '30px'},
            ],
          },
          defaultValue: '24px',
        },
        {
          type: 'richtext',
          label: 'Text',
          name: 'descriptionText',
          defaultValue:
            'Pair large text with an image to tell a story, explain a detail about your product, or describe a new promotion.',
        },
        {
          type: 'toggle-group',
          label: 'Text alignment',
          name: 'textAlignment',
          configs: {
            options: [
              {label: 'Left', value: 'left'},
              {label: 'Center', value: 'center'},
              {label: 'Right', value: 'right'},
            ],
          },
          defaultValue: 'left',
        },
        {
          type: 'text',
          name: 'buttonLabel',
          label: 'Button label',
          defaultValue: 'Button',
        },
        {
          type: 'text',
          name: 'buttonLink',
          label: 'Button link',
          placeholder: 'https://',
        },
        {
          type: 'toggle-group',
          name: 'loading',
          label: 'Image loading',
          defaultValue: 'eager',
          configs: {
            options: [
              {label: 'Eager', value: 'eager', icon: 'Lightning'},
              {
                label: 'Lazy',
                value: 'lazy',
                icon: 'SpinnerGap',
                weight: 'light',
              },
            ],
          },
          helpText:
            'Learn more about <a href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/loading" target="_blank" rel="noopener noreferrer">image loading strategies</a>.',
        },
      ],
    },
  ],
};
