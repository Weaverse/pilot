import {Await, useMatches} from '@remix-run/react';
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {Suspense, forwardRef} from 'react';
import {Cart, CartLoading} from '~/components';

interface CartContainerProps extends HydrogenComponentProps {
  paddingTop: number;
  paddingBottom: number;
}

let CartContainer = forwardRef<HTMLElement, CartContainerProps>(
  (props, ref) => {
    let {paddingTop, paddingBottom, ...rest} = props;
    const [root] = useMatches();
    return (
      <section ref={ref} {...rest}>
        <div
          className="grid w-full gap-8 px-6 md:px-8 lg:px-12 justify-items-start"
          style={{
            paddingTop: `${paddingTop}px`,
            paddingBottom: `${paddingBottom}px`,
          }}
        >
          <Suspense fallback={<CartLoading />}>
            <Await resolve={root.data?.cart}>
              {(cart) => <Cart layout="page" cart={cart} />}
            </Await>
          </Suspense>
        </div>
      </section>
    );
  },
);

export default CartContainer;

export let schema: HydrogenComponentSchema = {
  type: 'cart',
  title: 'Cart',
  limit: 1,
  enabledOn: {
    pages: ['CART'],
  },
  toolbar: ['general-settings'],
  inspector: [
    {
      group: 'Cart',
      inputs: [
        {
          type: 'range',
          label: 'Top padding',
          name: 'paddingTop',
          configs: {
            min: 0,
            max: 100,
            step: 4,
            unit: 'px',
          },
          defaultValue: 32,
        },
        {
          type: 'range',
          label: 'Bottom padding',
          name: 'paddingBottom',
          configs: {
            min: 0,
            max: 100,
            step: 4,
            unit: 'px',
          },
          defaultValue: 32,
        },
      ],
    },
  ],
};
