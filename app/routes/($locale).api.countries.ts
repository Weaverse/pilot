import { CacheLong, generateCacheControlHeader } from "@shopify/hydrogen";
import { json } from "@shopify/remix-oxygen";
import { COUNTRIES } from "~/data/countries";

export async function loader() {
  return json(
    { ...COUNTRIES },
    {
      headers: { "cache-control": generateCacheControlHeader(CacheLong()) },
    },
  );
}
