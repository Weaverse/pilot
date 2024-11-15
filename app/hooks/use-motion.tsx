import { useThemeSettings } from "@weaverse/hydrogen";
import { animate, inView, useAnimate } from "framer-motion";
import { type ForwardedRef, useEffect } from "react";

export type MotionType = "fade-up" | "zoom-in" | "slide-in";

const ANIMATIONS: Record<MotionType, any> = {
  "fade-up": { opacity: [0, 1], y: [20, 0] },
  "zoom-in": { opacity: [0, 1], scale: [0.8, 1], y: [20, 0] },
  "slide-in": { opacity: [0, 1], x: [20, 0] },
};

export function useMotion(ref?: ForwardedRef<any>) {
  let { revealSectionsOnScroll } = useThemeSettings();
  let [scope] = useAnimate();

  useEffect(() => {
    if (!scope.current || !ref) return;
    Object.assign(ref, { current: scope.current });
  }, [scope, ref]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!revealSectionsOnScroll) {
      return;
    }
    if (scope.current) {
      scope.current.classList.add("animated-scope");
      scope.current
        .querySelectorAll("[data-motion]")
        .forEach((el: HTMLElement, index: number) => {
          inView(
            el,
            (info) => {
              let dataDelay = Number.parseInt(el.dataset.delay as string);
              let motionType = (el.dataset.motion || "fade-up") as MotionType;
              let motionSettings = ANIMATIONS[motionType];
              let delay = dataDelay || index * 0.15;
              animate(info.target, motionSettings, {
                duration: 0.5,
                delay,
              });
            },
            {
              amount: 0.3,
            }
          );
        });
    }
  }, []);

  return [scope] as const;
}
