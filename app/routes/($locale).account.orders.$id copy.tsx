import { type MetaFunction, useLoaderData } from "@remix-run/react";
import { Image, Money, flattenConnection } from "@shopify/hydrogen";
import type { FulfillmentStatus } from "@shopify/hydrogen/customer-account-api-types";
import { type LoaderFunctionArgs, json, redirect } from "@shopify/remix-oxygen";
import clsx from "clsx";
import type { OrderFragment } from "customer-accountapi.generated";
import invariant from "tiny-invariant";
import { Link } from "~/components/link";
import { CUSTOMER_ORDER_QUERY } from "~/graphql/customer-account/customer-order-query";
import { statusMessage } from "~/lib/utils";
import { Heading, PageHeader, Text } from "~/modules/text";

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
      { variables: { orderId } },
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

  return (
    <div className="max-w-screen-xl mx-auto">
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
          <div className="md:flex flex-col md:flex-row items-start md:gap-14 mt-6 divide-y divide-gray-300">
            <table className="w-full divide-y divide-gray-300 md:col-span-3">
              <thead>
                <tr className="align-baseline ">
                  <th
                    scope="col"
                    className="pb-4 pl-0 pr-3 font-semibold text-left"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 pb-4 font-semibold text-right sm:table-cell md:table-cell"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 pb-4 font-semibold text-right sm:table-cell md:table-cell"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-4 pb-4 font-semibold text-right"
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lineItems.map((lineItem) => {
                  console.log(
                    "🚀 ~ {lineItems.map ~ lineItem:",
                    lineItem.price,
                  );
                  const amount = Number(lineItem?.price?.amount) || 0;
                  const totalAmount = amount * lineItem.quantity;
                  const total = {
                    amount: totalAmount.toString(),
                    currencyCode: lineItem?.price?.currencyCode,
                  };
                  return (
                    <tr key={lineItem.id}>
                      <td className="w-full py-4 pl-0 pr-3 align-top sm:align-middle max-w-0 sm:w-auto sm:max-w-none">
                        <div className="flex gap-5">
                          {lineItem?.image && (
                            <div className="w-24 card-image aspect-square shrink-0">
                              <Image
                                data={lineItem.image}
                                width={96}
                                height={96}
                              />
                            </div>
                          )}
                          <div className="flex-col justify-center hidden lg:flex">
                            <Text as="p">{lineItem.title}</Text>
                            <Text size="fine" className="mt-1" as="p">
                              {lineItem.variantTitle}
                            </Text>
                          </div>
                          <dl className="grid">
                            <dt className="sr-only">Product</dt>
                            <dd className="truncate lg:hidden">
                              <div className="">{lineItem.title}</div>
                              <div className="mt-2 text-body/50">
                                {lineItem.variantTitle}
                              </div>
                            </dd>
                            <dt className="sr-only">Price</dt>
                            <dd className="truncate sm:hidden">
                              <Money data={lineItem.price!} />
                            </dd>
                            <dt className="sr-only">Quantity</dt>
                            <dd className="truncate sm:hidden">
                              Qty: {lineItem.quantity}
                            </dd>
                          </dl>
                        </div>
                      </td>
                      <td className="pl-3 py-4 text-right align-top sm:align-middle sm:table-cell">
                        <Money data={lineItem.price!} />
                      </td>
                      <td className="hidden px-3 py-4 text-right align-top sm:align-middle sm:table-cell">
                        {lineItem.quantity}
                      </td>
                      <td className="hidden px-3 py-4 text-right align-top sm:align-middle sm:table-cell">
                        <Text>
                          <Money data={total} />
                        </Text>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                {/* biome-ignore lint/complexity/useOptionalChain: <explanation> */}
                {((discountValue && discountValue.amount) ||
                  discountPercentage) && (
                  <tr>
                    <th
                      scope="row"
                      colSpan={3}
                      className="hidden pt-6 pl-6 pr-3 font-normal text-right sm:table-cell md:pl-0"
                    >
                      <Text>Discounts</Text>
                    </th>
                    <th
                      scope="row"
                      className="pt-6 pr-3 font-normal text-left sm:hidden"
                    >
                      <Text>Discounts</Text>
                    </th>
                    <td className="pt-6 pl-3 font-medium text-right text-green-700">
                      {discountPercentage ? (
                        <span className="text-sm">
                          -{discountPercentage}% OFF
                        </span>
                      ) : (
                        discountValue && <Money data={discountValue!} />
                      )}
                    </td>
                  </tr>
                )}
                <tr>
                  <th
                    scope="row"
                    colSpan={3}
                    className="hidden pt-6 pl-6 pr-3 font-normal text-right sm:table-cell md:pl-0"
                  >
                    <Text>Subtotal</Text>
                  </th>
                  <th
                    scope="row"
                    className="pt-6 pr-3 font-normal text-left sm:hidden"
                  >
                    <Text>Subtotal</Text>
                  </th>
                  <td className="pt-6 pl-3 text-right">
                    <Money data={order.subtotal!} />
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    colSpan={3}
                    className="hidden pt-4 pl-6 pr-3 font-normal text-right sm:table-cell md:pl-0"
                  >
                    Tax
                  </th>
                  <th
                    scope="row"
                    className="pt-4 pr-3 font-normal text-left sm:hidden"
                  >
                    <Text>Tax</Text>
                  </th>
                  <td className="pt-4 pl-3 text-right">
                    <Money data={order.totalTax!} />
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    colSpan={3}
                    className="hidden pt-4 pl-6 pr-3 font-semibold text-right sm:table-cell md:pl-0"
                  >
                    Total
                  </th>
                  <th
                    scope="row"
                    className="pt-4 pr-3 font-semibold text-left sm:hidden"
                  >
                    <Text>Total</Text>
                  </th>
                  <td className="pt-4 pl-3 font-semibold text-right">
                    <Money data={order.totalPrice!} />
                  </td>
                </tr>
              </tfoot>
            </table>
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
                    "border text-[#696662] border-[#696662]",
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
