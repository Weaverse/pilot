import { ArrowLeftIcon, TagIcon } from "@phosphor-icons/react";
import { Money } from "@shopify/hydrogen";
import clsx from "clsx";
import { useLoaderData } from "react-router";
import { Image } from "~/components/image";
import { Link } from "~/components/link";
import { Section } from "~/components/section";
import type { loader as orderDetailsLoader } from "~/routes/($locale).account.orders.$id";
import { ORDER_STATUS } from "./orders";

export function OrderDetails() {
  const { order, lineItems, fulfillmentStatus } =
    useLoaderData<typeof orderDetailsLoader>();

  let totalDiscount = 0;
  for (const lineItem of lineItems) {
    totalDiscount += lineItem.discountAllocations.reduce(
      (acc, curr) => acc + Number.parseFloat(curr.allocatedAmount.amount),
      0,
    );
  }

  const totalDiscountMoney = {
    amount: totalDiscount.toString(),
    currencyCode: order.totalPrice?.currencyCode,
  };

  return (
    <Section width="fixed" verticalPadding="medium">
      <div className="w-full lg:py-6">
        <div className="mb-8 flex flex-col gap-4">
          <h1 className="h4 font-medium">Order Detail</h1>
          <Link
            to="/account"
            className="w-fit items-center gap-2 text-body-subtle after:bg-body-subtle"
            variant="underline"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Return to My Account</span>
          </Link>
        </div>
        <div>
          <p className="">Order No. {order.name}</p>
          <p className="mt-2">
            Placed on {new Date(order.processedAt).toDateString()}
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3">
            <div className="col-span-2 space-y-6 md:pr-14">
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
                      <dd className="mt-1 grow truncate">
                        x{lineItem.quantity}
                      </dd>
                      <dt className="sr-only">Discount</dt>
                      <dd className="flex flex-wrap gap-2 truncate">
                        {lineItem.discountAllocations.map((discount, index) => {
                          const discountApp =
                            discount.discountApplication as any;
                          const discountTitle =
                            discountApp?.title || discountApp?.code;
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
              })}
              <hr className="border-line-subtle border-t" />
              <div className="ml-auto space-y-4">
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
                    <Money data={totalDiscountMoney} />
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 shrink-0 pt-10 md:m-0 md:border-none md:pt-0">
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
              <div className="mt-6 font-bold">Status</div>
              {fulfillmentStatus && (
                <div
                  className={clsx(
                    "mt-3 inline-block w-auto px-2.5 py-1 text-sm",
                    "bg-body-subtle text-body-inverse",
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
