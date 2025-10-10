import { type LoaderFunctionArgs, redirect } from "@shopify/remix-oxygen";
import type { GetShopPrimaryDomainQuery } from "storefront-api.generated";
import invariant from "tiny-invariant";
import { Button } from "~/components/button";
import { Section } from "~/components/section";

/*
 If your online store had active orders before you launched your Hydrogen storefront,
 and the Hydrogen storefront uses the same domain formerly used by the online store,
 then customers will receive 404 pages when they click on the old order status URLs
 that are routing to your Hydrogen storefront. To prevent this, ensure that you redirect
 those requests back to Shopify.
*/
export async function loader({
  request,
  context: { storefront },
}: LoaderFunctionArgs) {
  const { origin } = new URL(request.url);
  const { shop } = await storefront.query<GetShopPrimaryDomainQuery>(
    SHOP_PRIMARY_DOMAIN_QUERY,
    { cache: storefront.CacheLong() },
  );
  invariant(shop, "Error redirecting to the order status URL");
  return redirect(request.url.replace(origin, shop.primaryDomain.url));
}

export default function () {
  return null;
}

export function ErrorBoundary() {
  return (
    <Section width="fixed" verticalPadding="medium">
      <h4 className="mb-8 text-center font-medium text-red-600 lg:mb-20">
        Error redirecting to the order status URL
      </h4>
      <div className="mt-8 flex w-full items-baseline justify-between">
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    </Section>
  );
}

const SHOP_PRIMARY_DOMAIN_QUERY = `#graphql
  query getShopPrimaryDomain {
    shop {
      primaryDomain {
        url
      }
    }
  }
`;
