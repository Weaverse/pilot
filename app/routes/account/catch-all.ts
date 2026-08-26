import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { localizedPathForRequest } from "~/utils/locale";

// fallback wild card for all unauthenticated routes in account section
export async function loader({ context, request }: LoaderFunctionArgs) {
  await context.customerAccount.handleAuthStatus();
  return redirect(localizedPathForRequest(request, "/account"));
}
