import { type MetaFunction, useLoaderData } from "@remix-run/react";
import { Image, Money, flattenConnection } from "@shopify/hydrogen";
import type { FulfillmentStatus } from "@shopify/hydrogen/customer-account-api-types";
import { type LoaderFunctionArgs, json, redirect } from "@shopify/remix-oxygen";
import clsx from "clsx";
import type { OrderFragment } from "customer-accountapi.generated";
import { IconTag } from "~/components/icons";
import { Link } from "~/components/link";
import { CUSTOMER_ORDER_QUERY } from "~/graphql/customer-account/customer-order-query";
import { statusMessage } from "~/lib/utils";
import { Text } from "~/modules/text";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Order ${data?.order?.name}` }];
};

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  if (!params.id) {
    return redirect(params?.locale ? `${params.locale}/account` : "/account");
  }

  const queryParams = new URL(request.url).searchParams;
  const orderToken = queryParams.get("key");

  try {
    const orderId = orderToken
      ? `gid://shopify/Order/${params.id}?key=${orderToken}`
      : `gid://shopify/Order/${params.id}`;

    const { data, errors } = await context.customerAccount.query(
      CUSTOMER_ORDER_QUERY,
      { variables: { orderId } }
    );

    if (errors?.length || !data?.order?.lineItems) {
      throw new Error("Order not found");
    }

    const order: OrderFragment = data.order;

    const lineItems = flattenConnection(order.lineItems);

    const discountApplications = flattenConnection(order.discountApplications);

    const firstDiscount = discountApplications[0]?.value;

    const discountValue =
      firstDiscount?.__typename === "MoneyV2" && firstDiscount;

    const discountPercentage =
      firstDiscount?.__typename === "PricingPercentageValue" &&
      firstDiscount?.percentage;
    const fulfillments = flattenConnection(order.fulfillments);
    const fulfillmentStatus =
      fulfillments.length > 0
        ? fulfillments[0].status
        : ("OPEN" as FulfillmentStatus);

    return json({
      order,
      lineItems,
      discountValue,
      discountPercentage,
      fulfillmentStatus,
    });
  } catch (error) {
    throw new Response(error instanceof Error ? error.message : undefined, {
      status: 404,
    });
  }
}

export default function OrderRoute() {
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData<typeof loader>();
  let totalDiscount = 0;
  lineItems.forEach((lineItem) => {
    const itemDiscount = lineItem.discountAllocations.reduce(
      (acc: number, curr) => {
        return (acc += Number.parseFloat(curr.allocatedAmount.amount));
      },
      0
    );
    totalDiscount += itemDiscount;
  });
  const totalDiscountMoney = {
    amount: totalDiscount.toString(),
    currencyCode: order.totalPrice?.currencyCode,
  };
  return (
    <div className="max-w-screen-xl mx-auto px-4">
      <div className="w-full p-4 sm:grid-cols-1 md:p-8 lg:p-12 lg:py-6">
        <div className="flex flex-col gap-1 mb-8">
          <div className="h4">Order Detail</div>
          <Link to="/account">
            <Text color="subtle">Return to My Account</Text>
          </Link>
        </div>
        <div>
          <p className="">Order No. {order.name}</p>
          <p className="mt-2">
            Placed on {new Date(order.processedAt!).toDateString()}
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
                      <div className="w-[120px] aspect-square shrink-0">
                        <Image data={lineItem.image} width={120} height={120} />
                      </div>
                    )}
                    <dl className="flex flex-col">
                      <dt className="sr-only">Product</dt>
                      <dd className="truncate">
                        <div className="">{lineItem.title}</div>
                        <div className="text-body/50 text-sm">
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
                          const discountApp =
                            discount.discountApplication as any;
                          const discountTitle =
                            discountApp?.title || discountApp?.code;
                          return (
                            <div
                              className="text-body/50 flex items-center gap-1 border border-[#B7B7B7] py-1 px-1.5 rounded-sm text-sm w-fit"
                              key={index}
                            >
                              <IconTag className="w-4 h-4" />
                              <span>{discountTitle}</span>
                              <div className="inline-flex">
                                (<span>-</span>
                                <Money data={discount.allocatedAmount!} />)
                              </div>
                            </div>
                          );
                        })}
                      </dd>
                      <dt className="sr-only">Current Price</dt>
                      <dd className="truncate flex gap-2 mt-2">
                        {hasDiscount && (
                          <span className="line-through text-body/50">
                            <Money data={lineItem.totalPrice!} />
                          </span>
                        )}
                        <Money data={lineItem.currentTotalPrice!} />
                      </dd>
                    </dl>
                  </div>
                );
              })}
              <hr className="border-t border-[#B7B7B7]" />
              <div className="space-y-4 max-w-sm ml-auto">
                <div className="flex justify-between gap-4 ">
                  <span className="font-bold">Subtotal</span>
                  <span>
                    <Money data={order.subtotal!} />
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Tax</span>
                  <span>
                    <Money data={order.totalTax!} />
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Shipping</span>
                  <span>
                    <Money data={order.totalShipping!} />
                  </span>
                </div>
                <hr className="border-t border-[#B7B7B7] pb-2" />
                <div className="flex justify-between gap-4">
                  <span className="font-bold">Total</span>
                  <span className="text-xl">
                    <Money data={order.totalPrice!} />
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <div className="flex gap-1 items-center">
                    <IconTag className="w-4 h-4" />
                    <span className="uppercase font-bold text-sm">
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
                  <li>
                    <Text>{order.shippingAddress.name}</Text>
                  </li>
                  {order?.shippingAddress?.formatted ? (
                    order.shippingAddress.formatted.map((line: string) => (
                      <li key={line}>
                        <Text className="text-body/50">{line}</Text>
                      </li>
                    ))
                  ) : (
                    <></>
                  )}
                </ul>
              ) : (
                <p className="mt-3">No shipping address defined</p>
              )}
              <div className="font-bold mt-6">Status</div>
              {fulfillmentStatus && (
                <div
                  className={clsx(
                    `mt-3 px-2.5 py-1 text-sm inline-block w-auto`,
                    "border text-[#696662] border-[#696662]"
                  )}
                >
                  <Text size="fine">{statusMessage(fulfillmentStatus!)}</Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
