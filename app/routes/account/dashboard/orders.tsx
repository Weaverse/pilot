import { flattenConnection } from "@shopify/hydrogen";
import type { FulfillmentStatus } from "@shopify/hydrogen/customer-account-api-types";
import type { OrderCardFragment } from "customer-account-api.generated";
import { Image } from "~/components/image";
import Link from "~/components/link";

export const ORDER_STATUS: Record<FulfillmentStatus, string> = {
  SUCCESS: "Success",
  PENDING: "Pending",
  OPEN: "Open",
  FAILURE: "Failure",
  ERROR: "Error",
  CANCELLED: "Cancelled",
};

type OrderCardsProps = {
  orders: OrderCardFragment[];
};

export function AccountOrderHistory({ orders }: OrderCardsProps) {
  return (
    <div className="space-y-4">
      <div className="font-bold">Orders</div>
      {orders?.length ? <Orders orders={orders} /> : <EmptyOrders />}
    </div>
  );
}

function EmptyOrders() {
  return <div>You haven&apos;t placed any orders yet.</div>;
}

function Orders({ orders }: OrderCardsProps) {
  return (
    <ul className="grid grid-flow-row grid-cols-1 gap-5 sm:grid-cols-2">
      {orders.map((order) => (
        <OrderCard order={order} key={order.id} />
      ))}
    </ul>
  );
}

function OrderCard({ order }: { order: OrderCardFragment }) {
  if (!order?.id) {
    return null;
  }

  const [legacyOrderId, key] = order.id.split("/").pop().split("?");
  const lineItems = flattenConnection(order?.lineItems);
  const fulfillmentStatus = flattenConnection(order?.fulfillments)[0]?.status;
  const orderLink = key
    ? `/account/orders/${legacyOrderId}?${key}`
    : `/account/orders/${legacyOrderId}`;

  return (
    <li className="flex items-center gap-5 border border-line-subtle p-5 text-center">
      {lineItems[0].image && (
        <Link className="shrink-0" to={orderLink} prefetch="intent">
          <Image
            width={500}
            height={500}
            className="h-auto max-w-36"
            alt={lineItems[0].image?.altText ?? "Order image"}
            src={lineItems[0].image.url}
          />
        </Link>
      )}
      <div
        className={`h-full flex-col justify-center text-left ${
          lineItems[0].image ? "" : "md:col-span-2"
        }`}
      >
        <div className="line-clamp-1 font-medium">
          {lineItems.length > 1
            ? `${lineItems[0].title} +${lineItems.length - 1} more`
            : lineItems[0].title}
        </div>
        <dl className="mt-2 flex flex-col">
          <dt className="sr-only">Order ID</dt>
          <dd>
            <p className="text-body-subtle">Order No. {order.number}</p>
          </dd>
          <dt className="sr-only">Order Date</dt>
          <dd>
            <p className="text-body-subtle">
              {new Date(order.processedAt).toDateString()}
            </p>
          </dd>
          {fulfillmentStatus && (
            <>
              <dt className="sr-only">Fulfillment Status</dt>
              <dd className="mt-3">
                <span className="border bg-gray-100 px-2.5 py-1 font-medium text-xs">
                  {ORDER_STATUS[fulfillmentStatus] || fulfillmentStatus}
                </span>
              </dd>
            </>
          )}
          <Link
            to={orderLink}
            prefetch="intent"
            variant="underline"
            className="mt-3 w-fit text-body-subtle after:bg-body-subtle"
          >
            View details
          </Link>
        </dl>
      </div>
    </li>
  );
}
