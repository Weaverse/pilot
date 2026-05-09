# Hero Video Section - Code Changes Explanation

## Overview

This document explains the changes made to fix the hero video section's height synchronization issue, where a gray bar was appearing below the video because the container height didn't match the actual video element height.

---

## What Files Changed

- **`index.tsx`** - Main component file with height synchronization logic
- **`schema.ts`** - Removed the "Height on mobile" input setting

---

## What Changed (Detailed)

### 1. Added `calculateVideoHeight()` Helper Function

```typescript
function calculateVideoHeight(
  video: WeaverseVideo | undefined,
  containerWidth: number,
): number | null {
  if (video?.width && video?.height && containerWidth > 0) {
    const aspectRatio = video.width / video.height;
    return containerWidth / aspectRatio;
  }
  return null;
}
```

**Purpose:** Calculates expected video height from the video's intrinsic dimensions stored in Shopify.

**Analogy:** Like a recipe card that tells you the serving size before you start cooking.

---

### 2. Added `syncVideoHeight()` Function

```typescript
function syncVideoHeight() {
  if (!containerRef.current) return;
  
  const mediaEl = containerRef.current.querySelector("video, iframe") as HTMLElement | null;
  
  if (mediaEl) {
    const actualHeight = mediaEl.getBoundingClientRect().height;
    if (actualHeight > 0) {
      setVideoHeight((prev) => {
        if (prev === null || Math.abs(prev - actualHeight) > 2) {
          return actualHeight;
        }
        return prev;
      });
    }
  }
}
```

**Purpose:** Measures the actual rendered video element and adjusts container height to match.

**Key feature:** The 2px threshold prevents jitter from tiny rounding differences.

---

### 3. Changed `videoHeight` State Initialization

```typescript
// OLD: Start with null
const [videoHeight, setVideoHeight] = useState<number | null>(null);

// NEW: Calculate estimate immediately
const [videoHeight, setVideoHeight] = useState<number | null>(() => {
  if (video?.width && video?.height) {
    const estimatedWidth = window.innerWidth;
    return calculateVideoHeight(video, estimatedWidth);
  }
  return null;
});
```

**Purpose:** Provides an initial height estimate from metadata to reduce layout shift during loading.

---

### 4. Updated `handleResize()` Function

```typescript
function handleResize() {
  setSize(getPlayerSize(id));
  
  // Step 1: Quick estimate from metadata
  if (containerRef.current && video?.width && video?.height) {
    const containerWidth = containerRef.current.getBoundingClientRect().width;
    const calculatedHeight = calculateVideoHeight(video, containerWidth);
    if (calculatedHeight) {
      setVideoHeight(calculatedHeight);
    }
  }
  
  // Step 2: Precise measurement after render
  requestAnimationFrame(syncVideoHeight);
}
```

**Purpose:** Two-phase approach: fast estimate first, then precise measurement.

---

### 5. Added `onReady` Callback to ReactPlayer

```typescript
<ReactPlayer
  url={video?.url || videoURL}
  playing={playing}
  // ... other props
  onReady={() => {
    requestAnimationFrame(syncVideoHeight);
  }}
/>
```

**Purpose:** Syncs container height when video finishes loading.

---

### 6. Removed Separate Mobile Height Settings

**Removed from interface:**
- `heightOnMobile: number`

**Simplified `SECTION_HEIGHTS`:**
```typescript
const SECTION_HEIGHTS = {
  small: "40vh",    // Was: { desktop: "40vh", mobile: "50vh" }
  medium: "50vh",   // Was: { desktop: "50vh", mobile: "60vh" }
  large: "70vh",    // Was: { desktop: "70vh", mobile: "80vh" }
  custom: null,
};
```

**Purpose:** Mobile now uses calculated video height instead of fixed vh values.

---

### 7. Updated Container CSS Classes

```typescript
className={clsx(
  "relative flex items-center justify-center overflow-hidden w-full",
  videoHeight
    ? "h-(--video-height) md:h-[min(var(--desktop-height),var(--video-height))]"
    : "aspect-video md:aspect-auto md:h-(--desktop-height)",
  "md:w-[max(var(--desktop-height)/9*16,100vw)]",
  "md:translate-x-[min(0px,calc((var(--desktop-height)/9*16-100vw)/-2))]",
)}
```

**Purpose:** Uses calculated `videoHeight` when available, falls back to `aspect-video` otherwise.

---

## Why We Made These Changes

### The Problem: The Gray Bar Below the Video

**What was happening:**
1. Video file dimensions: 796px × 420px (16:9 ratio)
2. Calculated container height: 447px from metadata
3. ReactPlayer rendered video at: 420px
4. Container (447px) was taller than video (420px)
5. Overlay filled the container, showing a 27px gray bar

**Root cause:** Video metadata said one thing, but browser + ReactPlayer rendered something slightly different.

### The Solution: Two-Phase Height Synchronization

**Phase 1: Fast Estimate**
- Uses video metadata to calculate expected height
- Happens immediately when component loads
- Reduces layout shift (no flash of wrong size)

**Phase 2: Precise Measurement**
- Waits for video to render
- Measures actual `<video>` or `<iframe>` element
- Adjusts container to match exactly

---

## How It Works (Execution Flow)

```
1. Component mounts
        ↓
2. useState initializer runs
   - Calculates videoHeight from metadata (e.g., 447px)
   - Sets initial state
        ↓
3. First render happens
   - Container renders at 447px height
   - ReactPlayer starts loading
        ↓
4. Video finishes loading
   - ReactPlayer calls onReady()
        ↓
5. requestAnimationFrame(syncVideoHeight)
   - Runs after browser paints
        ↓
6. syncVideoHeight() executes
   - Finds the <video> element
   - Measures: 420px
   - Compares: |447 - 420| = 27px > 2px threshold
   - Updates state: videoHeight = 420px
        ↓
7. Component re-renders
   - Container now at 420px
   - Matches video perfectly
   - No gray bar!
```

### Visual Diagram

**BEFORE (Broken):**
```
┌─────────────────────────┐  ← Container: 447px
│                         │
│    Video: 420px         │
│                         │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← Overlay covers full container
│                         │
└─────────────────────────┘
         ↑
    27px gray bar here!
```

**AFTER (Fixed):**
```
┌─────────────────────────┐  ← Container: 420px
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← Overlay covers exactly video
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓  Video  ▓▓▓▓▓▓▓▓▓▓▓ │  ← Video fills container perfectly
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
└─────────────────────────┘
         ↑
    No gap! Perfect match
```

---

## Key Concepts

### `useRef` and `containerRef`

A way to get direct access to a DOM element:

```typescript
const containerRef = useRef<HTMLDivElement>(null);
// ...
<div ref={containerRef}>  // React connects the ref to this DOM node
```

**Why we need it:** To measure the element or find child elements within it.

---

### `requestAnimationFrame`

Tells the browser: "Run this code after the next paint."

**Why we use it:** We measure the video AFTER it renders, not before. If we measure immediately in `onReady()`, the element might not be fully painted yet.

---

### `getBoundingClientRect()`

Gets an element's actual size and position in pixels:

```typescript
const rect = element.getBoundingClientRect();
rect.height  // 420
rect.width   // 796
```

**Why we use it:** This gives us the actual rendered size, which might differ from CSS or metadata values.

---

### `setVideoHeight` with Function Updater

Using a function instead of a value in `setState`:

```typescript
setVideoHeight((prev) => {  // ← function receives previous value
  if (Math.abs(prev - actualHeight) > 2) {
    return actualHeight;
  }
  return prev;  // ← return same value = no re-render
});
```

**Why we use it:** Lets us compare old vs new and decide whether to actually update, preventing unnecessary re-renders.

---

### CSS Custom Properties (`--video-height`)

Variables defined in CSS at runtime:

```typescript
const sectionStyle = {
  "--video-height": `${videoHeight}px`,  // Sets CSS variable
};
```

**Then in CSS:**
```css
h-(--video-height)  /* Uses the variable */
```

**Why we use it:** Lets JavaScript control CSS values dynamically.

---

## Key Takeaways

1. **Metadata vs Reality** — Video files store original dimensions, but browsers might render them slightly differently due to rounding, aspect ratio constraints, or player chrome.

2. **Two-Phase Loading** — For dynamic sizing, provide an estimate first (fast render), then measure and correct (accuracy).

3. **The 2px Threshold** — Small measurement differences are normal due to sub-pixel rendering. Don't chase perfection or you'll cause infinite re-renders.

4. **requestAnimationFrame Timing** — When measuring DOM elements, always wait for the browser to finish painting.

5. **Container Must Match Content** — The Overlay uses `absolute inset-0` which fills its parent. If the parent is bigger than the video, the overlay shows where there's no video.

---

## Related Files

- `app/components/overlay.tsx` — The overlay component that was showing the gray bar
- `app/weaverse/components.ts` — Where this section is registered

---

*Last updated: April 2026*
