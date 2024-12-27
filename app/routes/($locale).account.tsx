import { SignOut } from "@phosphor-icons/react";
import {
  Await,
  Form,
  Outlet,
  useLoaderData,
  useMatches,
  useOutlet,
} from "@remix-run/react";
import {
  CacheNone,
  flattenConnection,
  generateCacheControlHeader,
} from "@shopify/hydrogen";
import { type LoaderFunctionArgs, defer } from "@shopify/remix-oxygen";
import type {
  CustomerDetailsFragment,
  CustomerDetailsQuery,
} from "customer-account-api.generated";
import { Suspense } from "react";
import { AccountDetails } from "~/components/customer/account-details";
import { AccountAddressBook } from "~/components/customer/address-book";
import { AccountOrderHistory } from "~/components/customer/orders";
import { OutletModal } from "~/components/customer/outlet-modal";
import { ProductCard } from "~/components/product/product-card";
import { Section } from "~/components/section";
import { Swimlane } from "~/components/swimlane";
import { routeHeaders } from "~/utils/cache";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
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
    { headers: { "Cache-Control": generateCacheControlHeader(CacheNone()) } },
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
      <div className="space-y-4">
        <h1 className="h4 font-medium">{heading}</h1>
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
      {orders ? <AccountOrderHistory orders={orders} /> : null}
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

// NOTE: https://shopify.dev/docs/api/customer/latest/queries/customer
export const CUSTOMER_DETAILS_QUERY = `#graphql
  query CustomerDetails {
    customer {
      ...CustomerDetails
    }
  }
  fragment OrderCard on Order {
    id
    number
    processedAt
    financialStatus
    fulfillments(first: 1) {
      nodes {
        status
      }
    }
    totalPrice {
      amount
      currencyCode
    }
    lineItems(first: 2) {
      edges {
        node {
          title
          image {
            altText
            height
            url
            width
          }
        }
      }
    }
  }

  fragment AddressPartial on CustomerAddress {
    id
    formatted
    firstName
    lastName
    company
    address1
    address2
    territoryCode
    zoneCode
    city
    zip
    phoneNumber
  }

  fragment CustomerDetails on Customer {
    firstName
    lastName
    phoneNumber {
      phoneNumber
    }
    emailAddress {
      emailAddress
    }
    defaultAddress {
      ...AddressPartial
    }
    addresses(first: 6) {
      edges {
        node {
          ...AddressPartial
        }
      }
    }
    orders(first: 250, sortKey: PROCESSED_AT, reverse: true) {
      edges {
        node {
          ...OrderCard
        }
      }
    }
  }
` as const;
