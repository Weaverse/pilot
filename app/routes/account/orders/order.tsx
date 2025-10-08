import { flattenConnection } from "@shopify/hydrogen";
import type { FulfillmentStatus } from "@shopify/hydrogen/customer-account-api-types";
import { type LoaderFunctionArgs, redirect } from "@shopify/remix-oxygen";
import type { OrderFragment, OrderQuery } from "customer-account-api.generated";
import type { MetaFunction } from "react-router";
// biome-ignore lint/style/noExportedImports: <explanation> --- IGNORE ---
import { OrderDetails } from "~/components/customer/order-details";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Order ${data?.order?.name}` }];
};

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  if (!params.id) {
    return redirect(params?.locale ? `${params.locale}/account` : "/account");
  }

  const queryParams = new URL(request.url).searchParams;
  const orderToken = queryParams.get("key");

  try {
    const orderId = orderToken
      ? `gid://shopify/Order/${params.id}?key=${orderToken}`
      : `gid://shopify/Order/${params.id}`;

    const { data, errors } = await context.customerAccount.query<OrderQuery>(
      CUSTOMER_ORDER_QUERY,
      { variables: { orderId } },
    );

    if (errors?.length || !data?.order?.lineItems) {
      throw new Error("Order not found");
    }

    const order: OrderFragment = data.order;
    const lineItems = flattenConnection(order.lineItems);
    const discountApplications = flattenConnection(order.discountApplications);
    const firstDiscount = discountApplications[0]?.value;
    const discountValue =
      firstDiscount?.__typename === "MoneyV2" && firstDiscount;
    const discountPercentage =
      firstDiscount?.__typename === "PricingPercentageValue" &&
      firstDiscount?.percentage;
    const fulfillments = flattenConnection(order.fulfillments);
    const fulfillmentStatus =
      fulfillments.length > 0
        ? fulfillments[0].status
        : ("OPEN" as FulfillmentStatus);

    return {
      order,
      lineItems,
      discountValue,
      discountPercentage,
      fulfillmentStatus,
    };
  } catch (error) {
    throw new Response(error instanceof Error ? error.message : undefined, {
      status: 404,
    });
  }
}

export default OrderDetails;

// NOTE: https://shopify.dev/docs/api/customer/latest/queries/order
const CUSTOMER_ORDER_QUERY = `#graphql
  fragment OrderMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment DiscountApplication on DiscountApplication {
    ... on AutomaticDiscountApplication {
      title
    }
    ... on DiscountCodeApplication {
      code
    }
    value {
      __typename
      ... on MoneyV2 {
        ...OrderMoney
      }
      ... on PricingPercentageValue {
        percentage
      }
    }
  }
  fragment OrderLineItemFull on LineItem {
    id
    title
    quantity
    price {
      ...OrderMoney
    }
    currentTotalPrice {
      ...OrderMoney
    }
    totalPrice {
      ...OrderMoney
    }
    discountAllocations {
      allocatedAmount {
        ...OrderMoney
      }
      discountApplication {
        ...DiscountApplication
      }
    }
    totalDiscount {
      ...OrderMoney
    }
    image {
      altText
      height
      url
      id
      width
    }
    variantTitle
  }
  fragment Order on Order {
    id
    name
    statusPageUrl
    processedAt
    fulfillments(first: 1) {
      nodes {
        status
      }
    }
    totalTax {
      ...OrderMoney
    }
    totalPrice {
      ...OrderMoney
    }
    subtotal {
      ...OrderMoney
    }
    totalShipping {
      ...OrderMoney
    }
    shippingAddress {
      name
      formatted(withName: true)
      formattedArea
    }
    discountApplications(first: 100) {
      nodes {
        ...DiscountApplication
      }
    }
    lineItems(first: 100) {
      nodes {
        ...OrderLineItemFull
      }
    }
  }
  query Order($orderId: ID!) {
    order(id: $orderId) {
      ... on Order {
        ...Order
      }
    }
  }
` as const;
