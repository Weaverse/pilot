import { XIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { CacheNone, generateCacheControlHeader } from "@shopify/hydrogen";
import { clsx } from "clsx";
import type { CustomerDetailsQuery } from "customer-account-api.generated";
import type { LoaderFunctionArgs } from "react-router";
import { data, Outlet, useLoaderData, useMatches } from "react-router";
import Link from "~/components/link";
import { routeHeaders } from "~/utils/cache";
import { getFeaturedProducts } from "~/utils/featured-products";
import { doLogout } from "./auth/logout";
import AccountDashboard from "./dashboard";

export const headers = routeHeaders;

export async function loader({ context }: LoaderFunctionArgs) {
  const { data: d, errors } =
    await context.customerAccount.query<CustomerDetailsQuery>(
      CUSTOMER_DETAILS_QUERY,
      {
        variables: {
          language: context.customerAccount.i18n.language,
        },
      },
    );

  /**
   * If the customer failed to load, we assume their access token is invalid.
   */
  if (errors?.length || !d?.customer) {
    throw await doLogout(context);
  }

  const customer = d?.customer;
  const heading = customer ? "My Account" : "Account Details";

  return data(
    {
      customer,
      heading,
      featuredProducts: getFeaturedProducts(context.storefront),
    },
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
      <>
        <Dialog.Root defaultOpen>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-10 bg-black/50 data-[state=open]:animate-fade-in" />
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
              <div className="relative w-[500px] max-w-[90vw] bg-background px-6 py-3">
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
                    <XIcon className="h-4 w-4" />
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

const CUSTOMER_DETAILS_QUERY = `#graphql
  query CustomerDetails($language: LanguageCode) @inContext(language: $language) {
    customer {
      ...CustomerDetails
    }
  }
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
