import invariant from "tiny-invariant";
import type { LoaderFunctionArgs } from "react-router";
import { getJudgeMeProductRating, getJudgeMeProductReviews } from "~/utils/judgeme";

export async function loader({ params: { productHandle }, request, context }: LoaderFunctionArgs) {
  invariant(productHandle, "Missing product handle");

  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  if (type === "rating") {
    return await getJudgeMeProductRating({ context, productHandle });
  }

  return await getJudgeMeProductReviews({ context, productHandle });
}
