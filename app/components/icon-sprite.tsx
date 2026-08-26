import spriteContent from "./icons/sprite.svg?raw";

/**
 * Inlines the icon sprite (hidden) once at the top of `<body>`.
 *
 * `<Icon>` references symbols with a same-document `<use href="#name">`.
 * External SVG `<use>` references are blocked across origins, and on Oxygen the
 * built `sprite.svg` is served from `cdn.shopify.com` while the storefront runs
 * on its own domain — so a URL-based `<use>` renders every icon empty in
 * production. Inlining the symbols keeps them same-origin and avoids a separate
 * request. The content is generated at build time from `other/build-icons.mjs`.
 */
export function IconSprite() {
  return (
    <div
      aria-hidden
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      dangerouslySetInnerHTML={{ __html: spriteContent }}
    />
  );
}
