import {
  Analytics,
  CartForm,
  type CartQueryDataReturn,
} from "@shopify/hydrogen";
import type {
  CartBuyerIdentityInput,
  CartLineInput,
  CartLineUpdateInput,
  CountryCode,
} from "@shopify/hydrogen/storefront-api-types";
import { Suspense } from "react";
import {
  type ActionFunctionArgs,
  Await,
  data,
  type LoaderFunctionArgs,
  redirect,
  useLoaderData,
} from "react-router";
import invariant from "tiny-invariant";
import { CartMain } from "~/components/cart/cart-main";
import { useCart, useCartStore } from "~/components/cart/store";
import { ProductCard } from "~/components/product-card";
import { Section } from "~/components/section";
import { Swimlane } from "~/components/swimlane";
import { COUNTRIES, getLocalePrefixFromPath } from "~/utils/const";
import { getFeaturedProducts } from "~/utils/featured-products";

export async function action({ request, context }: ActionFunctionArgs) {
  const { cart, storefront } = context;
  const formData = await request.formData();
  const { action: cartFormAction, inputs } = CartForm.getFormInput(formData);

  invariant(cartFormAction, "No cartAction defined");

  const status = 200;
  let result: CartQueryDataReturn;
  const countryCode = getCountryCodeFromRequestOrReferer(
    request,
    storefront.i18n.country,
  );
  const localeBuyerIdentity: CartBuyerIdentityInput = {
    countryCode,
  };

  async function syncCartBuyerIdentityToLocale() {
    if (!cart.getCartId()) {
      return;
    }
    const syncResult = await cart.updateBuyerIdentity(localeBuyerIdentity);
    return syncResult?.cart?.id ? { cartId: syncResult.cart.id } : undefined;
  }

  switch (cartFormAction) {
    case CartForm.ACTIONS.LinesAdd: {
      const lines = getCartLineInputs(inputs.lines as CartLineInput[]);
      if (!cart.getCartId()) {
        result = await cart.create({
          lines,
          buyerIdentity: localeBuyerIdentity,
        });
      } else {
        const cartOptions = await syncCartBuyerIdentityToLocale();
        result = await cart.addLines(lines, cartOptions);
      }
      break;
    }
    case CartForm.ACTIONS.LinesUpdate: {
      const cartOptions = await syncCartBuyerIdentityToLocale();
      result = await cart.updateLines(
        inputs.lines as CartLineUpdateInput[],
        cartOptions,
      );
      break;
    }
    case CartForm.ACTIONS.LinesRemove: {
      const cartOptions = await syncCartBuyerIdentityToLocale();
      result = await cart.removeLines(inputs.lineIds as string[], cartOptions);
      break;
    }
    case CartForm.ACTIONS.NoteUpdate: {
      const cartOptions = await syncCartBuyerIdentityToLocale();
      const cartNote = inputs.cartNote as string;
      if (cartNote) {
        result = await cart.updateNote(cartNote, cartOptions);
      }
      break;
    }
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const cartOptions = await syncCartBuyerIdentityToLocale();
      const formDiscountCode = inputs.discountCode;
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];
      discountCodes.push(...(inputs.discountCodes as string[]));
      result = await cart.updateDiscountCodes(discountCodes, cartOptions);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesAdd: {
      const cartOptions = await syncCartBuyerIdentityToLocale();
      const giftCardCodes = (inputs.giftCardCodes as string[]) || [];
      result = await cart.addGiftCardCodes(giftCardCodes, cartOptions);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesUpdate: {
      const cartOptions = await syncCartBuyerIdentityToLocale();
      // Backward compatibility: same as add gift card codes
      const giftCardCodes = (inputs.giftCardCodes as string[]) || [];
      result = await cart.addGiftCardCodes(giftCardCodes, cartOptions);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesRemove: {
      const cartOptions = await syncCartBuyerIdentityToLocale();
      const giftCardIds = inputs.giftCardCodes as string[];
      result = await cart.removeGiftCardCodes(giftCardIds, cartOptions);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate:
      result = await cart.updateBuyerIdentity({
        ...localeBuyerIdentity,
        ...(inputs.buyerIdentity as CartBuyerIdentityInput),
      });
      break;
    default:
      invariant(false, `${cartFormAction} cart action is not defined`);
  }

  let headers = {};
  if (result?.cart?.id) {
    headers = cart.setCartId(result.cart.id);
  }

  const redirectTo = formData.get("redirectTo") ?? null;
  if (typeof redirectTo === "string" && isLocalPath(redirectTo)) {
    return redirect(redirectTo);
  }

  const { cart: cartResult, errors, userErrors } = result || {};

  return data({ cart: cartResult, userErrors, errors }, { status, headers });
}

export async function loader({ context }: LoaderFunctionArgs) {
  const { cart, storefront } = context;

  return {
    cart: await cart.get(),
    featuredProducts: getFeaturedProducts(storefront),
  };
}

export default function CartRoute() {
  const { featuredProducts } = useLoaderData<typeof loader>();
  const cart = useCart();
  // <Analytics.CartView> publishes once per URL and never replays when the
  // provider's cart context updates later. Gate it on a unique bootstrap
  // request token rather than React Router's history key: back/forward can
  // revisit a previous key, but the cart must be revalidated for this visit.
  const requestToken = useCartStore((s) => s.cartBootstrapRequestToken);
  const responseToken = useCartStore((s) => s.cartBootstrapResponseToken);
  const canPublishCartView =
    requestToken !== null && responseToken === requestToken;
  return (
    <>
      <Section width="fixed" verticalPadding="medium" overflow="unset">
        <h1 className="h3 mb-8 text-center md:mb-16">
          Cart ({cart?.totalQuantity || 0})
        </h1>
        <CartMain layout="page" cart={cart} />
        {canPublishCartView && <Analytics.CartView />}
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

function getCartLineInputs(lines: CartLineInput[]): CartLineInput[] {
  return lines.map(
    ({ attributes, merchandiseId, parent, quantity, sellingPlanId }) => ({
      attributes,
      merchandiseId,
      parent,
      quantity,
      sellingPlanId,
    }),
  );
}
function getCountryCodeFromRequestOrReferer(
  request: Request,
  fallbackCountryCode: CountryCode,
) {
  return (
    getCountryCodeFromUrl(request.url) ??
    getCountryCodeFromUrl(request.headers.get("Referer")) ??
    fallbackCountryCode
  );
}

function getCountryCodeFromUrl(url: string | null) {
  if (!url) {
    return;
  }

  try {
    const { pathname } = new URL(url);
    const prefix = getLocalePrefixFromPath(pathname);
    return COUNTRIES[prefix]?.country as CountryCode | undefined;
  } catch {
    return;
  }
}

function isLocalPath(url: string) {
  try {
    new URL(url);
  } catch (e) {
    return true;
  }
  return false;
}
