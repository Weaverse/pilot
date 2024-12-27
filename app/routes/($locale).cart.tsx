import { Await, useRouteLoaderData } from "@remix-run/react";
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
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
} from "@shopify/remix-oxygen";
import type { CartApiQueryFragment } from "storefront-api.generated";
import invariant from "tiny-invariant";
import { Cart } from "~/components/cart/cart";
import type { RootLoader } from "~/root";

export async function action({ request, context }: ActionFunctionArgs) {
  let { cart } = context;
  let formData = await request.formData();
  let { action, inputs } = CartForm.getFormInput(formData);
  invariant(action, "No cartAction defined");

  let status = 200;
  let result: CartQueryDataReturn;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines as CartLineInput[]);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines as CartLineUpdateInput[]);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds as string[]);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      let formDiscountCode = inputs.discountCode;

      // User inputted discount code
      let discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];

      // Combine discount codes already applied on cart
      discountCodes.push(...(inputs.discountCodes as string[]));

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate:
      result = await cart.updateBuyerIdentity({
        ...(inputs.buyerIdentity as CartBuyerIdentityInput),
      });
      break;
    default:
      invariant(false, `${action} cart action is not defined`);
  }

  /**
   * The Cart ID may change after each mutation. We need to update it each time in the session.
   */
  // let cartId = result.cart.id;
  let headers = cart.setCartId(result.cart.id);

  let redirectTo = formData.get("redirectTo") ?? null;
  if (typeof redirectTo === "string" && isLocalPath(redirectTo)) {
    status = 303;
    headers.set("Location", redirectTo);
  }

  let { cart: cartResult, errors, userErrors } = result;

  return json(
    {
      cart: cartResult,
      userErrors,
      errors,
    },
    { status, headers },
  );
}

export async function loader({ context }: LoaderFunctionArgs) {
  let { cart } = context;
  return json(await cart.get());
}

export default function CartRoute() {
  let rootData = useRouteLoaderData<RootLoader>("root");
  if (!rootData) return null;

  return (
    <>
      <div className="px-3 md:px-10 lg:px-16 py-6 md:py-20 space-y-6 md:space-y-12">
        <h3 className="text-center">Cart</h3>
        <Await resolve={rootData?.cart}>
          {(cart) => <Cart layout="page" cart={cart as CartApiQueryFragment} />}
        </Await>
      </div>
      <Analytics.CartView />
    </>
  );
}

/**
 * Validates that a url is local
 * @param url
 * @returns `true` if local `false`if external domain
 */
export function isLocalPath(url: string) {
  try {
    // We don't want to redirect cross domain,
    // doing so could create fishing vulnerability
    // If `new URL()` succeeds, it's a fully qualified
    // url which is cross domain. If it fails, it's just
    // a path, which will be the current domain.
    new URL(url);
  } catch (e) {
    return true;
  }

  return false;
}
