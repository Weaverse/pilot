import {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseLoaderArgs,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

interface SingleProductProps
  extends HydrogenComponentProps<Awaited<ReturnType<typeof loader>>> {
  heading: string;
  productsCount: number;
}
let SingleProduct = forwardRef<HTMLElement, SingleProductProps>(
  (props, ref) => {
    let {loaderData, ...rest} = props;

    return (
      <section ref={ref} {...rest}>
        hello
      </section>
    );
  },
);

export let loader = async ({context}: WeaverseLoaderArgs) => {
  return null;
};

export let schema: HydrogenComponentSchema = {
  type: 'single-product',
  title: 'Single product',
  limit: 1,
  inspector: [
    {
      group: 'Single product',
      inputs: [
        {
          label: 'Choose product',
          type: 'product',
          defaultValue: '',
        },
      ],
    },
  ],
};

export default SingleProduct;
