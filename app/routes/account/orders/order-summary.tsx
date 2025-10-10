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
    <div className="ml-auto space-y-4">
      <div className="flex justify-between gap-4">
        <span className="font-bold">Subtotal</span>
        <span>
          <Money data={order.subtotal} />
        </span>
      </div>
      <div className="flex justify-between gap-4">
        <span>Tax</span>
        <span>
          <Money data={order.totalTax} />
        </span>
      </div>
      <div className="flex justify-between gap-4">
        <span>Shipping</span>
        <span>
          <Money data={order.totalShipping} />
        </span>
      </div>
      <hr className="border-line-subtle border-t pb-2" />
      <div className="flex justify-between gap-4">
        <span className="font-bold">Total</span>
        <span className="text-xl">
          <Money data={order.totalPrice} />
        </span>
      </div>
      <div className="flex justify-between gap-4">
        <div className="flex items-center gap-2">
          <TagIcon className="h-4 w-4" />
          <span className="font-bold text-sm uppercase leading-none">
            Total savings
          </span>
        </div>
        <span>
          <Money
            data={{
              amount: totalDiscount.toString(),
              currencyCode: order.totalPrice?.currencyCode,
            }}
          />
        </span>
      </div>
    </div>
  );
}
