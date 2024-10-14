import { Image, flattenConnection } from "@shopify/hydrogen";
import type { OrderCardFragment } from "customer-accountapi.generated";
import { Link } from "~/components/link";
import { statusMessage } from "~/lib/utils";

export function OrderCard({ order }: { order: OrderCardFragment }) {
  if (!order?.id) return null;
  const [legacyOrderId, key] = order!.id!.split("/").pop()!.split("?");
  const lineItems = flattenConnection(order?.lineItems);
  const fulfillmentStatus = flattenConnection(order?.fulfillments)[0]?.status;
  const orderLink = key
    ? `/account/orders/${legacyOrderId}?${key}`
    : `/account/orders/${legacyOrderId}`;
  return (
    <li className="flex text-center border border-[#B7B7B7] rounded-sm items-center gap-5 p-5">
      {lineItems[0].image && (
        <Link className="shrink-0" to={orderLink} prefetch="intent">
          <div className="card-image aspect-square bg-background/5">
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
            <p className="text-body/50">Order No. {order.number}</p>
          </dd>
          <dt className="sr-only">Order Date</dt>
          <dd>
            <p className="text-body/50">
              {new Date(order.processedAt).toDateString()}
            </p>
          </dd>
          {fulfillmentStatus && (
            <>
              <dt className="sr-only">Fulfillment Status</dt>
              <dd className="mt-3">
                <span
                  className={`px-2.5 py-1 text-xs font-medium border bg-background/5`}
                >
                  {statusMessage(fulfillmentStatus)}
                </span>
              </dd>
            </>
          )}
          <Link
            className="mt-3 text-body/50 underline"
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

export const ORDER_CARD_FRAGMENT = `#graphql
  fragment OrderCard on Order {
    id
    orderNumber
    processedAt
    financialStatus
    fulfillmentStatus
    currentTotalPrice {
      amount
      currencyCode
    }
    lineItems(first: 2) {
      edges {
        node {
          variant {
            image {
              url
              altText
              height
              width
            }
          }
          title
        }
      }
    }
  }
`;
