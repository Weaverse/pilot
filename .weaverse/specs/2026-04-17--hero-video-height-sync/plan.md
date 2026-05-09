# Implementation Plan: Hero Video Height Synchronization

## Problem Statement

The hero video section had a height mismatch issue:
- **Calculated container height**: 447px (from video metadata)
- **Actual video render height**: 420px
- **Result**: 27px gray bar below the video where the overlay extended past the video element

## Root Cause

Video files store intrinsic dimensions (width/height), but browsers and ReactPlayer might render them slightly differently due to:
- Sub-pixel rounding differences
- Aspect ratio constraints
- Player chrome/padding
- CSS layout calculations

## Solution Overview

Implement **two-phase height synchronization**:
1. **Phase 1**: Fast estimate from metadata (immediate, reduces layout shift)
2. **Phase 2**: Precise measurement after render (accuracy, eliminates gray bar)

## Implementation Details

### 1. Added `calculateVideoHeight()` Helper

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

**Purpose**: Calculate expected height from video's intrinsic dimensions before the video renders.

### 2. Added `syncVideoHeight()` Function

```typescript
function syncVideoHeight() {
  if (!containerRef.current) return;
  
  const mediaEl = containerRef.current.querySelector("video, iframe") 
    as HTMLElement | null;
  
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

**Key features**:
- Uses `containerRef` to access the DOM
- Queries for actual `<video>` or `<iframe>` element inside ReactPlayer
- Measures with `getBoundingClientRect()` for precise pixel values
- 2px threshold prevents jitter from sub-pixel rounding
- Functional state update only triggers re-render when needed

### 3. Changed State Initialization

```typescript
const [videoHeight, setVideoHeight] = useState<number | null>(() => {
  if (video?.width && video?.height) {
    const estimatedWidth = window.innerWidth;
    return calculateVideoHeight(video, estimatedWidth);
  }
  return null;
});
```

**Why lazy initialization**: Runs immediately on mount, providing an estimate before ReactPlayer loads.

### 4. Updated `handleResize()`

```typescript
function handleResize() {
  setSize(getPlayerSize(id));
  
  // Phase 1: Estimate from metadata
  if (containerRef.current && video?.width && video?.height) {
    const containerWidth = containerRef.current.getBoundingClientRect().width;
    const calculatedHeight = calculateVideoHeight(video, containerWidth);
    if (calculatedHeight) {
      setVideoHeight(calculatedHeight);
    }
  }
  
  // Phase 2: Sync with actual element
  requestAnimationFrame(syncVideoHeight);
}
```

**Two-phase approach**:
1. Quick metadata-based calculation for responsive feel
2. `requestAnimationFrame()` ensures measurement happens after browser paint

### 5. Added `onReady` Callback

```typescript
<ReactPlayer
  // ... props
  onReady={() => {
    requestAnimationFrame(syncVideoHeight);
  }}
/>
```

**Purpose**: Sync height when video finishes loading (covers initial load case).

### 6. Simplified Height Settings

**Removed**:
- `heightOnMobile` from interface
- Separate desktop/mobile values in `SECTION_HEIGHTS`

**Changed to**:
```typescript
const SECTION_HEIGHTS = {
  small: "40vh",
  medium: "50vh", 
  large: "70vh",
  custom: null,
};
```

Mobile now uses calculated `videoHeight` instead of fixed vh values.

### 7. Updated Container CSS

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

**Conditional classes**:
- If `videoHeight` exists: Use it (`h-(--video-height)`)
- Otherwise: Fall back to `aspect-video` class

## Files and Folders

### Modified Files
1. `app/sections/hero-video/index.tsx` - Main component with sync logic
2. `app/sections/hero-video/schema.ts` - Removed mobile height setting

### No New Files
- No new components or utilities created
- Changes confined to existing hero-video section

## Key Technical Decisions

1. **2px threshold**: Prevents infinite re-renders from sub-pixel differences between measurement methods

2. **`requestAnimationFrame`**: Ensures DOM measurement happens after browser paint, not during render phase

3. **Metadata + Measurement combo**: Provides fast initial render (estimate) while ensuring accuracy (measurement)

4. **`useRef` + `querySelector`**: Direct DOM access needed because ReactPlayer wraps video in multiple layers

5. **Functional state update**: `setVideoHeight((prev) => ...)` allows comparison before updating, preventing unnecessary re-renders

## Testing Notes

- Test with different video aspect ratios (16:9, 4:3, 9:16)
- Test on mobile (calculated height should match video)
- Test on desktop (should respect `min(desktop-height, video-height)`)
- Resize browser window - height should recalculate smoothly
- Verify no gray bar appears below video
- Verify overlay covers exactly the video area

## Related Documentation

- `app/sections/hero-video/EXPLANATION.md` - Detailed code walkthrough for junior developers
