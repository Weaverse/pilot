import { useThemeSettings } from "@weaverse/hydrogen";
import { animate, inView, useAnimate } from "framer-motion";
import { type ForwardedRef, useEffect } from "react";

export type MotionType = "fade-up" | "zoom-in" | "slide-in";

const ANIMATIONS: Record<MotionType, any> = {
  "fade-up": { opacity: [0, 1], y: [20, 0] },
  "zoom-in": { opacity: [0, 1], scale: [0.8, 1], y: [20, 0] },
  "slide-in": { opacity: [0, 1], x: [20, 0] },
};

// TODO prevent already-in-view elements from triggering the animation
export function useAnimation(ref?: ForwardedRef<any>) {
  let { revealElementsOnScroll } = useThemeSettings();
  let [scope] = useAnimate();

  useEffect(() => {
    if (!scope.current || !ref) return;
    Object.assign(ref, { current: scope.current });
  }, [scope, ref]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!revealElementsOnScroll) {
      return;
    }
    if (scope.current) {
      scope.current.classList.add("animated-scope");
      let elems = scope.current.querySelectorAll("[data-motion]");
      elems.forEach((elem: HTMLElement, idx: number) => {
        inView(
          elem,
          ({ target }) => {
            let { motion, delay } = elem.dataset;
            animate(target, ANIMATIONS[motion || "fade-up"], {
              delay: Number(delay) || idx * 0.15,
              duration: 0.5,
            });
            if (idx === elems.length - 1) {
              scope.current.classList.remove("animated-scope");
            }
          },
          { amount: 0.3 },
        );
      });
    }
  }, []);

  return [scope] as const;
}
