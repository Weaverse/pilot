import {
  type ActionFunction,
  type ActionFunctionArgs,
  type AppLoadContext,
  type LoaderFunctionArgs,
  redirect,
} from "react-router";
import { localizedPathForRequest } from "~/utils/locale";

export async function doLogout(context: AppLoadContext) {
  return context.customerAccount.logout();
}

export async function loader({ request }: LoaderFunctionArgs) {
  return redirect(localizedPathForRequest(request, "/"));
}

export const action: ActionFunction = async ({
  context,
}: ActionFunctionArgs) => {
  return doLogout(context);
};
