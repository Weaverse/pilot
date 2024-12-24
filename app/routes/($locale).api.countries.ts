import { CacheLong, generateCacheControlHeader } from "@shopify/hydrogen";
import { json } from "@shopify/remix-oxygen";
import { COUNTRIES } from "~/utils/const";

export async function loader() {
  return json(
    { ...COUNTRIES },
    {
      headers: { "cache-control": generateCacheControlHeader(CacheLong()) },
    },
  );
}
