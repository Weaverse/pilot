# Feature: Weaverse Translation Migration

| Field            | Value                                                    |
| ---------------- | -------------------------------------------------------- |
| **Status**       | in-progress                                              |
| **Owner**        | @Hieu1866                                                |
| **Created**      | 2026-05-09                                               |
| **Last Updated** | 2026-05-09                                               |

## Original Prompt

> Nhánh i18n này triển khai việc translate từ rất lâu, khoảng từ 3 tháng trước rồi nên chắc chắn sẽ có nhiều thứ bị tụt lại phía sau. Trước hết hãy nắm qua docs sau: https://docs.weaverse.io/features/translation-feature-guide rồi nhận xét project chúng ta có đang lạc hậu gì về feat translation đó không? Sau đó lên plan khắc phục, áp dụng translation mới nhất cho pilot.

## Summary

Migrate the Pilot theme's i18n implementation to align with the latest Weaverse Translation Manager guide. The current setup uses `react-i18next` (`useTranslation`) directly in 14 components, lacks `schema.i18n.translation: true` and `staticContent` in the theme schema, and all 12 locale configs incorrectly use `language: "EN"`. The migration involves wiring up the Weaverse Translation Manager, switching from `useTranslation` to `useThemeText`, and fixing locale configurations so auto-translation in Studio works end-to-end.
