import type {
    HydrogenComponentProps,
    HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { useLoaderData } from '@remix-run/react';
import { CollectionDetailsQuery } from 'storefrontapi.generated';

interface HeaderProps extends HydrogenComponentProps {
    textColor: string;
    heightBanner: number
}

let CollectHeader = forwardRef<HTMLElement, HeaderProps>((props, ref) => {
    let { textColor, heightBanner, ...rest } = props;
    let { collection } = useLoaderData<
        CollectionDetailsQuery & {
            collections: Array<{ handle: string; title: string }>;
        }
    >();
    return (
        <section ref={ref} {...rest} style={{ backgroundImage: `url('${collection?.image?.url}')`, height: `${heightBanner}px` }} className="flex items-center justify-center bg-center bg-no-repeat bg-cover">
            <div className="text-center mx-auto w-1/3" style={{ color: `${textColor}` }}>
                <h2 className="text-4xl tracking-tight font-medium">
                    {collection?.title}
                </h2>
                <p className="mt-4 dark:text-gray-400 text-base">
                    {collection?.description}
                </p>
            </div>
        </section>
    );
});

export default CollectHeader;

export let schema: HydrogenComponentSchema = {
    type: 'header',
    title: 'Collection Header',
    toolbar: ['general-settings', ['duplicate', 'delete']],
    inspector: [
        {
            group: 'Header',
            inputs: [
                {
                    type: 'color',
                    name: 'textColor',
                    label: 'Text color',
                    defaultValue: '#333'
                },
                {
                    type: 'range',
                    name: 'heightBanner',
                    label: 'Banner height',
                    defaultValue: 450,
                    configs: {
                        min: 350,
                        max: 650,
                        step: 100
                    },
                }
            ],
        },
    ],
};