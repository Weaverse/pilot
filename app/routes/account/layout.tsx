import { CacheNone, generateCacheControlHeader } from "@shopify/hydrogen";
import { data, type LoaderFunctionArgs } from "@shopify/remix-oxygen";
import type { CustomerDetailsQuery } from "customer-account-api.generated";
import { Outlet, useLoaderData, useMatches } from "react-router";
import { OutletModal } from "~/components/customer/outlet-modal";
import { routeHeaders } from "~/utils/cache";
import { getFeaturedData } from "../api/featured-items";
import { doLogout } from "./logout";

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
      <OutletModal cancelLink="/account">
        <Outlet context={loaderData} />
      </OutletModal>
    );
  }

  return <Outlet context={loaderData} />;
}

// NOTE: https://shopify.dev/docs/api/customer/latest/queries/customer
const CUSTOMER_DETAILS_QUERY = `#graphql
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
