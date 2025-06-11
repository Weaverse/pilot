import invariant from "tiny-invariant";
import { getJudgeMeProductReviews } from "~/utils/judgeme";

export async function loader({ params: { productHandle }, context }) {
  invariant(productHandle, "Missing product handle");
  return await getJudgeMeProductReviews({ context, handle: productHandle });
}
