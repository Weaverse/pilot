import { ArrowLeft, Tag } from "@phosphor-icons/react";
import { useLoaderData } from "@remix-run/react";
import { Money } from "@shopify/hydrogen";
import { Image } from "~/components/image";
import clsx from "clsx";
import { Link } from "~/components/link";
import { Section } from "~/components/section";
import type { loader as orderDetailsLoader } from "~/routes/($locale).account.orders.$id";
import { ORDER_STATUS } from "./orders";

export function OrderDetails() {
  let { order, lineItems, fulfillmentStatus } =
    useLoaderData<typeof orderDetailsLoader>();

  let totalDiscount = 0;
  for (let lineItem of lineItems) {
    totalDiscount += lineItem.discountAllocations.reduce(
      (acc, curr) => acc + Number.parseFloat(curr.allocatedAmount.amount),
      0,
    );
  }

  let totalDiscountMoney = {
    amount: totalDiscount.toString(),
    currencyCode: order.totalPrice?.currencyCode,
  };

  return (
    <Section width="fixed" verticalPadding="medium">
      <div className="w-full sm:grid-cols-1 lg:py-6">
        <div className="flex flex-col gap-4 mb-8">
          <h1 className="h4 font-medium">Order Detail</h1>
          <Link
            to="/account"
            className="text-body-subtle w-fit items-center gap-2 after:bg-body-subtle"
            variant="underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to My Account</span>
          </Link>
        </div>
        <div>
          <p className="">Order No. {order.name}</p>
          <p className="mt-2">
            Placed on {new Date(order.processedAt).toDateString()}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 mt-6">
            <div className="space-y-6 col-span-2 md:pr-14">
              {lineItems.map((lineItem) => {
                let hasDiscount = false;
                if (
                  lineItem.currentTotalPrice?.amount !==
                  lineItem.totalPrice?.amount
                ) {
                  hasDiscount = true;
                }
                return (
                  <div className="flex gap-4" key={lineItem.id}>
                    {lineItem?.image && (
                      <div className="w-[120px] h-auto shrink-0">
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
                      <dd className="truncate mt-1 grow">
                        x{lineItem.quantity}
                      </dd>
                      <dt className="sr-only">Discount</dt>
                      <dd className="truncate flex gap-2 flex-wrap">
                        {lineItem.discountAllocations.map((discount, index) => {
                          let discountApp = discount.discountApplication as any;
                          let discountTitle =
                            discountApp?.title || discountApp?.code;
                          return (
                            <div
                              className="text-body-subtle flex items-center gap-1 border border-line-subtle py-1 px-1.5 rounded-sm text-sm w-fit"
                              key={index}
                            >
                              <Tag className="w-4 h-4" />
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
                      <dd className="truncate flex gap-2 mt-2">
                        {hasDiscount && (
                          <span className="line-through text-body-subtle">
                            <Money data={lineItem.totalPrice} />
                          </span>
                        )}
                        <Money data={lineItem.currentTotalPrice} />
                      </dd>
                    </dl>
                  </div>
                );
              })}
              <hr className="border-t border-line-subtle" />
              <div className="space-y-4 ml-auto">
                <div className="flex justify-between gap-4 ">
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
                <hr className="border-t border-line-subtle pb-2" />
                <div className="flex justify-between gap-4">
                  <span className="font-bold">Total</span>
                  <span className="text-xl">
                    <Money data={order.totalPrice} />
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <div className="flex gap-2 items-center">
                    <Tag className="w-4 h-4" />
                    <span className="uppercase font-bold text-sm leading-none">
                      Total savings
                    </span>
                  </div>
                  <span>
                    <Money data={totalDiscountMoney} />
                  </span>
                </div>
              </div>
            </div>
            <div className="shrink-0 mt-4 pt-10 md:pt-0 md:m-0 md:border-none">
              <div className="font-bold">Shipping Address</div>
              {order?.shippingAddress ? (
                <ul className="mt-3">
                  <li>{order.shippingAddress.name}</li>
                  {order?.shippingAddress?.formatted
                    ? order.shippingAddress.formatted.map((line: string) => (
                        <li key={line} className="text-body-subtle">
                          {line}
                        </li>
                      ))
                    : null}
                </ul>
              ) : (
                <p className="mt-3">No shipping address defined</p>
              )}
              <div className="font-bold mt-6">Status</div>
              {fulfillmentStatus && (
                <div
                  className={clsx(
                    "mt-3 px-2.5 py-1 text-sm inline-block w-auto",
                    "text-body-inverse bg-body-subtle",
                  )}
                >
                  {ORDER_STATUS[fulfillmentStatus] || fulfillmentStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
