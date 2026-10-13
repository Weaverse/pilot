import { expect, test } from "@playwright/test";
import { getFocalPointPosition } from "../../app/utils/image";

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
