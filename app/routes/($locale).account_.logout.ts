import {
  type ActionFunction,
  type ActionFunctionArgs,
  type AppLoadContext,
  type LoaderFunctionArgs,
  redirect,
} from "@shopify/remix-oxygen";

export async function doLogout(context: AppLoadContext) {
  return context.customerAccount.logout();
}

export async function loader({ params }: LoaderFunctionArgs) {
  let locale = params.locale;
  return redirect(locale ? `/${locale}` : "/");
}

export let action: ActionFunction = async ({ context }: ActionFunctionArgs) => {
  return doLogout(context);
};
