# Feature: Remove Framer Motion, Replace with CSS Animations

| Field        | Value                              |
| ------------ | ---------------------------------- |
| **Status**   | `in-progress`                      |
| **Owner**    | @hta218                            |
| **Created**  | 2026-02-27                         |
| **Last Updated** | 2026-02-27                         |

## Original Prompt

> Remove the `framer-motion` dependency and replace all scroll-triggered animations with pure CSS keyframes + IntersectionObserver. Use Tailwind CSS custom `@keyframes` (no external animation library). Replace `data-motion` attributes with CSS classes. Use CSS custom properties for stagger delays.

## Summary

Removes the `framer-motion` library from the project and replaces all scroll-triggered animations with a lightweight, zero-dependency approach. Phase 1 (completed) replaced framer-motion with a `useAnimation` hook using IntersectionObserver + CSS `@keyframes`. Phase 2 (in progress) refactors that into a shared `<ScrollReveal>` wrapper component backed by a singleton IntersectionObserver and CSS transitions for simpler, per-element animation control.
