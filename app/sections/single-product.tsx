import {Link} from '@remix-run/react';
import {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  ComponentLoaderArgs,
  getSelectedProductOptions,
  WeaverseProduct,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';
import {ProductInfoQuery} from 'storefrontapi.generated';
import {PRODUCT_QUERY} from '~/data/queries';

type SingleProductData = {
  heading: string;
  productsCount: number;
  product: WeaverseProduct;
};

type SingleProductProps = HydrogenComponentProps<
  Awaited<ReturnType<typeof loader>>
> &
  SingleProductData;

let SingleProduct = forwardRef<HTMLElement, SingleProductProps>(
  (props, ref) => {
    let {loaderData, product, children, ...rest} = props;
    let productTitle = loaderData?.product?.title;
    return (
      <section ref={ref} {...rest} className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
            <img
              alt="Product Image"
              className="mx-auto aspect-[1/1] overflow-hidden rounded-xl object-cover object-center sm:w-full"
              height="500"
              src="/placeholder.svg"
              width="500"
            />
            <div className="flex flex-col justify-start space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  {productTitle}
                </h2>
                <p className="text-2xl text-zinc-500 md:text-3xl/relaxed lg:text-2xl/relaxed xl:text-3xl/relaxed dark:text-zinc-400">
                  $99.99
                </p>
              {children}

                <p className="max-w-[600px] text-zinc-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-zinc-400">
                  Product description goes here. It explains the key features
                  and benefits of the product.
                </p>
              </div>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-8 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 dark:focus-visible:ring-zinc-300"
                to="#"
              >
                Add to Cart
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  },
);

export let loader = async (args: ComponentLoaderArgs<SingleProductData>) => {
  let {weaverse, data} = args;
  let {storefront} = weaverse;
  let selectedOptions = getSelectedProductOptions(weaverse.request);

  if (data?.product) {
    let product = await storefront.query<ProductInfoQuery>(PRODUCT_QUERY, {
      variables: {
        handle: data.product.handle,
        // Should not get from request since this section could be used everywhere
        // TODO: update the query to not require `selectedOptions` or create a new query for this component
        selectedOptions,
        language: storefront.i18n.language,
        country: storefront.i18n.country,
      },
    });

    return product;
  }
  return null;
};

export let schema: HydrogenComponentSchema = {
  type: 'single-product',
  title: 'Single product',
  childTypes: ['judgeme-review',],

  limit: 1,
  inspector: [
    {
      group: 'Single product',
      inputs: [
        {
          label: 'Choose product',
          type: 'product',
          name: 'product',
        },
      ],
    },
  ],
};

export default SingleProduct;
