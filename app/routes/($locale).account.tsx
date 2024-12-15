import { SignOut } from "@phosphor-icons/react";
import {
  Await,
  Form,
  Outlet,
  useLoaderData,
  useMatches,
  useOutlet,
} from "@remix-run/react";
import { Image, flattenConnection } from "@shopify/hydrogen";
import { type LoaderFunctionArgs, defer } from "@shopify/remix-oxygen";
import type {
  CustomerDetailsFragment,
  OrderCardFragment,
} from "customer-accountapi.generated";
import { Suspense } from "react";
import Link from "~/components/link";
import { CACHE_NONE, routeHeaders } from "~/data/cache";
import { CUSTOMER_DETAILS_QUERY } from "~/graphql/customer-account/customer-details-query";
import { statusMessage, usePrefixPathWithLocale } from "~/lib/utils";
import { AccountAddressBook } from "~/modules/account-address-book";
import { AccountDetails } from "~/modules/account-details";
import { Modal } from "~/modules/modal";
import { ProductSwimlane } from "~/modules/product-swimlane";
import { Text } from "~/modules/text";
import { doLogout } from "./($locale).account_.logout";
import {
  type FeaturedData,
  getFeaturedData,
} from "./($locale).api.featured-items";

export const headers = routeHeaders;

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const { data, errors } = await context.customerAccount.query(
    CUSTOMER_DETAILS_QUERY
  );

  /**
   * If the customer failed to load, we assume their access token is invalid.
   */
  if (errors?.length || !data?.customer) {
    throw await doLogout(context);
  }

  const customer = data?.customer;

  const heading = customer ? "My Account" : "Account Details";

  return defer(
    {
      customer,
      heading,
      featuredDataPromise: getFeaturedData(context.storefront),
    },
    {
      headers: {
        "Cache-Control": CACHE_NONE,
      },
    }
  );
}

export default function Authenticated() {
  const data = useLoaderData<typeof loader>();
  const outlet = useOutlet();
  const matches = useMatches();

  // routes that export handle { renderInModal: true }
  const renderOutletInModal = matches.some((match) => {
    const handle = match?.handle as { renderInModal?: boolean };
    return handle?.renderInModal;
  });

  if (outlet) {
    if (renderOutletInModal) {
      return (
        <>
          <Modal cancelLink="/account">
            <Outlet context={{ customer: data.customer }} />
          </Modal>
          <Account {...data} customer={data.customer} />
        </>
      );
    }
    return <Outlet context={{ customer: data.customer }} />;
  }

  return <Account {...data} customer={data.customer} />;
}

interface AccountType {
  customer: CustomerDetailsFragment;
  featuredDataPromise: Promise<FeaturedData>;
  heading: string;
}

function Account({ customer, heading, featuredDataPromise }: AccountType) {
  const orders = flattenConnection(customer.orders);
  const addresses = flattenConnection(customer.addresses);

  return (
    <div className="max-w-5xl px-4 mx-auto py-10 space-y-10">
      <div className="space-y-8">
        <h2 className="h4">{heading}</h2>
        <Form method="post" action={usePrefixPathWithLocale("/account/logout")}>
          <button
            type="submit"
            className="text-body-subtle group flex gap-2 items-center"
          >
            <SignOut className="w-4 h-4" />
            <span className="group-hover:underline">Sign out</span>
          </button>
        </Form>
      </div>
      {orders && <AccountOrderHistory orders={orders} />}
      <AccountDetails customer={customer} />
      <AccountAddressBook addresses={addresses} customer={customer} />
      {!orders.length && (
        <Suspense>
          <Await
            resolve={featuredDataPromise}
            errorElement="There was a problem loading featured products."
          >
            {(data) => (
              <>
                <ProductSwimlane products={data.featuredProducts} />
              </>
            )}
          </Await>
        </Suspense>
      )}
    </div>
  );
}

type OrderCardsProps = {
  orders: OrderCardFragment[];
};

function AccountOrderHistory({ orders }: OrderCardsProps) {
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

export function OrderCard({ order }: { order: OrderCardFragment }) {
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
