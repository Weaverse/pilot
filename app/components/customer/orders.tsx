import { flattenConnection } from "@shopify/hydrogen";
import { Image } from "~/components/image";
import type { FulfillmentStatus } from "@shopify/hydrogen/customer-account-api-types";
import type { OrderCardFragment } from "customer-account-api.generated";
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
    <ul className="grid grid-flow-row grid-cols-1 gap-5 false sm:grid-cols-2">
      {orders.map((order) => (
        <OrderCard order={order} key={order.id} />
      ))}
    </ul>
  );
}

function OrderCard({ order }: { order: OrderCardFragment }) {
  if (!order?.id) return null;

  let [legacyOrderId, key] = order.id.split("/").pop().split("?");
  let lineItems = flattenConnection(order?.lineItems);
  let fulfillmentStatus = flattenConnection(order?.fulfillments)[0]?.status;
  let orderLink = key
    ? `/account/orders/${legacyOrderId}?${key}`
    : `/account/orders/${legacyOrderId}`;

  return (
    <li className="flex text-center border border-line-subtle items-center gap-5 p-5">
      {lineItems[0].image && (
        <Link className="shrink-0" to={orderLink} prefetch="intent">
          <Image
            width={500}
            height={500}
            className="max-w-36 h-auto"
            alt={lineItems[0].image?.altText ?? "Order image"}
            src={lineItems[0].image.url}
          />
        </Link>
      )}
      <div
        className={`h-full flex-col justify-center text-left ${
          !lineItems[0].image ? "md:col-span-2" : ""
        }`}
      >
        <div className="font-medium line-clamp-1">
          {lineItems.length > 1
            ? `${lineItems[0].title} +${lineItems.length - 1} more`
            : lineItems[0].title}
        </div>
        <dl className="flex flex-col mt-2">
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
                <span className="px-2.5 py-1 text-xs font-medium border bg-gray-100">
                  {ORDER_STATUS[fulfillmentStatus] || fulfillmentStatus}
                </span>
              </dd>
            </>
          )}
          <Link
            to={orderLink}
            prefetch="intent"
            variant="underline"
            className="mt-3 text-body-subtle w-fit after:bg-body-subtle"
          >
            View details
          </Link>
        </dl>
      </div>
    </li>
  );
}
