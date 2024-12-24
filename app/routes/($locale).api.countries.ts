import { json } from "@shopify/remix-oxygen";
import { CACHE_LONG } from "~/data/cache";
import { COUNTRIES } from "~/data/countries";

export async function loader() {
  return json(
    { ...COUNTRIES },
    {
      headers: {
        "cache-control": CACHE_LONG,
      },
    },
  );
}
