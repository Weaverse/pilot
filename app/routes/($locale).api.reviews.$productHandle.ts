import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import invariant from "tiny-invariant";
import {
  getJudgeMeProductRating,
} from "~/utils/judgeme";
import { loader as reviewsLoader } from "~/utils/judgeme-redesigned";

interface AppContext {
  storefront: any;
  weaverse: any;
  env: any;
}

export async function loader({
  params: { productHandle },
  request,
  context,
}: LoaderFunctionArgs) {
  invariant(productHandle, "Missing product handle");

  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  if (type === "rating") {
    return await getJudgeMeProductRating({ context, productHandle });
  }

  // Use the redesigned loader that returns the correct format
  return await reviewsLoader({ request, context, params });
}
