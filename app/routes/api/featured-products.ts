import { data, type LoaderFunctionArgs } from "@shopify/remix-oxygen";
import { getFeaturedProducts } from "~/utils/featured-products";

export async function loader({ context: { storefront } }: LoaderFunctionArgs) {
  return data(await getFeaturedProducts(storefront));
}
