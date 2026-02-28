import { useThemeSettings } from "@weaverse/hydrogen";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "~/utils/cn";

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
      { threshold: 0.1 },
    );
  }
  return sharedObserver;
}

export function observe(element: Element, callback: ObserverCallback): () => void {
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

export type AnimationType = "fade-up" | "zoom-in" | "slide-in";

const ANIMATION_CLASSES: Record<
  AnimationType,
  { hidden: string; visible: string }
> = {
  "fade-up": {
    hidden: "opacity-0 translate-y-5",
    visible: "opacity-100 translate-y-0",
  },
  "zoom-in": {
    hidden: "opacity-0 scale-80 translate-y-5",
    visible: "opacity-100 scale-100 translate-y-0",
  },
  "slide-in": {
    hidden: "opacity-0 translate-x-5",
    visible: "opacity-100 translate-x-0",
  },
};

interface ScrollRevealProps extends React.HTMLAttributes<HTMLElement> {
  ref?: React.Ref<HTMLElement>;
  as?: React.ElementType;
  children?: React.ReactNode;
  animation?: AnimationType;
  duration?: number;
  delay?: number;
  [key: string]: unknown;
}

export function ScrollReveal({
  ref: externalRef,
  as: Component = "div",
  children,
  animation = "fade-up",
  duration = 0.5,
  delay = 0,
  className,
  style,
  ...rest
}: ScrollRevealProps) {
  let { revealElementsOnScroll } = useThemeSettings();
  let [isVisible, setIsVisible] = useState(false);
  let internalRef = useRef<HTMLElement>(null);

  let setRefs = useCallback(
    (node: HTMLElement | null) => {
      (internalRef as React.MutableRefObject<HTMLElement | null>).current =
        node;
      if (typeof externalRef === "function") {
        externalRef(node);
      } else if (externalRef && "current" in externalRef) {
        (externalRef as React.MutableRefObject<HTMLElement | null>).current =
          node;
      }
    },
    [externalRef],
  );

  useEffect(() => {
    if (!revealElementsOnScroll || !internalRef.current) {
      return;
    }

    let cleanup = observe(internalRef.current, (isIntersecting) => {
      if (isIntersecting) {
        setIsVisible(true);
      }
    });

    return cleanup;
  }, [revealElementsOnScroll]);

  if (!revealElementsOnScroll) {
    return (
      <Component ref={setRefs} className={className} style={style} {...rest}>
        {children}
      </Component>
    );
  }

  let classes = ANIMATION_CLASSES[animation];

  return (
    <Component
      ref={setRefs}
      className={cn(
        "transition-all will-change-transform",
        isVisible ? classes.visible : classes.hidden,
        className,
      )}
      style={{
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}ms`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  );
}
