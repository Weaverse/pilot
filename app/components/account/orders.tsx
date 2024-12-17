import { Image, flattenConnection } from "@shopify/hydrogen";
import type { OrderCardFragment } from "customer-accountapi.generated";
import Link from "~/components/link";
import { statusMessage, usePrefixPathWithLocale } from "~/lib/utils";
import { Text } from "~/modules/text";

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
  return (
    <div>
      <Text className="mb-1" size="fine" width="narrow" as="p">
        You haven&apos;t placed any orders yet.
      </Text>
      <div className="w-48">
        <Link className="w-full mt-2 text-sm" to={usePrefixPathWithLocale("/")}>
          Start Shopping
        </Link>
      </div>
    </div>
  );
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

  let [legacyOrderId, key] = order!.id!.split("/").pop()!.split("?");
  let lineItems = flattenConnection(order?.lineItems);
  let fulfillmentStatus = flattenConnection(order?.fulfillments)[0]?.status;
  let orderLink = key
    ? `/account/orders/${legacyOrderId}?${key}`
    : `/account/orders/${legacyOrderId}`;

  return (
    <li className="flex text-center border border-[#B7B7B7] rounded-sm items-center gap-5 p-5">
      {lineItems[0].image && (
        <Link className="shrink-0" to={orderLink} prefetch="intent">
          <div className="card-image aspect-square">
            <Image
              width={140}
              height={140}
              className="w-full opacity-0 animate-fade-in cover"
              alt={lineItems[0].image?.altText ?? "Order image"}
              src={lineItems[0].image.url}
            />
          </div>
        </Link>
      )}
      <div
        className={`h-full flex-col justify-center text-left ${
          !lineItems[0].image ? "md:col-span-2" : ""
        }`}
      >
        {/* <Heading as="h3" format size="copy">
            {lineItems.length > 1
              ? `${lineItems[0].title} +${lineItems.length - 1} more`
              : lineItems[0].title}
          </Heading> */}
        <p className="font-medium line-clamp-1">
          {lineItems.length > 1
            ? `${lineItems[0].title} +${lineItems.length - 1} more`
            : lineItems[0].title}
        </p>
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
                  {statusMessage(fulfillmentStatus)}
                </span>
              </dd>
            </>
          )}
          <Link
            className="mt-3 text-body-subtle underline"
            to={orderLink}
            prefetch="intent"
          >
            View details
          </Link>
        </dl>
      </div>
    </li>
  );
}
