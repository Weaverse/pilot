import type { MetaDescriptor } from "react-router";
import type { Thing, WithContext } from "schema-dts";

/**
 * Local port of classic Hydrogen's `getSeoMeta` and `SeoConfig` (removed in
 * Hydrogen 2026.10). Emits the exact same meta descriptors, in the same order,
 * with the same JSON-LD and canonical/hreflang links, so SEO output is
 * unchanged from `main`.
 */

type Maybe<T> = T | null;

export type SeoMedia = {
  /** Used to generate the `og:<type>` meta tags. */
  type: "image" | "video" | "audio";
  /** Populates `og:<type>:url` and `og:<type>:secure_url`, and infers `og:<type>:type`. */
  url: Maybe<string> | undefined;
  height: Maybe<number> | undefined;
  width: Maybe<number> | undefined;
  altText: Maybe<string> | undefined;
};

export interface LanguageAlternate {
  /** `hreflang` value. */
  language: string;
  /** Appends `-default` to the `hreflang` value. */
  default?: boolean;
  url: string;
}

/** @see https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag */
export interface RobotsOptions {
  maxImagePreview?: "none" | "standard" | "large";
  maxSnippet?: number;
  maxVideoPreview?: number;
  noArchive?: boolean;
  noFollow?: boolean;
  noImageIndex?: boolean;
  noIndex?: boolean;
  noSnippet?: boolean;
  noTranslate?: boolean;
  unavailableAfter?: string;
}

export interface SeoConfig {
  /** Document title; rendered through `titleTemplate`. */
  title?: Maybe<string>;
  /** Template with a `%s` placeholder for the title. */
  titleTemplate?: Maybe<string> | null;
  /** A string becomes `og:image`; objects become `og:<type>:*` tags. */
  media?:
    | Maybe<string>
    | Partial<SeoMedia>
    | (Partial<SeoMedia> | Maybe<string>)[];
  description?: Maybe<string>;
  /** Canonical URL (query string and trailing slash are stripped). */
  url?: Maybe<string>;
  /** Twitter handle, including the `@`. */
  handle?: Maybe<string>;
  /** schema.org structured data, rendered as `application/ld+json`. */
  jsonLd?: WithContext<Thing> | WithContext<Thing>[];
  /** `hreflang` alternates. */
  alternates?: LanguageAlternate | LanguageAlternate[];
  robots?: RobotsOptions;
}

/** Merged input; `jsonLd` may nest arrays exactly as classic did. */
type MergedSeo = Omit<SeoConfig, "jsonLd"> & { jsonLd?: unknown };

const ERROR_PREFIX = "Error in SEO input: ";

const SCHEMA = {
  title: (value: unknown) => {
    if (typeof value !== "string") {
      throw new Error(ERROR_PREFIX.concat("`title` should be a string"));
    }
    if (value.length > 70) {
      throw new Error(
        ERROR_PREFIX.concat("`title` should not be longer than 70 characters"),
      );
    }
    return value;
  },
  description: (value: unknown) => {
    if (typeof value !== "string") {
      throw new Error(ERROR_PREFIX.concat("`description` should be a string"));
    }
    if (value.length > 155) {
      throw new Error(
        ERROR_PREFIX.concat(
          "`description` should not be longer than 160 characters",
        ),
      );
    }
    return value;
  },
  url: (value: unknown) => {
    if (typeof value !== "string") {
      throw new Error(ERROR_PREFIX.concat("`url` should be a string"));
    }
    if (!value.startsWith("http")) {
      throw new Error(ERROR_PREFIX.concat("`url` should be a valid URL"));
    }
    return value;
  },
  handle: (value: unknown) => {
    if (typeof value !== "string") {
      throw new Error(ERROR_PREFIX.concat("`handle` should be a string"));
    }
    if (!value.startsWith("@")) {
      throw new Error(ERROR_PREFIX.concat("`handle` should start with `@`"));
    }
    return value;
  },
};

/** Classic behavior: an invalid value only warns and is used as-is. */
function validate<T>(check: (value: unknown) => string, value: T) {
  try {
    return check(value);
  } catch (error) {
    console.warn((error as Error).message);
    return value;
  }
}

function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

function renderTitle(template: SeoConfig["titleTemplate"], title: unknown) {
  if (!title) {
    return;
  }
  if (!template) {
    return title;
  }
  return template.replace("%s", String(title));
}

function inferMimeType(url: Maybe<string> | undefined) {
  let ext = url?.split(/[?#]/)[0].split(".").pop()?.toLowerCase();
  switch (ext) {
    case "svg":
      return "image/svg+xml";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "swf":
      return "application/x-shockwave-flash";
    case "mp3":
      return "audio/mpeg";
    default:
      return "image/jpeg";
  }
}

/**
 * Builds a React Router meta array from one or more SEO configs. Like
 * `Object.assign()`, later configs override earlier ones (falsy values never
 * override), except `jsonLd`, which accumulates so each route keeps its own
 * structured data.
 */
// A near-literal port of classic Hydrogen's `getSeoMeta`, kept in one piece so
// its output stays byte-identical; split it only together with a parity test.
// oxlint-disable-next-line sonarjs/cognitive-complexity
export function getSeoMeta(
  ...seoInputs: (SeoConfig | null | undefined)[]
): MetaDescriptor[] {
  let seo = seoInputs.reduce<MergedSeo>((acc, input) => {
    if (!input) {
      return acc;
    }
    let current: MergedSeo = { ...input };
    for (let key of Object.keys(current) as (keyof MergedSeo)[]) {
      if (!current[key]) {
        delete current[key];
      }
    }
    let { jsonLd } = current;
    if (!jsonLd) {
      return { ...acc, ...current };
    }
    if (!acc.jsonLd) {
      return { ...acc, ...current, jsonLd: [jsonLd] };
    }
    return {
      ...acc,
      ...current,
      jsonLd: ensureArray(acc.jsonLd).concat(jsonLd),
    };
  }, {});

  let tags: MetaDescriptor[] = [];
  for (let key of Object.keys(seo)) {
    switch (key) {
      case "title": {
        let title = renderTitle(
          seo.titleTemplate,
          validate(SCHEMA.title, seo.title),
        );
        if (!title) {
          break;
        }
        tags.push(
          { title } as MetaDescriptor,
          { property: "og:title", content: title } as MetaDescriptor,
          { property: "twitter:title", content: title } as MetaDescriptor,
        );
        break;
      }
      case "description": {
        let content = validate(SCHEMA.description, seo.description);
        if (!content) {
          break;
        }
        tags.push(
          { name: "description", content } as MetaDescriptor,
          { property: "og:description", content } as MetaDescriptor,
          { property: "twitter:description", content } as MetaDescriptor,
        );
        break;
      }
      case "url": {
        let content = validate(SCHEMA.url, seo.url);
        if (!content) {
          break;
        }
        let href = String(content).split("?")[0].replace(/\/$/, "");
        tags.push(
          { tagName: "link", rel: "canonical", href },
          { property: "og:url", content: href },
        );
        break;
      }
      case "handle": {
        let content = validate(SCHEMA.handle, seo.handle);
        if (!content) {
          break;
        }
        tags.push(
          { property: "twitter:site", content } as MetaDescriptor,
          { property: "twitter:creator", content } as MetaDescriptor,
        );
        break;
      }
      case "media": {
        for (let media of ensureArray(seo.media)) {
          if (typeof media === "string") {
            tags.push({ property: "og:image", content: media });
          }
          if (media && typeof media === "object") {
            let type = media.type || "image";
            let normalized: Record<string, unknown> = {
              url: media.url,
              secure_url: media.url,
              type: inferMimeType(media.url),
              width: media.width,
              height: media.height,
              alt: media.altText,
            };
            for (let field of Object.keys(normalized)) {
              if (normalized[field]) {
                tags.push({
                  property: `og:${type}:${field}`,
                  content: normalized[field],
                } as MetaDescriptor);
              }
            }
          }
        }
        break;
      }
      case "jsonLd": {
        for (let block of ensureArray(seo.jsonLd)) {
          if (
            typeof block !== "object" ||
            Object.keys(block as object).length === 0
          ) {
            continue;
          }
          tags.push({ "script:ld+json": block } as MetaDescriptor);
        }
        break;
      }
      case "alternates": {
        for (let alternate of ensureArray(seo.alternates)) {
          if (!alternate) {
            continue;
          }
          let { language, url, default: isDefault } = alternate;
          let hrefLang = language
            ? `${language}${isDefault ? "-default" : ""}`
            : undefined;
          tags.push({ tagName: "link", rel: "alternate", hrefLang, href: url });
        }
        break;
      }
      case "robots": {
        if (!seo.robots) {
          break;
        }
        let {
          maxImagePreview,
          maxSnippet,
          maxVideoPreview,
          noArchive,
          noFollow,
          noImageIndex,
          noIndex,
          noSnippet,
          noTranslate,
          unavailableAfter,
        } = seo.robots;
        let params = [
          noArchive && "noarchive",
          noImageIndex && "noimageindex",
          noSnippet && "nosnippet",
          noTranslate && "notranslate",
          maxImagePreview && `max-image-preview:${maxImagePreview}`,
          maxSnippet && `max-snippet:${maxSnippet}`,
          maxVideoPreview && `max-video-preview:${maxVideoPreview}`,
          unavailableAfter && `unavailable_after:${unavailableAfter}`,
        ];
        let content = `${noIndex ? "noindex" : "index"},${noFollow ? "nofollow" : "follow"}`;
        for (let param of params) {
          if (param) {
            content += `,${param}`;
          }
        }
        tags.push({ name: "robots", content });
        break;
      }
      default:
        break;
    }
  }
  return tags;
}
