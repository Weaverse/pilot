import type { RouteLoaderArgs } from "@weaverse/hydrogen";
import invariant from "tiny-invariant";

import { getJudgemeReviews } from "~/lib/judgeme";

export async function loader(args: RouteLoaderArgs) {
  let { params, context } = args;
  let handle = params.productHandle;
  let api_token = context.weaverse.env.JUDGEME_PRIVATE_API_TOKEN;
  let shop_domain = context.weaverse.env.PUBLIC_STORE_DOMAIN;
  invariant(handle, "Missing product handle");
  return await getJudgemeReviews(
    api_token,
    shop_domain,
    handle,
    context.weaverse,
  );
}
