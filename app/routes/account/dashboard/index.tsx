import { SignOutIcon } from "@phosphor-icons/react";
import { flattenConnection } from "@shopify/hydrogen";
import { Suspense } from "react";
import { Await, Form, useOutletContext } from "react-router";
import { ProductCard } from "~/components/product/product-card";
import { Section } from "~/components/section";
import { Swimlane } from "~/components/swimlane";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { loader as accountLoader } from "../layout";
import { AccountDetails } from "./account-details";
import { AccountAddressBook } from "./address-book";
import { AccountOrderHistory } from "./orders";

export default function AccountDashboard() {
  const { customer, heading, featuredProducts } =
    useOutletContext<Awaited<ReturnType<typeof accountLoader>>["data"]>();
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
            resolve={featuredProducts}
            errorElement="There was a problem loading featured products."
          >
            {({ featuredProducts: products }) => (
              <div className="space-y-8 pt-20">
                <h5>Featured products</h5>
                <Swimlane>
                  {products.nodes.map((product) => (
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
