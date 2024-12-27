import type { MetaFunction } from "@remix-run/react";
import { flattenConnection } from "@shopify/hydrogen";
import type { FulfillmentStatus } from "@shopify/hydrogen/customer-account-api-types";
import { type LoaderFunctionArgs, json, redirect } from "@shopify/remix-oxygen";
import type { OrderFragment, OrderQuery } from "customer-account-api.generated";
import { OrderDetails } from "~/components/customer/order-details";

export let meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Order ${data?.order?.name}` }];
};

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  if (!params.id) {
    return redirect(params?.locale ? `${params.locale}/account` : "/account");
  }

  let queryParams = new URL(request.url).searchParams;
  let orderToken = queryParams.get("key");

  try {
    let orderId = orderToken
      ? `gid://shopify/Order/${params.id}?key=${orderToken}`
      : `gid://shopify/Order/${params.id}`;

    let { data, errors } = await context.customerAccount.query<OrderQuery>(
      CUSTOMER_ORDER_QUERY,
      { variables: { orderId } },
    );

    if (errors?.length || !data?.order?.lineItems) {
      throw new Error("Order not found");
    }

    let order: OrderFragment = data.order;
    let lineItems = flattenConnection(order.lineItems);
    let discountApplications = flattenConnection(order.discountApplications);
    let firstDiscount = discountApplications[0]?.value;
    let discountValue =
      firstDiscount?.__typename === "MoneyV2" && firstDiscount;
    let discountPercentage =
      firstDiscount?.__typename === "PricingPercentageValue" &&
      firstDiscount?.percentage;
    let fulfillments = flattenConnection(order.fulfillments);
    let fulfillmentStatus =
      fulfillments.length > 0
        ? fulfillments[0].status
        : ("OPEN" as FulfillmentStatus);

    return json({
      order,
      lineItems,
      discountValue,
      discountPercentage,
      fulfillmentStatus,
    });
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
