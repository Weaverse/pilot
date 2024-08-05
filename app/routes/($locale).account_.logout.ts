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
  const locale = params.locale;
  return redirect(locale ? `/${locale}` : "/");
}

export const action: ActionFunction = async ({
  context,
}: ActionFunctionArgs) => {
  return doLogout(context);
};
