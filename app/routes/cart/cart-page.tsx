import { Suspense } from "react";
import {
  Await,
  data,
  type LoaderFunctionArgs,
  useLoaderData,
} from "react-router";
import { cartHandlers } from "~/.server/cart";
import { CartErrorBanner } from "~/components/cart/cart-error-banner";
import { CartMain } from "~/components/cart/cart-main";
import { useCart } from "~/components/cart/cart-store";
import { ProductCard } from "~/components/product-card";
import { CartView } from "~/components/root/analytics-views";
import { Section } from "~/components/section";
import { Swimlane } from "~/components/swimlane";
import { routeHeaders } from "~/utils/cache";
import { getFeaturedProducts } from "~/utils/featured-products";

/**
 * Cart changes post to Hydrogen's `/api/cart` (and Pilot's
 * `/api/cart/gift-cards`), which redirect a no-JS form post back here.
 *
 * The cart is read on the server so the page renders the shopper's cart
 * before hydration and without JavaScript. The page is personalized, so it is
 * never cached (`/cart` is also outside Oxygen's full-page cache).
 */
export async function loader({ context, request }: LoaderFunctionArgs) {
  const { storefront } = context;
  const { data: cartData } = await cartHandlers.get({
    storefrontClient: storefront,
    request,
  });

  return data(
    {
      cart: cartData.cart,
      featuredProducts: getFeaturedProducts(storefront),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export const headers = routeHeaders;

export default function CartRoute() {
  const { cart: serverCart, featuredProducts } = useLoaderData<typeof loader>();
  const storeCart = useCart((state) => state.data);
  const loading = useCart((state) => state.loading);
  const cart = (loading && serverCart) || storeCart;
  // `cart_viewed` is published once per visit, from the cart the store loaded
  // after hydration — never from the server snapshot or a half-loaded store.

  return (
    <>
      <Section width="fixed" verticalPadding="medium" overflow="unset">
        <h1 className="h3 mb-8 text-center md:mb-16">
          Cart ({cart.totalQuantity || 0})
        </h1>
        <CartErrorBanner className="mb-6" />
        <CartMain layout="page" serverCart={serverCart} />
        <CartView cart={storeCart} ready={!loading} />
      </Section>
      <Suspense fallback={null}>
        <Await resolve={featuredProducts}>
          {({ featuredProducts: products }) => {
            if (!products?.nodes?.length) {
              return null;
            }
            return (
              <Section width="stretch" verticalPadding="large" gap={32}>
                <h2 className="h4 text-center">More from our best sellers</h2>
                <Swimlane className="gap-4">
                  {products.nodes.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      className="w-80 snap-start"
                    />
                  ))}
                </Swimlane>
              </Section>
            );
          }}
        </Await>
      </Suspense>
    </>
  );
}
