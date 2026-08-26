import {
  type ActionFunction,
  type ActionFunctionArgs,
  type AppLoadContext,
  type LoaderFunctionArgs,
  redirect,
} from "react-router";
import { localizedPathForRequest } from "~/utils/locale";

/**
 * Signs the shopper out and returns them to the market they were shopping.
 *
 * `customerAccount.logout()` defaults `postLogoutRedirectUri` to the bare app
 * origin, so a shopper signing out of `/de-de/account` lands on the default
 * market's home. Shopify redirects to this URI after clearing its own session,
 * so it must be an absolute URL and every market prefix must be registered as
 * an allowed logout URI in the Customer Account API settings.
 */
export async function doLogout(context: AppLoadContext, request: Request) {
  const origin = new URL(request.url).origin;
  const home = localizedPathForRequest(request, "/");

  return context.customerAccount.logout({
    postLogoutRedirectUri: new URL(home, origin).toString(),
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  return redirect(localizedPathForRequest(request, "/"));
}

export const action: ActionFunction = async ({
  context,
  request,
}: ActionFunctionArgs) => {
  return doLogout(context, request);
};
