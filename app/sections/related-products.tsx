import {Await, useLoaderData} from '@remix-run/react';
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {Suspense, forwardRef} from 'react';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {ProductSwimlane, Skeleton} from '~/components';

interface RelatedProductsProps extends HydrogenComponentProps {
  heading: string;
  productsCount: number;
}

let RelatedProducts = forwardRef<HTMLElement, RelatedProductsProps>(
  (props, ref) => {
    let {recommended} = useLoaderData<{
      recommended: {nodes: ProductCardFragment[]};
    }>();
    let {heading, productsCount, ...rest} = props;
    if (recommended) {
      return (
        <section ref={ref} {...rest}>
          <Suspense fallback={<Skeleton className="h-32" />}>
            <Await
              errorElement="There was a problem loading related products"
              resolve={recommended}
            >
              {(products) => (
                <ProductSwimlane
                  title={heading}
                  count={productsCount}
                  products={products}
                />
              )}
            </Await>
          </Suspense>
        </section>
      );
    }
    return <section ref={ref} {...rest} />;
  },
);

export default RelatedProducts;

export let schema: HydrogenComponentSchema = {
  type: 'related-products',
  title: 'Related products',
  limit: 1,
  enabledOn: {
    pages: ['PRODUCT'],
  },
  inspector: [
    {
      group: 'Related products',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'You may also like',
          placeholder: 'Related products',
        },
        {
          type: 'range',
          name: 'productsCount',
          label: 'Number of products',
          defaultValue: 12,
          configs: {
            min: 1,
            max: 12,
            step: 1,
          },
        },
      ],
    },
  ],
  toolbar: ['general-settings', ['duplicate', 'delete']],
};
