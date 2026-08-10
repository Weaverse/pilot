/**
 * Brand/tech icons used on `/projects` for the "Stack" and "Language" rows.
 * Ported from the legacy `components/ui/brand.tsx` BrandsMap so the Astro
 * studio matches the live site. SVGs are inlined via Vite `?raw` imports and
 * rendered with `set:html`; each keeps its own brand colors.
 */
import Astro from '@icons/astro.svg?raw'
import Bash from '@icons/bash.svg?raw'
import Claude from '@icons/claude.svg?raw'
import CSS from '@icons/css.svg?raw'
import Exercism from '@icons/exercism.svg?raw'
import HeadlessUI from '@icons/headlessui.svg?raw'
import Html from '@icons/html5.svg?raw'
import Hydrogen from '@icons/hydrogen.svg?raw'
import Java from '@icons/java.svg?raw'
import Javascript from '@icons/javascript.svg?raw'
import JWT from '@icons/jsonwebtokens.svg?raw'
import Koa from '@icons/koa.svg?raw'
import Liquid from '@icons/liquid.svg?raw'
import Markdown from '@icons/markdown.svg?raw'
import MongoDB from '@icons/mongodb.svg?raw'
import MySQL from '@icons/mysql.svg?raw'
import OpenAI from '@icons/openai.svg?raw'
import Picsum from '@icons/picsum.svg?raw'
import Python from '@icons/python.svg?raw'
import React from '@icons/react.svg?raw'
import Remix from '@icons/remix.svg?raw'
import SemanticUI from '@icons/semanticui.svg?raw'
import Shopify from '@icons/shopify.svg?raw'
import Supabase from '@icons/supabase.svg?raw'
import TailwindCSS from '@icons/tailwind.svg?raw'
import Turborepo from '@icons/turborepo.svg?raw'
import Typescript from '@icons/typescript.svg?raw'
import Umami from '@icons/umami.svg?raw'
import Webpack from '@icons/webpack.svg?raw'

/** Maps a stack tool or GitHub language name to its inline SVG markup. */
export const BRAND_ICONS: Record<string, string> = {
  Astro,
  Bash,
  Shell: Bash,
  Claude,
  CSS,
  Exercism,
  HeadlessUI,
  HTML: Html,
  Hydrogen,
  Java,
  Javascript,
  JavaScript: Javascript,
  JWT,
  KoaJS: Koa,
  Liquid,
  Markdown,
  MDX: Markdown,
  MongoDB,
  MySQL,
  OpenAI,
  Picsum,
  Polaris: Shopify,
  Python,
  React,
  Remix,
  SemanticUI,
  Shopify,
  Supabase,
  TailwindCSS,
  ThemeKit: Shopify,
  Turborepo,
  Typescript,
  TypeScript: Typescript,
  Umami,
  Webpack,
}

/** Returns the inline SVG for a brand/language name, if one is registered. */
export function brandIcon(name: string): string | undefined {
  return BRAND_ICONS[name]
}
