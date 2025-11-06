import {
  flattenConnection,
  getPaginationVariables,
  Money,
  Pagination,
} from "@shopify/hydrogen";
import type {
  CustomerOrdersFragment,
  OrderItemFragment,
} from "customer-account-api.generated";
import type * as React from "react";
import type { LoaderFunctionArgs } from "react-router";
import { Link, type MetaFunction, useLoaderData } from "react-router";
import { Section } from "~/components/section";

// https://shopify.dev/docs/api/customer/latest/objects/Order
const ORDER_ITEM_FRAGMENT = `#graphql
  fragment OrderItem on Order {
    totalPrice {
      amount
      currencyCode
    }
    financialStatus
    fulfillmentStatus
    fulfillments(first: 1) {
      nodes {
        status
      }
    }
    id
    number
    processedAt
  }
` as const;

// https://shopify.dev/docs/api/customer/latest/objects/Customer
const CUSTOMER_ORDERS_FRAGMENT = `#graphql
  fragment CustomerOrders on Customer {
    orders(
      sortKey: PROCESSED_AT,
      reverse: true,
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...OrderItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        endCursor
        startCursor
      }
    }
  }
  ${ORDER_ITEM_FRAGMENT}
` as const;

// https://shopify.dev/docs/api/customer/latest/queries/customer
const CUSTOMER_ORDERS_QUERY = `#graphql
  ${CUSTOMER_ORDERS_FRAGMENT}
  query CustomerOrders(
    $endCursor: String
    $first: Int
    $last: Int
    $startCursor: String
  ) {
    customer {
      ...CustomerOrders
    }
  }
` as const;

export const meta: MetaFunction = () => {
  return [{ title: "Orders" }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const { data, errors } = await context.customerAccount.query(
    CUSTOMER_ORDERS_QUERY,
    {
      variables: {
        ...paginationVariables,
      },
    },
  );

  if (errors?.length || !data?.customer) {
    throw new Error("Customer orders not found");
  }

  return { customer: data.customer };
}

export default function Orders() {
  const { customer } = useLoaderData<{ customer: CustomerOrdersFragment }>();
  const { orders } = customer;
  return (
    <Section
      width="fixed"
      verticalPadding="medium"
      containerClassName="space-y-10"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <h1 className="h4 font-medium">Orders</h1>
        </div>
        {orders.nodes.length ? (
          <PaginatedOrders connection={orders}>
            {({ node: order }) => <OrderItem key={order.id} order={order} />}
          </PaginatedOrders>
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-body-subtle">
              You haven&apos;t placed any orders yet.
            </p>
            <Link
              to="/collections"
              className="inline-block text-primary underline-offset-4 hover:underline"
            >
              Start Shopping →
            </Link>
          </div>
        )}
      </div>
    </Section>
  );
}

function PaginatedOrders<NodesType>({
  connection,
  children,
  resourcesClassName,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>["connection"];
  children: (props: { node: NodesType; index: number }) => React.ReactNode;
  resourcesClassName?: string;
}) {
  return (
    <Pagination connection={connection}>
      {({ nodes, isLoading, PreviousLink, NextLink }) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({ node, index }),
        );

        return (
          <div className="space-y-6">
            <PreviousLink className="inline-block text-primary text-sm underline-offset-4 hover:underline">
              {isLoading ? "Loading..." : <span>↑ Load previous</span>}
            </PreviousLink>
            {resourcesClassName ? (
              <div className={resourcesClassName}>{resourcesMarkup}</div>
            ) : (
              <div className="space-y-4">{resourcesMarkup}</div>
            )}
            <NextLink className="inline-block text-primary text-sm underline-offset-4 hover:underline">
              {isLoading ? "Loading..." : <span>Load more ↓</span>}
            </NextLink>
          </div>
        );
      }}
    </Pagination>
  );
}

function OrderItem({ order }: { order: OrderItemFragment }) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  const orderId = order.id.split("/").pop();
  return (
    <div className="border border-border p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Link
            to={`/account/orders/${orderId}`}
            className="font-medium text-lg hover:underline"
          >
            Order #{order.number}
          </Link>
          <p className="text-body-subtle text-sm">
            {new Date(order.processedAt).toDateString()}
          </p>
          <div className="flex gap-2 text-sm">
            <span className="rounded-md bg-gray-500 px-2 py-1 text-white">
              {order.financialStatus}
            </span>
            {fulfillmentStatus && (
              <span className="rounded-md bg-gray-500 px-2 py-1 text-white">
                {fulfillmentStatus}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="font-medium text-lg">
            <Money data={order.totalPrice} />
          </div>
          <Link
            to={`/account/orders/${orderId}`}
            className="text-primary text-sm underline-offset-4 hover:underline"
          >
            View Order →
          </Link>
        </div>
      </div>
    </div>
  );
}
