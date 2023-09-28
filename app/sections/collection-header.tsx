import type {
    HydrogenComponentProps,
    HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { useLoaderData } from '@remix-run/react';
import { CollectionDetailsQuery } from 'storefrontapi.generated';

interface HeaderProps extends HydrogenComponentProps {
    heightSectionDesktop: number;
    heightSectionMobile: number;
    enableBackground: boolean;
    textPosition: string;
    overlayBackground: number;
    enableOverlay: boolean;
}

let CollectHeader = forwardRef<HTMLElement, HeaderProps>((props, ref) => {
    let { heightSectionDesktop, heightSectionMobile, enableBackground, textPosition, overlayBackground, enableOverlay, ...rest } = props;
    let { collection } = useLoaderData<
        CollectionDetailsQuery & {
            collections: Array<{ handle: string; title: string }>;
        }
    >();
    let backgroundStyle = {};
    if (enableBackground) {
        backgroundStyle = {
            backgroundImage: `url('${collection?.image?.url}')`,
            '--header-height-desktop': `${heightSectionDesktop}px`,
            '--header-height-mobile': `${heightSectionMobile}px`
        };
    }
    let textStyle = {};
    if (enableBackground) {
        textStyle = {
            color: '#fff',
        };
    } else {
        textStyle = {
            color: '#333',
            position: 'relative',
        };
    }
    let overlayStyle = {};
    if (enableOverlay && enableBackground) {
        overlayStyle = {
            backgroundColor: `rgba(0, 0, 0, ${overlayBackground})`,
        };
    }
    return (
        <section ref={ref} {...rest} style={{ ...backgroundStyle }} className={`flex items-center justify-start relative overflow-hidden bg-center bg-no-repeat bg-cover h-[var(--header-height-mobile)] sm:h-[var(--header-height-desktop)]`}>
            {enableOverlay && enableBackground && <div className="absolute inset-0 z-1" style={overlayStyle}></div>}
            <div className={`text-center mx-auto w-5/6 text-gray-700 ml-auto absolute ${textPosition} z-2`} style={textStyle}>
                <h1 className='text-4xl tracking-tight font-worksans font-normal leading-tight md:text-5xl'>
                    {collection?.title}
                </h1>
                <p className="mt-4 dark:text-gray-400 font-worksans text-base md:text-sm">
                    {collection?.description}
                </p>
            </div>
        </section>
    );
});

export default CollectHeader;

export let schema: HydrogenComponentSchema = {
    type: 'header',
    title: 'Collection header',
    toolbar: ['general-settings', ['duplicate', 'delete']],
    inspector: [
        {
            group: 'Header',
            inputs: [
                {
                    type: 'switch',
                    name: 'enableBackground',
                    label: 'Enable background',
                    defaultValue: true,
                },
                {
                    type: 'range',
                    name: 'heightSectionDesktop',
                    label: 'Section height desktop',
                    defaultValue: 450,
                    configs: {
                        min: 350,
                        max: 550,
                        step: 10
                    },
                },
                {
                    type: 'range',
                    name: 'heightSectionMobile',
                    label: 'Section height mobile',
                    defaultValue: 450,
                    configs: {
                        min: 350,
                        max: 550,
                        step: 10
                    },
                },
                {
                    type: 'select',
                    name: 'textPosition',
                    label: 'Text position',
                    configs: {
                        options: [
                            { value: 'top-0 right-0 left-0', label: 'Top center' },
                            { value: 'right-0 left-0', label: 'Center' },
                            { value: 'bottom-0 right-0 left-0', label: 'Bottom center' },
                            { value: 'left-0', label: 'Center left' },
                            { value: 'right-0', label: 'Center right' },
                            { value: 'top-0 left-0', label: 'Top left' },
                            { value: 'top-0 right-0', label: 'Top right' },
                            { value: 'bottom-0 right-0', label: 'Bottom right' },
                            { value: 'bottom-0 left-0', label: 'Bottom left' },
                        ],
                    },
                    defaultValue: 'right-0 left-0',
                },
                {
                    type: 'switch',
                    name: 'enableOverlay',
                    label: 'Enable overlay',
                    defaultValue: true,
                },
                {
                    type: 'range',
                    name: 'overlayBackground',
                    label: 'Overlay',
                    defaultValue: 0.5,
                    configs: {
                        min: 0.1,
                        max: 1,
                        step: 0.1
                    },
                },
                {
                    type: 'position',
                    name: 'position',
                    label: 'Position'
                }
            ],
        },
    ],
};