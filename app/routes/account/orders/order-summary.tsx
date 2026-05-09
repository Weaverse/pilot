import { TagIcon } from "@phosphor-icons/react";
import { Money } from "@shopify/hydrogen";
import type {
  OrderFragment,
  OrderLineItemFullFragment,
} from "customer-account-api.generated";

export function OrderSummary({
  order,
  lineItems,
}: {
  order: OrderFragment;
  lineItems: OrderLineItemFullFragment[];
}) {
  let totalDiscount = 0;
  for (const lineItem of lineItems) {
    totalDiscount += lineItem.discountAllocations.reduce(
      (acc, curr) => acc + Number.parseFloat(curr.allocatedAmount.amount),
      0,
    );
  }
  return (
    <dl className="ml-auto space-y-4">
      <div className="flex justify-between gap-4">
        <dt className="font-bold">Subtotal</dt>
        <dd>
          <Money data={order.subtotal} />
        </dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt>Tax</dt>
        <dd>
          <Money data={order.totalTax} />
        </dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt>Shipping</dt>
        <dd>
          <Money data={order.totalShipping} />
        </dd>
      </div>
      <hr className="border-line-subtle border-t pb-2" />
      <div className="flex justify-between gap-4">
        <dt className="font-bold">Total</dt>
        <dd className="text-xl">
          <Money data={order.totalPrice} />
        </dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="flex items-center gap-2">
          <TagIcon className="h-4 w-4" />
          <span className="font-bold text-sm uppercase leading-none">
            Total savings
          </span>
        </dt>
        <dd>
          <Money
            data={{
              amount: totalDiscount.toString(),
              currencyCode: order.totalPrice?.currencyCode,
            }}
          />
        </dd>
      </div>
    </dl>
  );
}
