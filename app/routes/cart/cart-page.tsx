import {
  Analytics,
  CartForm,
  type CartQueryDataReturn,
} from "@shopify/hydrogen";
import type {
  CartBuyerIdentityInput,
  CartLineInput,
  CartLineUpdateInput,
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
import { ProductCard } from "~/components/product/product-card";
import { Section } from "~/components/section";
import { Swimlane } from "~/components/swimlane";
import { getFeaturedProducts } from "~/utils/featured-products";

export async function action({ request, context }: ActionFunctionArgs) {
  const { cart } = context;
  const formData = await request.formData();
  const { action: cartFormAction, inputs } = CartForm.getFormInput(formData);

  invariant(cartFormAction, "No cartAction defined");

  const status = 200;
  let result: CartQueryDataReturn;

  switch (cartFormAction) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines as CartLineInput[]);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines as CartLineUpdateInput[]);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds as string[]);
      break;
    case CartForm.ACTIONS.NoteUpdate: {
      const cartNote = inputs.cartNote as string;
      if (cartNote) {
        result = await cart.updateNote(cartNote);
      }
      break;
    }
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];
      discountCodes.push(...(inputs.discountCodes as string[]));
      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesAdd: {
      const giftCardCodes = (inputs.giftCardCodes as string[]) || [];
      result = await cart.addGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesUpdate: {
      // Legacy support - redirects to Add
      const giftCardCodes = (inputs.giftCardCodes as string[]) || [];
      result = await cart.addGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesRemove: {
      const giftCardIds = inputs.giftCardCodes as string[];
      result = await cart.removeGiftCardCodes(giftCardIds);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate:
      result = await cart.updateBuyerIdentity({
        ...(inputs.buyerIdentity as CartBuyerIdentityInput),
      });
      break;
    default:
      console.error("Unknown cart action:", cartFormAction);
      console.error("Available actions:", Object.keys(CartForm.ACTIONS));
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
  const { cart, featuredProducts } = useLoaderData<typeof loader>();

  return (
    <>
      <Section width="fixed" verticalPadding="medium">
        <h1 className="h3 mb-8 text-center md:mb-16">
          Cart ({cart?.totalQuantity || 0})
        </h1>
        <CartMain layout="page" cart={cart} />
        <Analytics.CartView />
      </Section>
      <Suspense fallback={null}>
        <Await resolve={featuredProducts}>
          {({ featuredProducts: products }) => {
            if (!products?.nodes?.length) {
              return null;
            }
            return (
              <Section width="fixed" verticalPadding="large" gap={32}>
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

function isLocalPath(url: string) {
  try {
    new URL(url);
  } catch (e) {
    return true;
  }
  return false;
}
