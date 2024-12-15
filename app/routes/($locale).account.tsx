import { SignOut } from "@phosphor-icons/react";
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
import type { CustomerDetailsFragment } from "customer-accountapi.generated";
import { Suspense } from "react";
import { AccountDetails } from "~/components/account/account-details";
import { AccountAddressBook } from "~/components/account/address-book";
import { AccountOrderHistory } from "~/components/account/orders";
import { CACHE_NONE, routeHeaders } from "~/data/cache";
import { CUSTOMER_DETAILS_QUERY } from "~/graphql/customer-account/customer-details-query";
import { usePrefixPathWithLocale } from "~/lib/utils";
import { Modal } from "~/modules/modal";
import { ProductSwimlane } from "~/modules/product-swimlane";
import { doLogout } from "./($locale).account_.logout";
import {
  type FeaturedData,
  getFeaturedData,
} from "./($locale).api.featured-items";

export let headers = routeHeaders;

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  let { data, errors } = await context.customerAccount.query(
    CUSTOMER_DETAILS_QUERY
  );

  /**
   * If the customer failed to load, we assume their access token is invalid.
   */
  if (errors?.length || !data?.customer) {
    throw await doLogout(context);
  }

  let customer = data?.customer;

  let heading = customer ? "My Account" : "Account Details";

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
  let data = useLoaderData<typeof loader>();
  let outlet = useOutlet();
  let matches = useMatches();

  // routes that export handle { renderInModal: true }
  let renderOutletInModal = matches.some((match) => {
    let handle = match?.handle as { renderInModal?: boolean };
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
  let orders = flattenConnection(customer.orders);
  let addresses = flattenConnection(customer.addresses);

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
            {(data) => <ProductSwimlane products={data.featuredProducts} />}
          </Await>
        </Suspense>
      )}
    </div>
  );
}
