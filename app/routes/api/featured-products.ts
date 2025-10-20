import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import { getFeaturedProducts } from "~/utils/featured-products";

export async function loader({ context: { storefront } }: LoaderFunctionArgs) {
  return data(await getFeaturedProducts(storefront));
}
