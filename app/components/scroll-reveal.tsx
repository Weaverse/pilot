import { useThemeSettings } from "@weaverse/hydrogen/react-router";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ThemeSettings } from "~/types/weaverse";

/**
 * When true (via provider), descendant ScrollReveals render visible
 * immediately. Provided by above-the-fold/LCP containers (e.g. the first
 * slideshow slide) so hero text is not hidden until hydration runs.
 */
export const RevealImmediateContext = createContext(false);

/**
 * Shared IntersectionObserver utility
 *
 * Instead of creating one IntersectionObserver per component,
 * this creates a single shared observer that manages all elements.
 *
 * Benefits:
 * - Reduces memory usage (1 observer vs N observers)
 * - Better performance (browser manages fewer observers)
 * - Same visual behavior
 */

type ObserverCallback = (isIntersecting: boolean) => void;

let sharedObserver: IntersectionObserver | null = null;
let callbacks = new Map<Element, ObserverCallback>();

function getSharedObserver(): IntersectionObserver {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (let entry of entries) {
          let callback = callbacks.get(entry.target);
          if (callback) {
            callback(entry.isIntersecting);
          }
        }
      },
      { threshold: 0 },
    );
  }
  return sharedObserver;
}

export function observe(
  element: Element,
  callback: ObserverCallback,
): () => void {
  let observer = getSharedObserver();
  callbacks.set(element, callback);
  observer.observe(element);

  return () => {
    callbacks.delete(element);
    observer.unobserve(element);

    if (callbacks.size === 0 && sharedObserver) {
      sharedObserver.disconnect();
      sharedObserver = null;
    }
  };
}

export type AnimationType = "fade-up" | "zoom-in" | "slide-in" | "clip-up";

interface ScrollRevealProps extends React.HTMLAttributes<HTMLElement> {
  ref?: React.Ref<HTMLElement>;
  as?: React.ElementType;
  children?: React.ReactNode;
  /**
   * `clip-up` wipes the element in from the bottom (for images). It only
   * applies with the `expressive` motion style; `subtle` falls back to
   * `slide-in`, the reveal these images used before.
   */
  animation?: AnimationType;
  /** Seconds. Defaults to the theme's `--reveal-duration`. */
  duration?: number;
  /** Milliseconds. Defaults to the automatic sibling stagger. */
  delay?: number;
  /**
   * Render visible immediately (no opacity-0 reveal gate, no observer).
   * Required for above-the-fold/LCP sections: the default reveal hides
   * content until hydration + IntersectionObserver fire, which delays the
   * LCP element's paint until client JS runs.
   */
  immediate?: boolean;
  [key: string]: unknown;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ScrollReveal({
  ref: externalRef,
  as: Component = "div",
  children,
  animation = "fade-up",
  duration,
  delay,
  immediate = false,
  className,
  style,
  ...rest
}: ScrollRevealProps) {
  let { revealElementsOnScroll, motionStyle } =
    useThemeSettings<ThemeSettings>();
  let immediateFromContext = useContext(RevealImmediateContext);
  let isImmediate = immediate || immediateFromContext;
  let [isVisible, setIsVisible] = useState(false);
  let [revealed, setRevealed] = useState(false);
  let internalRef = useRef<HTMLElement>(null);

  let setRefs = (node: HTMLElement | null) => {
    (internalRef as React.RefObject<HTMLElement | null>).current = node;
    if (typeof externalRef === "function") {
      externalRef(node);
    } else if (externalRef && "current" in externalRef) {
      (externalRef as React.RefObject<HTMLElement | null>).current = node;
    }
  };

  useEffect(() => {
    if (isImmediate || !revealElementsOnScroll || !internalRef.current) {
      return;
    }
    let cleanup = observe(internalRef.current, (isIntersecting) => {
      if (!isIntersecting) {
        return;
      }
      // Reduced motion: CSS already shows the element; drop the reveal
      // attributes right away, since no transition will end to drop them.
      if (prefersReducedMotion()) {
        setRevealed(true);
      } else {
        setIsVisible(true);
      }
    });

    return cleanup;
  }, [revealElementsOnScroll, isImmediate]);

  // Strip the reveal attributes once the animation finishes, so hover/focus
  // transitions on the same element aren't fighting the reveal transition.
  useEffect(() => {
    if (!isVisible || !internalRef.current) {
      return;
    }
    let el = internalRef.current;
    function onEnd(e: TransitionEvent) {
      // `clip-up` animates clip-path only; the others always animate opacity.
      if (
        e.target === el &&
        (e.propertyName === "opacity" || e.propertyName === "clip-path")
      ) {
        setRevealed(true);
      }
    }
    el.addEventListener("transitionend", onEnd);
    return () => el.removeEventListener("transitionend", onEnd);
  }, [isVisible]);

  if (isImmediate || !revealElementsOnScroll || revealed) {
    return (
      <Component ref={setRefs} className={className} style={style} {...rest}>
        {children}
      </Component>
    );
  }

  let reveal =
    animation === "clip-up" && motionStyle !== "expressive"
      ? "slide-in"
      : animation;

  return (
    <Component
      ref={setRefs}
      data-reveal={reveal}
      data-visible={isVisible || undefined}
      className={className}
      style={
        {
          ...(duration != null && { "--reveal-duration": `${duration}s` }),
          ...(delay != null && { "--reveal-delay": `${delay}ms` }),
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      {children}
    </Component>
  );
}
