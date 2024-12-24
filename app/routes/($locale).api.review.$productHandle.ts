import type { RouteLoaderArgs } from "@weaverse/hydrogen";
import invariant from "tiny-invariant";
import { getJudgemeReviews } from "~/utils/judgeme";

export async function loader({
  params: { productHandle },
  context: { env, weaverse },
}: RouteLoaderArgs) {
  invariant(productHandle, "Missing product handle");

  return await getJudgemeReviews(
    env.JUDGEME_PRIVATE_API_TOKEN,
    env.PUBLIC_STORE_DOMAIN,
    productHandle,
    weaverse
  );
}
