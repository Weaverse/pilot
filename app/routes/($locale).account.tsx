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
import type {
  CustomerDetailsFragment,
  CustomerDetailsQuery,
} from "customer-accountapi.generated";
import { Suspense } from "react";
import { AccountDetails } from "~/components/account/account-details";
import { AccountAddressBook } from "~/components/account/address-book";
import { AccountOrderHistory } from "~/components/account/orders";
import { OutletModal } from "~/components/account/outlet-modal";
import { ProductCard } from "~/components/product/product-card";
import { Section } from "~/components/section";
import { Swimlane } from "~/components/swimlane";
import { CACHE_NONE, routeHeaders } from "~/data/cache";
import { CUSTOMER_DETAILS_QUERY } from "~/graphql/customer-account/customer-details-query";
import { usePrefixPathWithLocale } from "~/lib/utils";
import { doLogout } from "./($locale).account_.logout";
import {
  type FeaturedData,
  getFeaturedData,
} from "./($locale).api.featured-items";

export let headers = routeHeaders;

export async function loader({ context }: LoaderFunctionArgs) {
  let { data, errors } =
    await context.customerAccount.query<CustomerDetailsQuery>(
      CUSTOMER_DETAILS_QUERY,
    );

  /**
   * If the customer failed to load, we assume their access token is invalid.
   */
  if (errors?.length || !data?.customer) {
    throw await doLogout(context);
  }

  let customer = data?.customer;
  let heading = customer ? "My Account" : "Account Details";
  let featuredData = getFeaturedData(context.storefront);

  return defer(
    { customer, heading, featuredData },
    { headers: { "Cache-Control": CACHE_NONE } },
  );
}

export default function Authenticated() {
  let data = useLoaderData<typeof loader>();
  let outlet = useOutlet();
  let matches = useMatches();

  // routes that export handle { renderInModal: true }
  let renderInModal = matches.find(
    (match: { handle?: { renderInModal?: boolean } }) => {
      let handle = match?.handle;
      return handle?.renderInModal;
    },
  );

  if (outlet) {
    if (renderInModal) {
      return (
        <>
          <OutletModal cancelLink="/account">
            <Outlet context={{ customer: data.customer }} />
          </OutletModal>
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
  featuredData: Promise<FeaturedData>;
  heading: string;
}

function Account({ customer, heading, featuredData }: AccountType) {
  let orders = flattenConnection(customer.orders);
  let addresses = flattenConnection(customer.addresses);

  return (
    <Section
      width="fixed"
      verticalPadding="medium"
      containerClassName="space-y-10"
    >
      <div className="space-y-8">
        <h2 className="h4 font-medium">{heading}</h2>
        <Form method="post" action={usePrefixPathWithLocale("/account/logout")}>
          <button
            type="submit"
            className="text-body-subtle group flex gap-2 items-center"
          >
            <SignOut className="w-4 h-4" />
            <span className="group-hover:underline underline-offset-4">
              Sign out
            </span>
          </button>
        </Form>
      </div>
      {orders && <AccountOrderHistory orders={orders} />}
      <AccountDetails customer={customer} />
      <AccountAddressBook addresses={addresses} customer={customer} />
      {!orders.length && (
        <Suspense>
          <Await
            resolve={featuredData}
            errorElement="There was a problem loading featured products."
          >
            {({ featuredProducts }) => (
              <div className="space-y-8 pt-20">
                <h5>Featured products</h5>
                <Swimlane>
                  {featuredProducts.nodes.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      className="snap-start w-80"
                    />
                  ))}
                </Swimlane>
              </div>
            )}
          </Await>
        </Suspense>
      )}
    </Section>
  );
}
