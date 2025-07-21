import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useNavigation } from "react-router";

export function GlobalLoading() {
  const transition = useNavigation();
  const active = transition.state !== "idle";

  const ref = useRef<HTMLDivElement>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    Promise.allSettled(
      ref.current.getAnimations().map(({ finished }) => finished),
    ).then(() => {
      if (!active) {
        setAnimating(false);
      }
    });

    if (active) {
      const id = setTimeout(() => setAnimating(true), 100);
      return () => clearTimeout(id);
    }
  }, [active]);

  return (
    <div
      aria-hidden={!active}
      className="fixed inset-x-0 top-0 left-0 z-50 h-1 animate-pulse"
    >
      <div
        ref={ref}
        className={clsx(
          "h-full bg-linear-to-r from-neutral-500 to-gray-400 transition-all duration-500 ease-in-out",
          transition.state === "idle" &&
            (animating ? "w-full" : "w-0 opacity-0 transition-none"),
          transition.state === "submitting" && "w-4/12",
          transition.state === "loading" && "w-10/12",
        )}
      />
    </div>
  );
}
