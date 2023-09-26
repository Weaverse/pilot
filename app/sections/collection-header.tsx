import type {
    HydrogenComponentProps,
    HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';

interface HeaderProps extends HydrogenComponentProps {
    heading: string;
    description: string;
    backgroundUrl: {
        url: string;
        altText: string;
        width?: number;
        height?: number;
    };
    textColor: string;
    heightBanner: number
}

let collectHeader = forwardRef<HTMLElement, HeaderProps>((props, ref) => {
    let { heading, description, backgroundUrl, textColor, heightBanner, ...rest } = props;
    return (
        <section ref={ref} {...rest} style={{ backgroundImage: `url('${backgroundUrl.url || backgroundUrl}')`, height: `${heightBanner}px` }} className="flex items-center justify-center bg-center bg-no-repeat bg-cover">
            <div className="text-center mx-auto w-1/3" style={{color: `${textColor}`}}>
                <h2 className="text-4xl tracking-tight font-medium">
                    {heading}
                </h2>
                <p className="mt-4 dark:text-gray-400 text-base">
                    {description}
                </p>
            </div>
        </section>
    );
});

export default collectHeader;

export let schema: HydrogenComponentSchema = {
    type: 'header',
    title: 'Collection Header',
    toolbar: ['general-settings', ['duplicate', 'delete']],
    inspector: [
        {
            group: 'Header',
            inputs: [
                {
                    type: 'text',
                    name: 'heading',
                    label: 'Heading',
                    defaultValue: `Women's Tops`,
                    placeholder: `Women's Tops`,
                },
                {
                    type: 'textarea',
                    name: 'description',
                    label: 'Description',
                    defaultValue: `Since 2006, we've been carefully developing one garment at a time, each one meant to be around forever.`,
                    placeholder: 'Header description',
                },
                {
                    type: 'image',
                    name: 'backgroundUrl',
                    label: 'Background image',
                    defaultValue:
                        'https://thang-weaverse-test-shop.myshopify.com/cdn/shop/files/taking-notes-and-working-on-laptop.jpg?v=1693383897&width=1500',
                },
                {
                    type: 'color',
                    name: 'textColor',
                    label: 'Text color',
                    defaultValue: '#fff'
                },
                {
                    type: 'range',
                    name: 'heightBanner',
                    label: 'Banner height',
                    defaultValue: 450,
                    configs:{
                        min: 350,
                        max: 650,
                        step: 100
                    },
                }
            ],
        },
    ],
};