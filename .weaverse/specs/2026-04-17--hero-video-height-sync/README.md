# Feature: Hero Video Height Synchronization

| Field            | Value                                                    |
| ---------------- | -------------------------------------------------------- |
| **Status**       | completed                                                |
| **Owner**        | @hta218                                                  |
| **Issue**        | N/A                                                      |
| **Branch**       | `update/hero-video-height-sync`                          |
| **Created**      | 2026-04-17                                               |
| **Last Updated** | 2026-04-17                                               |

## Original Prompt

> Fix the hero video section where the video element's height is 420px while the section is 447px, which makes the overlay (the blur gray) higher than the video. A gray bar shows up below the video, which is bad.

## Summary

Implemented two-phase height synchronization for the hero video section to eliminate the gray bar below the video. The container now dynamically matches the actual rendered video height by combining metadata-based estimation with precise DOM measurement. Removed separate mobile height settings as mobile now uses the calculated video height.

## Files Modified

- `app/sections/hero-video/index.tsx`
- `app/sections/hero-video/schema.ts`
