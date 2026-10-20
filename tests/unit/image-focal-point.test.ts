import { expect, test } from "@playwright/test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFocalPointPosition } from "../../app/utils/image";
import { loadComponent } from "../support/render-app";

test("converts a valid focal point to an object-position", () => {
  expect(
    getFocalPointPosition({ url: "/a.jpg", focalPoint: { x: 0.8, y: 0.3 } }),
  ).toBe("80% 30%");
  expect(getFocalPointPosition({ focalPoint: { x: 0, y: 1 } })).toBe("0% 100%");
  expect(getFocalPointPosition({ focalPoint: { x: 0.29, y: 0.12346 } })).toBe(
    "29% 12.35%",
  );
});

test("ignores missing, malformed, and out-of-range focal points", () => {
  for (const image of [
    "/a.jpg",
    null,
    undefined,
    { url: "/a.jpg" },
    { focalPoint: null },
    { focalPoint: { x: 0.5 } },
    { focalPoint: { x: "50%", y: 0.5 } },
    { focalPoint: { x: -0.1, y: 0.5 } },
    { focalPoint: { x: 0.5, y: 1.1 } },
    { focalPoint: { x: Number.NaN, y: 0.5 } },
  ]) {
    expect(getFocalPointPosition(image)).toBeUndefined();
  }
});

test("an image without a focal point keeps Hydrogen's computed aspect ratio", async () => {
  // Hydrogen's Image spreads caller props after its own `style`, so passing
  // any `style` replaces the aspect ratio it derives from the image size.
  const { Image } = await loadComponent<{
    Image: (props: Record<string, unknown>) => React.ReactElement;
  }>("components/image.tsx");
  const data = {
    url: "https://cdn.shopify.com/a.jpg",
    width: 846,
    height: 1000,
  };
  const plain = renderToStaticMarkup(
    createElement(Image, { data, width: 1000 }),
  );
  expect(plain).toContain("aspect-ratio:846/1000");
  expect(plain).not.toContain("object-position");

  const focal = renderToStaticMarkup(
    createElement(Image, {
      data: { ...data, focalPoint: { x: 0.8, y: 0.3 } },
      width: 1000,
    }),
  );
  expect(focal).toContain("object-position:80% 30%");
});
