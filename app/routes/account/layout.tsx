import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  gql,
  type InferResult,
  type SourceOf,
} from "@shopify/hydrogen/customer-account";
import { clsx } from "clsx";
import type { LoaderFunctionArgs } from "react-router";
import { data, Outlet, useLoaderData, useMatches } from "react-router";
import { Icon } from "~/components/icon";
import Link from "~/components/link";
import { ShopifyInboxOverlayGuard } from "~/components/shopify-inbox";
import { CACHE_NONE, cacheControlHeader, routeHeaders } from "~/utils/cache";
import { getFeaturedProducts } from "~/utils/featured-products";
import AccountDashboard from "./dashboard";

export const headers = routeHeaders;

export async function loader({ context }: LoaderFunctionArgs) {
  const { data: d, errors } = await context.customerAccount.graphql(
    CUSTOMER_DETAILS_QUERY,
  );

  /**
   * If the customer failed to load, we assume their access token is invalid:
   * sign them out (clearing the session) and return them to their market's
   * home page.
   */
  if (errors?.length || !d?.customer) {
    throw await context.customerAccount.logout();
  }

  const customer = d?.customer;
  const heading = customer ? "My Account" : "Account Details";

  return data(
    {
      customer,
      heading,
      featuredProducts: getFeaturedProducts(context.storefront),
    },
    { headers: { "Cache-Control": cacheControlHeader(CACHE_NONE) } },
  );
}

export default function AccountLayout() {
  const loaderData = useLoaderData<typeof loader>();
  const matches = useMatches();

  // routes that export handle { renderInModal: true }
  const renderInModal = matches.find(
    (match: { handle?: { renderInModal?: boolean } }) => {
      const handle = match?.handle;
      return handle?.renderInModal;
    },
  );

  if (renderInModal) {
    return (
      <>
        <Dialog.Root defaultOpen>
          <Dialog.Portal>
            <Dialog.Overlay className="data-[state=open]:animate-fade-in fixed inset-0 z-10 bg-black/50" />
            <Dialog.Content
              onCloseAutoFocus={(e) => e.preventDefault()}
              className={clsx([
                "fixed inset-0 z-10 w-screen p-4",
                "flex items-center justify-center",
                "[--slide-up-from:20px]",
                "data-[state=open]:animate-slide-up",
              ])}
              aria-describedby={undefined}
            >
              <ShopifyInboxOverlayGuard />
              <div className="bg-background relative w-125 max-w-[90vw] rounded-lg px-6 py-3">
                <VisuallyHidden.Root asChild>
                  <Dialog.Title>Account modal</Dialog.Title>
                </VisuallyHidden.Root>
                <Outlet context={loaderData} />
                <Dialog.Close asChild>
                  <Link
                    to="/account"
                    className="absolute top-5 right-4 p-2"
                    aria-label="Close account modal"
                  >
                    <Icon name="x" className="h-4 w-4" />
                  </Link>
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
        <AccountDashboard />
      </>
    );
  }
  return <Outlet context={loaderData} />;
}

const ORDER_CARD_FRAGMENT = gql(`#graphql
  fragment OrderCard on Order {
    id
    number
    processedAt
    financialStatus
    fulfillmentStatus
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
`);

const ADDRESS_PARTIAL_FRAGMENT = gql(`#graphql
  fragment AddressPartial on CustomerAddress {
    id
    formatted
    firstName
    lastName
    company
    address1
    address2
    countryCode
    zoneCode
    city
    zip
    phoneNumber
  }
`);

const CUSTOMER_DETAILS_FRAGMENT = gql(
  `#graphql
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
`,
  [ADDRESS_PARTIAL_FRAGMENT, ORDER_CARD_FRAGMENT],
);

// `$language` is filled from the request's market by the client.
const CUSTOMER_DETAILS_QUERY = gql(
  `#graphql
  query CustomerDetails($language: LanguageCode) @inContext(language: $language) {
    customer {
      ...CustomerDetails
    }
  }
`,
  [CUSTOMER_DETAILS_FRAGMENT],
);

type CustomerDetailsQuery = InferResult<
  SourceOf<typeof CUSTOMER_DETAILS_QUERY>
>;
/** The signed-in customer, as the account layout loads it. */
export type CustomerDetailsFragment = NonNullable<
  CustomerDetailsQuery["customer"]
>;
export type AddressPartialFragment = NonNullable<
  CustomerDetailsFragment["defaultAddress"]
>;
export type OrderCardFragment =
  CustomerDetailsFragment["orders"]["edges"][number]["node"];
