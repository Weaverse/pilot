import { useThemeSettings } from "@weaverse/hydrogen";
import { animate, inView, useAnimate } from "framer-motion";
import { ForwardedRef, useEffect } from "react";

type MotionType = "fade-up" | "zoom-in" | "slide-in";

const animations: Record<MotionType, any> = {
  "fade-up": { opacity: [0, 1], y: [20, 0] },
  "zoom-in": { opacity: [0, 1], scale: [0.8, 1], y: [20, 0] },
  "slide-in": { opacity: [0, 1], x: [20, 0] },
};

export function useMotion(ref?: ForwardedRef<any>) {
  let { enableViewTransition } = useThemeSettings();
  const [scope] = useAnimate();
  useEffect(() => {
    if (!scope.current || !ref) return;
    Object.assign(ref, { current: scope.current });
  }, [scope, ref]);
  useEffect(() => {
    if (!enableViewTransition) {
      return;
    }
    scope.current?.classList.add("animated-scope");
    scope.current
      .querySelectorAll("[data-motion]")
      .forEach((el: HTMLElement, index: number) => {
        inView(
          el,
          (info) => {
            const dataDelay = Number.parseInt(el.dataset.delay as string);
            const motionType = (el.dataset.motion || "fade-up") as MotionType;
            const motionSettings = animations[motionType];
            const delay = dataDelay || index * 0.15;
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
  }, []);
  return [scope] as const;
}
