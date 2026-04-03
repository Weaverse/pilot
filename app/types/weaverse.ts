import type {
  WeaverseBlog,
  WeaverseCollection,
  WeaverseImage,
  WeaverseProduct,
  WeaverseVideo,
} from "@weaverse/hydrogen";
import type { announcementSettings } from "~/weaverse/settings/announcements";
import type { cartSettings } from "~/weaverse/settings/cart";
import type { footerSettings } from "~/weaverse/settings/footer";
import type { generalSettings } from "~/weaverse/settings/general";
import type { headerSettings } from "~/weaverse/settings/header";
import type { linksButtonsSettings } from "~/weaverse/settings/links-buttons";
import type { newsletterSettings } from "~/weaverse/settings/newsletter";
import type { productBadgesSettings } from "~/weaverse/settings/product-badges";
import type { productCardsSettings } from "~/weaverse/settings/product-cards";
import type { searchSettings } from "~/weaverse/settings/search";
import type { typographySettings } from "~/weaverse/settings/typography";

/**
 * Extracts union of option values from a configs.options tuple.
 */
type ExtractOptionValues<T> = T extends {
  configs: { options: readonly (infer O)[] };
}
  ? O extends { value: infer V extends string }
    ? V
    : string
  : string;

type WeaverseResource = WeaverseProduct | WeaverseCollection | WeaverseBlog;

type WeaverseMedia = WeaverseImage | WeaverseVideo;

/**
 * Maps a Weaverse input entry to its TypeScript value type.
 * For select/toggle-group, extracts the literal union from configs.options.
 */
type InputEntryValueType<T> = T extends { type: "switch" }
  ? boolean
  : T extends { type: "range" }
    ? number
    : T extends {
          type:
            | "color"
            | "text"
            | "richtext"
            | "textarea"
            | "url"
            | "map-autocomplete"
            | "datepicker"
            | "position";
        }
      ? string
      : T extends { type: "image" | "video" }
        ? WeaverseMedia
        : T extends { type: "select" | "toggle-group" }
          ? ExtractOptionValues<T>
          : T extends { type: "product" | "collection" | "blog" | "metaobject" }
            ? WeaverseResource
            : T extends { type: "product-list" | "collection-list" }
              ? WeaverseResource[]
              : T extends { type: "heading" }
                ? never
                : unknown;

/**
 * Walks the inputs tuple, filters to entries with a `name`, and maps each
 * to its typed value. Using `T[number]` ensures each union member distributes
 * independently through the conditional type (no collapsed unions).
 */
type SettingsFromInputs<T extends readonly unknown[]> = {
  [K in T[number] as K extends { name: infer N extends string }
    ? N
    : never]: K extends unknown ? InputEntryValueType<K> : never;
};

/**
 * Extracts typed settings from an InspectorGroup defined with `as const satisfies`.
 */
type ExtractSettings<T extends { inputs: readonly unknown[] }> =
  SettingsFromInputs<T["inputs"]>;

// -- Extracted settings per group --
type GeneralSettings = ExtractSettings<typeof generalSettings>;
type TypographySettings = ExtractSettings<typeof typographySettings>;
type LinksButtonsSettings = ExtractSettings<typeof linksButtonsSettings>;
type AnnouncementSettings = ExtractSettings<typeof announcementSettings>;
type HeaderSettings = ExtractSettings<typeof headerSettings>;
type ProductBadgesSettings = ExtractSettings<typeof productBadgesSettings>;
type ProductCardsSettings = ExtractSettings<typeof productCardsSettings>;
type NewsletterSettings = ExtractSettings<typeof newsletterSettings>;
type SearchSettings = ExtractSettings<typeof searchSettings>;
type CartSettings = ExtractSettings<typeof cartSettings>;
type FooterSettings = ExtractSettings<typeof footerSettings>;

// -- Combined theme settings --
export type ThemeSettings = GeneralSettings &
  TypographySettings &
  LinksButtonsSettings &
  AnnouncementSettings &
  HeaderSettings &
  ProductBadgesSettings &
  ProductCardsSettings &
  NewsletterSettings &
  SearchSettings &
  CartSettings &
  FooterSettings;
