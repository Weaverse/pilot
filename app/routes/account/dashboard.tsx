import { SignOutIcon } from "@phosphor-icons/react";
import { flattenConnection } from "@shopify/hydrogen";
import type { CustomerDetailsFragment } from "customer-account-api.generated";
import { Suspense } from "react";
import { Await, Form, useOutletContext } from "react-router";
import { AccountDetails } from "~/components/customer/account-details";
import { AccountAddressBook } from "~/components/customer/address-book";
import { AccountOrderHistory } from "~/components/customer/orders";
import { ProductCard } from "~/components/product/product-card";
import { Section } from "~/components/section";
import { Swimlane } from "~/components/swimlane";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { FeaturedData } from "../api/featured-items";

export default function AccountDashboard() {
  const { customer, heading, featuredData } = useOutletContext<{
    customer: CustomerDetailsFragment;
    heading: string;
    featuredData: Promise<FeaturedData>;
  }>();
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
