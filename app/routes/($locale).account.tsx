import { SignOutIcon } from "@phosphor-icons/react";
import {
  CacheNone,
  flattenConnection,
  generateCacheControlHeader,
} from "@shopify/hydrogen";
import { data, type LoaderFunctionArgs } from "@shopify/remix-oxygen";
import type {
  CustomerDetailsFragment,
  CustomerDetailsQuery,
} from "customer-account-api.generated";
import { Suspense } from "react";
import {
  Await,
  Form,
  Outlet,
  useLoaderData,
  useMatches,
  useOutlet,
} from "react-router";
import { AccountDetails } from "~/components/customer/account-details";
import { AccountAddressBook } from "~/components/customer/address-book";
import { AccountOrderHistory } from "~/components/customer/orders";
import { OutletModal } from "~/components/customer/outlet-modal";
import { ProductCard } from "~/components/product/product-card";
import { Section } from "~/components/section";
import { Swimlane } from "~/components/swimlane";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import { routeHeaders } from "~/utils/cache";
import { doLogout } from "./($locale).account_.logout";
import {
  type FeaturedData,
  getFeaturedData,
} from "./($locale).api.featured-items";

export const headers = routeHeaders;

export async function loader({ context }: LoaderFunctionArgs) {
  const { data: d, errors } =
    await context.customerAccount.query<CustomerDetailsQuery>(
      CUSTOMER_DETAILS_QUERY,
    );

  /**
   * If the customer failed to load, we assume their access token is invalid.
   */
  if (errors?.length || !d?.customer) {
    throw await doLogout(context);
  }

  const customer = d?.customer;
  const heading = customer ? "My Account" : "Account Details";
  const featuredData = getFeaturedData(context.storefront);

  return data(
    { customer, heading, featuredData },
    { headers: { "Cache-Control": generateCacheControlHeader(CacheNone()) } },
  );
}

export default function Authenticated() {
  const loaderData = useLoaderData<typeof loader>();
  const outlet = useOutlet();
  const matches = useMatches();

  // routes that export handle { renderInModal: true }
  const renderInModal = matches.find(
    (match: { handle?: { renderInModal?: boolean } }) => {
      const handle = match?.handle;
      return handle?.renderInModal;
    },
  );

  if (outlet) {
    if (renderInModal) {
      return (
        <>
          <OutletModal cancelLink="/account">
            <Outlet context={{ customer: loaderData.customer }} />
          </OutletModal>
          <Account {...loaderData} customer={loaderData.customer} />
        </>
      );
    }
    return <Outlet context={{ customer: loaderData.customer }} />;
  }

  return <Account {...loaderData} customer={loaderData.customer} />;
}

interface AccountType {
  customer: CustomerDetailsFragment;
  featuredData: Promise<FeaturedData>;
  heading: string;
}

function Account({ customer, heading, featuredData }: AccountType) {
  const orders = flattenConnection(customer.orders);
  const addresses = flattenConnection(customer.addresses);

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
            className="group flex items-center gap-2 text-body-subtle"
          >
            <SignOutIcon className="h-4 w-4" />
            <span className="underline-offset-4 group-hover:underline">
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
                      className="w-80 snap-start"
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
