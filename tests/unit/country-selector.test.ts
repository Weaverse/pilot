import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const COUNTRY_SELECTOR_SOURCE = new URL(
  "../../app/components/layout/country-selector/use-country-selector.ts",
  import.meta.url,
);

test("hands the intersection observer ref directly to React for cleanup", async () => {
  const source = await readFile(COUNTRY_SELECTOR_SOURCE, "utf8");

  expect(source).toMatch(
    /const \{\s*ref: observerRef,\s*inView\s*\} = useInView\(/,
  );
  expect(source).not.toContain("ref(observerRef.current)");
});
