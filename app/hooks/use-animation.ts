import { useThemeSettings } from "@weaverse/hydrogen";
import { type ForwardedRef, useEffect, useRef } from "react";

const ANIMATION_SELECTOR = ".animate-fade-up,.animate-zoom-in,.animate-slide-in";

export function useAnimation(ref?: ForwardedRef<any>) {
  const { revealElementsOnScroll } = useThemeSettings();
  const scope = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scope.current && ref) {
      Object.assign(ref, { current: scope.current });
    }
  }, [scope, ref]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation> --- IGNORE ---
  useEffect(() => {
    if (!revealElementsOnScroll || !scope.current) {
      return;
    }

    scope.current.classList.add("animated-scope");
    const elems =
      scope.current.querySelectorAll<HTMLElement>(ANIMATION_SELECTOR);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.3 },
    );

    elems.forEach((elem, idx) => {
      elem.style.setProperty("--motion-delay", `${idx * 0.15}s`);
      observer.observe(elem);
    });

    // Remove animated-scope after last element would have finished animating
    const totalDuration = (elems.length - 1) * 0.15 + 0.5;
    const timeout = setTimeout(() => {
      scope.current?.classList.remove("animated-scope");
    }, totalDuration * 1000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  return [scope] as const;
}
