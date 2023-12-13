import {
  CartForm,
  Image,
  Money,
  OptimisticInput,
  flattenConnection,
  useOptimisticData,
} from '@shopify/hydrogen';
import type {
  CartCost,
  CartLine,
  CartLineUpdateInput,
  Cart as CartType,
} from '@shopify/hydrogen/storefront-api-types';
import clsx from 'clsx';
import {useRef} from 'react';
import {useScroll} from 'react-use';
import {
  Button,
  FeaturedProducts,
  IconRemove,
  Input,
  Link,
  Text,
} from '~/components';

type Layouts = 'page' | 'drawer';

export function Cart({
  layout,
  onClose,
  cart,
}: {
  layout: Layouts;
  onClose?: () => void;
  cart: CartType | null;
}) {
  const linesCount = Boolean(cart?.lines?.edges?.length || 0);

  return (
    <>
      <CartEmpty hidden={linesCount} onClose={onClose} layout={layout} />
      <CartDetails cart={cart} layout={layout} />
    </>
  );
}

export function CartDetails({
  layout,
  cart,
}: {
  layout: Layouts;
  cart: CartType | null;
}) {
  // @todo: get optimistic cart cost
  const cartHasItems = !!cart && cart.totalQuantity > 0;
  const container = {
    drawer: 'grid grid-cols-1 h-screen-no-nav grid-rows-[1fr_auto]',
    page: 'grid grid-cols-1 md:grid-cols-[2fr_1fr] w-full max-w-7xl mx-auto gap-5',
  };

  return (
    <div className={container[layout]}>
      <CartLines lines={cart?.lines} layout={layout} />
      {cartHasItems && (
        <CartSummary cost={cart.cost} layout={layout}>
          <CartDiscounts discountCodes={cart.discountCodes} />
          <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
        </CartSummary>
      )}
    </div>
  );
}

/**
 * Temporary discount UI
 * @param discountCodes the current discount codes applied to the cart
 * @todo rework when a design is ready
 */
function CartDiscounts({
  discountCodes,
}: {
  discountCodes: CartType['discountCodes'];
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <>
      {/* Have existing discount, display it with a remove option */}
      <dl className={codes && codes.length !== 0 ? 'grid' : 'hidden'}>
        <div className="flex items-center justify-between font-medium">
          <Text as="dt">Discount(s)</Text>
          <div className="flex items-center justify-between">
            <UpdateDiscountForm>
              <button>
                <IconRemove
                  aria-hidden="true"
                  style={{height: 18, marginRight: 4}}
                />
              </button>
            </UpdateDiscountForm>
            <Text as="dd">{codes?.join(', ')}</Text>
          </div>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div className={clsx('flex', 'items-center gap-4 justify-between')}>
          <Input type="text" name="discountCode" placeholder="Discount code" />
          <button className="flex justify-end font-medium whitespace-nowrap">
            Apply Discount
          </button>
        </div>
      </UpdateDiscountForm>
    </>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartLines({
  layout = 'drawer',
  lines: cartLines,
}: {
  layout: Layouts;
  lines: CartType['lines'] | undefined;
}) {
  const currentLines = cartLines ? flattenConnection(cartLines) : [];
  const scrollRef = useRef(null);
  const {y} = useScroll(scrollRef);

  return (
    <section
      ref={scrollRef}
      aria-labelledby="cart-contents"
      className={clsx([
        y > 0 ? 'border-t' : '',
        layout === 'page'
          ? 'flex-grow md:translate-y-4'
          : 'px-6 pb-6 sm-max:pt-2 overflow-auto transition md:px-12',
      ])}
    >
      <table className="table-auto">
        {layout === 'page' && (
          <thead>
            <tr className="font-semibold p-2">
              <th className="p-4 text-left border-bar/15 border-b border-bar">
                Product
              </th>
              <th className="p-4 border-b border-bar/15 hidden lg:table-cell"></th>
              <th className="p-4 border-b border-bar/15 hidden lg:table-cell">
                Price
              </th>
              <th className="p-4 border-b border-bar/15 hidden lg:table-cell">
                Quantity
              </th>
              <th className="p-4 border-b border-bar/15 hidden lg:table-cell">
                Total
              </th>
              <th className="p-4 border-b border-bar/15 hidden lg:table-cell"></th>
            </tr>
          </thead>
        )}
        <tbody>
          {currentLines.map((line) => (
            <CartLineItem
              key={line.id}
              line={line as CartLine}
              layout={layout}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl: string}) {
  if (!checkoutUrl) return null;

  return (
    <div className="flex flex-col mt-2">
      <a href={checkoutUrl} target="_self">
        <Button as="span" width="full">
          Checkout
        </Button>
      </a>
      {/* @todo: <CartShopPayButton cart={cart} /> */}
    </div>
  );
}

function CartSummary({
  cost,
  layout,
  children = null,
}: {
  children?: React.ReactNode;
  cost: CartCost;
  layout: Layouts;
}) {
  // const summary = {
  //   drawer: 'grid gap-4 p-6 border-t md:px-12',
  //   page: 'sticky top-nav grid gap-6 p-4 md:px-6 md:translate-y-4 bg-primary/5 rounded w-full',
  // };

  return (
    <section
      aria-labelledby="summary-heading"
      className="bg-primary p-6 space-y-5"
    >
      <h2 id="summary-heading" className="sr-only">
        Order summary
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between font-medium text-2xl">
          <h2>Total</h2>
          <div>
            {cost?.subtotalAmount?.amount ? (
              <Money data={cost?.subtotalAmount} />
            ) : (
              '-'
            )}
          </div>
        </div>
        <p>Shipping & taxes calculated at checkout</p>
        <p className="underline">Add delivery note</p>
      </div>
      {children}
    </section>
  );
}

type OptimisticData = {
  action?: string;
  quantity?: number;
};

function CartLineItem({
  line,
  layout,
}: {
  line: CartLine;
  layout: 'drawer' | 'page';
}) {
  const optimisticData = useOptimisticData<OptimisticData>(line?.id);
  let styles = {
    page: 'grid lg:table-row gap-2 grid-rows-2 grid-cols-[100px_1fr_64px]',
    drawer: 'grid gap-2 grid-rows-2 grid-cols-[100px_1fr_64px]',
  };
  if (!line?.id) return null;

  const {id, quantity, merchandise, cost} = line;

  if (typeof quantity === 'undefined' || !merchandise?.product) return null;
  // Hide the line item if the optimistic data action is remove
  // Do not remove the form from the DOM
  let style = optimisticData?.action === 'remove' ? {display: 'none'} : {};
  return (
    <tr key={line.id} className={styles[layout]} style={style}>
      <td className="py-2 row-start-1 row-end-3">
        {merchandise.image && (
          <Image
            width={110}
            height={110}
            data={merchandise.image}
            className="object-cover object-center w-24 h-24 rounded md:w-28 md:h-28"
            alt={merchandise.title}
            sizes="auto"
          />
        )}
      </td>
      <td className="py-2 lg:p-4 text-sm">
        <div className="grid gap-2">
          <div className="font-medium">
            {merchandise?.product?.handle ? (
              <Link to={`/products/${merchandise.product.handle}`}>
                {merchandise?.product?.title || ''}
              </Link>
            ) : (
              <Text>{merchandise?.product?.title || ''}</Text>
            )}
          </div>
          <div className="grid pb-2">
            <Text>
              {(merchandise?.selectedOptions || [])
                .map((option) => option.value)
                .join('/')}
            </Text>
          </div>
        </div>
      </td>
      <td className="py-2 lg:p-4">
        <Money withoutTrailingZeros data={cost.amountPerQuantity} />
      </td>
      <td className="py-2 lg:p-4 row-start-2">
        <div className="flex gap-2">
          <CartLineQuantityAdjust line={line as CartLine} />
          {
            <div className="lg:hidden">
              <ItemRemoveButton lineId={id} />
            </div>
          }
        </div>
      </td>
      {layout === 'page' && (
        <td className="py-2 lg:p-4 col-start-3 hidden lg:table-cell">
          <CartLinePrice line={line as CartLine} />
        </td>
      )}
      <td className="py-2 lg:p-4 lg:table-cell hidden">
        <ItemRemoveButton lineId={id} />
      </td>
    </tr>
  );
}

function ItemRemoveButton({lineId}: {lineId: CartLine['id']}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{
        lineIds: [lineId],
      }}
    >
      <button
        className="flex items-center justify-center w-10 h-10"
        type="submit"
      >
        <span className="sr-only">Remove</span>
        <IconRemove aria-hidden="true" />
      </button>
      <OptimisticInput id={lineId} data={{action: 'remove'}} />
    </CartForm>
  );
}

function CartLineQuantityAdjust({line}: {line: CartLine}) {
  const optimisticId = line?.id;
  const optimisticData = useOptimisticData<OptimisticData>(optimisticId);

  if (!line || typeof line?.quantity === 'undefined') return null;

  const optimisticQuantity = optimisticData?.quantity || line.quantity;

  const {id: lineId} = line;
  const prevQuantity = Number(Math.max(0, optimisticQuantity - 1).toFixed(0));
  const nextQuantity = Number((optimisticQuantity + 1).toFixed(0));

  return (
    <>
      <label htmlFor={`quantity-${lineId}`} className="sr-only">
        Quantity, {optimisticQuantity}
      </label>
      <div className="flex items-center border rounded">
        <UpdateCartButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            name="decrease-quantity"
            aria-label="Decrease quantity"
            className="w-10 h-10 transition "
            value={prevQuantity}
            disabled={optimisticQuantity <= 1}
          >
            <span>&#8722;</span>
            <OptimisticInput
              id={optimisticId}
              data={{quantity: prevQuantity}}
            />
          </button>
        </UpdateCartButton>

        <div className="px-2 text-center" data-test="item-quantity">
          {optimisticQuantity}
        </div>

        <UpdateCartButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            className="w-10 h-10 transition text-body hover:text-body"
            name="increase-quantity"
            value={nextQuantity}
            aria-label="Increase quantity"
          >
            <span>&#43;</span>
            <OptimisticInput
              id={optimisticId}
              data={{quantity: nextQuantity}}
            />
          </button>
        </UpdateCartButton>
      </div>
    </>
  );
}

function UpdateCartButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{
        lines,
      }}
    >
      {children}
    </CartForm>
  );
}

function CartLinePrice({
  line,
  priceType = 'regular',
  ...passthroughProps
}: {
  line: CartLine;
  priceType?: 'regular' | 'compareAt';
  [key: string]: any;
}) {
  if (!line?.cost?.amountPerQuantity || !line?.cost?.totalAmount) return null;

  const moneyV2 =
    priceType === 'regular'
      ? line.cost.totalAmount
      : line.cost.compareAtAmountPerQuantity;

  if (moneyV2 == null) {
    return null;
  }

  return <Money withoutTrailingZeros {...passthroughProps} data={moneyV2} />;
}

export function CartEmpty({
  hidden = false,
  layout = 'drawer',
  onClose,
}: {
  hidden: boolean;
  layout?: Layouts;
  onClose?: () => void;
}) {
  const scrollRef = useRef(null);
  const {y} = useScroll(scrollRef);

  const container = {
    drawer: clsx([
      'content-start gap-4 px-6 pb-8 transition overflow-y-scroll md:gap-12 md:px-12 h-screen-no-nav md:pb-12',
      y > 0 ? 'border-t' : '',
    ]),
    page: clsx([
      hidden ? '' : 'grid',
      `pb-12 w-full md:items-start gap-4 md:gap-8 lg:gap-12`,
    ]),
  };

  return (
    <div ref={scrollRef} className={container[layout]} hidden={hidden}>
      <section className="grid gap-6">
        <Text format>
          Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
          started!
        </Text>
        <div>
          <Button onClick={onClose}>Continue shopping</Button>
        </div>
      </section>
      <section className="grid gap-8 pt-16">
        <FeaturedProducts
          count={4}
          heading="Shop Best Sellers"
          layout={layout}
          onClose={onClose}
          sortKey="BEST_SELLING"
        />
      </section>
    </div>
  );
}
