import {
  Await,
  Form,
  Outlet,
  useLoaderData,
  useMatches,
  useOutlet,
} from "@remix-run/react";
import { flattenConnection } from "@shopify/hydrogen";
import { type LoaderFunctionArgs, defer } from "@shopify/remix-oxygen";
import type {
  CustomerDetailsFragment,
  OrderCardFragment,
} from "customer-accountapi.generated";
import { Suspense } from "react";
import { IconSignOut } from "~/components/icons";
import { CACHE_NONE, routeHeaders } from "~/data/cache";
import { CUSTOMER_DETAILS_QUERY } from "~/graphql/customer-account/customer-details-query";
import { usePrefixPathWithLocale } from "~/lib/utils";
import { AccountAddressBook } from "~/modules/account-address-book";
import { AccountDetails } from "~/modules/account-details";
import { Modal } from "~/modules/modal";
import { OrderCard } from "~/modules/order-card";
import { ProductSwimlane } from "~/modules/product-swimlane";
import { Text } from "~/modules/text";
import { doLogout } from "./($locale).account_.logout";
import {
  type FeaturedData,
  getFeaturedData,
} from "./($locale).api.featured-items";
import Button from "~/components/button";

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
            className="text-body/50 group flex gap-2 items-center"
          >
            <IconSignOut className="w-4 h-4" />
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
      {/* {orders?.length ? <Orders orders={orders} /> : <EmptyOrders />} */}
      <EmptyOrders />
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
        <Button
          className="w-full mt-2 text-sm"
          link={usePrefixPathWithLocale("/")}
        >
          Start Shopping
        </Button>
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
