# Feature: Add global border radius / rounded / corner config

| Field            | Value          |
| ---------------- | -------------- |
| **Status**       | in-progress    |
| **Owner**        | @hta218        |
| **Created**      | 2026-03-31     |
| **Last Updated** | 2026-03-31     |

## Original Prompt

> All elements currently render in a square shape. We need a global config for corner radius that applies consistently across all components and UI elements.
>
> **Scope**
>
> Apply border radius globally to all items and components, including:
> - Buttons
> - Links
> - Cards
> - Popups / modals
> - Inputs and form elements
>
> **Implementation notes**
>
> - Leverage Tailwind's border radius config: https://tailwindcss.com/docs/border-radius
> - Add a global "base radius" setting in theme config
> - Scale/calculate radius CSS variables from the base value
>   - If base = `0` → all elements are square (`border-radius: 0px`)
>   - Higher values scale proportionally (e.g., `rounded-sm`, `rounded-md`, `rounded-lg`)
> - Apply Tailwind radius utilities (`rounded`, `rounded-sm`, `rounded-md`, etc.) across all components by default — keep values reasonable, not excessive
> - Once CSS variables are wired up, updating the base config should automatically propagate to all elements
>
> **Action items**
>
> - [ ] Add global base radius setting to theme/global config
> - [ ] Define and export radius CSS variables scaled from the base value
> - [ ] Apply appropriate `rounded-*` classes to all components (buttons, inputs, cards, popups, links)
> - [ ] Verify that setting base radius to `0` results in fully square elements
> - [ ] Verify that changing the base radius updates all components automatically

## Summary

Add a global "base radius" theme setting in Weaverse that generates scaled CSS variables for border radius. All UI components (buttons, inputs, cards, modals, links) use these variables via Tailwind utilities, so changing one value propagates everywhere.
