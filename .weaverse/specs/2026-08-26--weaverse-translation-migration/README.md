# Feature: Weaverse Translation Migration

| Field            | Value                                                              |
| ---------------- | ------------------------------------------------------------------ |
| **Status**       | in-progress                                                        |
| **Owner**        | @Hieu1866 → @paul-phan                                             |
| **Created**      | 2026-05-09                                                         |
| **Last Updated** | 2026-08-26                                                         |
| **Issue**        | [#473](https://github.com/Weaverse/pilot/issues/473) (also [#392](https://github.com/Weaverse/pilot/issues/392)) |
| **Branch**       | `i18n`                                                             |

## Original Prompt

> Nhánh i18n này triển khai việc translate từ rất lâu, khoảng từ 3 tháng trước rồi nên chắc chắn sẽ có nhiều thứ bị tụt lại phía sau. Trước hết hãy nắm qua docs sau: https://docs.weaverse.io/features/translation-feature-guide rồi nhận xét project chúng ta có đang lạc hậu gì về feat translation đó không? Sau đó lên plan khắc phục, áp dụng translation mới nhất cho pilot.

## Summary

Make Shopify Markets localization and storefront UI translation complete and
maintainable on Pilot, driven by **one canonical market configuration**
(`app/utils/locale.ts`) that feeds request context, Weaverse `themeSchema.i18n`,
country/language selection, link prefixing, cart buyer identity, checkout,
sitemap, and hreflang. Theme-owned strings render through the Weaverse
Translation Manager seam (`i18n.staticContent` + `useTranslation`) that ships
natively in the installed `@weaverse/hydrogen`, with no extra i18n dependency.

## Scope note (2026-08-26)

This spec supersedes `.specs/2026-05-09--weaverse-translation-migration/` from
the `i18n` branch. That folder used a `.specs/` root that does not exist in this
repository; Pilot's specs live in `.weaverse/specs/` (see `.weaverse/README.md`),
so the spec was moved there and re-dated per `AGENTS.md`. `Created` is preserved
because this is the same feature, continued — not a new one.

The 2026-05-09 plan targeted a branch that is now 236 commits behind `main`. Its
findings were re-verified against current `main` and `@weaverse/hydrogen@5.20.2`;
the ones that no longer hold are corrected in `plan.md`, which also carries the
explicit keep / remove / port matrix for every localization mechanism.
