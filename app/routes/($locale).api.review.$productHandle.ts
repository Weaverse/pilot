import invariant from "tiny-invariant";
import type { LoaderFunctionArgs } from "react-router";
import { getJudgeMeBadgeData, getJudgeMeProductReviews } from "~/utils/judgeme";

export async function loader({ params: { productHandle }, request, context }: LoaderFunctionArgs) {
  invariant(productHandle, "Missing product handle");

  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  if (type === "badge") {
    return await getJudgeMeBadgeData({ context, productHandle });
  }

  return await getJudgeMeProductReviews({ context, productHandle });
}
