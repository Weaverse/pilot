import { CacheLong, generateCacheControlHeader } from "@shopify/hydrogen";
import { data } from "@shopify/remix-oxygen";
import { COUNTRIES } from "~/utils/const";

export async function loader() {
  return data(
    { ...COUNTRIES },
    {
      headers: { "cache-control": generateCacheControlHeader(CacheLong()) },
    },
  );
}
