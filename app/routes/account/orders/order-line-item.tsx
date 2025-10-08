import { TagIcon } from "@phosphor-icons/react";
import { Money } from "@shopify/hydrogen";
import type { OrderLineItemFullFragment } from "customer-account-api.generated";
import { Image } from "~/components/image";

export function OrderLineItem({
  lineItem,
}: {
  lineItem: OrderLineItemFullFragment;
}) {
  let hasDiscount = false;
  if (lineItem.currentTotalPrice?.amount !== lineItem.totalPrice?.amount) {
    hasDiscount = true;
  }
  return (
    <div className="flex gap-4" key={lineItem.id}>
      {lineItem?.image && (
        <div className="h-auto w-[120px] shrink-0">
          <Image data={lineItem.image} width={500} height={500} />
        </div>
      )}
      <dl className="flex flex-col">
        <dt className="sr-only">Product</dt>
        <dd className="truncate">
          <div className="">{lineItem.title}</div>
          <div className="text-body-subtle text-sm">
            {lineItem.variantTitle}
          </div>
        </dd>
        <dt className="sr-only">Quantity</dt>
        <dd className="mt-1 grow truncate">x{lineItem.quantity}</dd>
        <dt className="sr-only">Discount</dt>
        <dd className="flex flex-wrap gap-2 truncate">
          {lineItem.discountAllocations.map((discount, index) => {
            const discountApp = discount.discountApplication as any;
            const discountTitle = discountApp?.title || discountApp?.code;
            return (
              <div
                key={index}
                className="flex w-fit items-center gap-1 rounded-xs border border-line-subtle px-1.5 py-1 text-body-subtle text-sm"
              >
                <TagIcon className="h-4 w-4" />
                <span>{discountTitle}</span>
                <div className="inline-flex">
                  (<span>-</span>
                  <Money data={discount.allocatedAmount} />)
                </div>
              </div>
            );
          })}
        </dd>
        <dt className="sr-only">Current Price</dt>
        <dd className="mt-2 flex gap-2 truncate">
          {hasDiscount && (
            <span className="text-body-subtle line-through">
              <Money data={lineItem.totalPrice} />
            </span>
          )}
          <Money data={lineItem.currentTotalPrice} />
        </dd>
      </dl>
    </div>
  );
}
