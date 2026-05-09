import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import type { ComponentPropsWithRef } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "~/utils/cn";

interface SwimlaneProps extends ComponentPropsWithRef<"div"> {
  withArrows?: boolean;
}

function mergeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return (value: T | null) => {
    for (let r of refs) {
      if (typeof r === "function") {
        r(value);
      } else if (r && typeof r === "object") {
        (r as React.RefObject<T | null>).current = value;
      }
    }
  };
}

function updateScrollState(
  el: HTMLElement,
  setLeft: (v: boolean) => void,
  setRight: (v: boolean) => void,
) {
  setLeft(el.scrollLeft > 0);
  setRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
}

export function Swimlane({
  ref,
  className,
  children,
  withArrows = true,
  ...rest
}: SwimlaneProps) {
  let innerRef = useRef<HTMLDivElement>(null);
  let [canScrollLeft, setCanScrollLeft] = useState(false);
  let [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    if (!withArrows) {
      return;
    }
    let el = innerRef.current;
    if (!el) {
      return;
    }
    updateScrollState(el, setCanScrollLeft, setCanScrollRight);
    let observer = new ResizeObserver(() => {
      updateScrollState(el, setCanScrollLeft, setCanScrollRight);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [withArrows]);

  function handleScroll() {
    let el = innerRef.current;
    if (el) {
      updateScrollState(el, setCanScrollLeft, setCanScrollRight);
    }
  }

  function scroll(direction: 1 | -1) {
    let el = innerRef.current;
    if (!el) {
      return;
    }
    el.scrollBy({ left: direction * el.clientWidth, behavior: "smooth" });
  }

  let showArrows = withArrows && (canScrollLeft || canScrollRight);

  return (
    <div className="relative">
      {showArrows && (
        <div className="absolute -top-4 right-0 z-1 flex -translate-y-full gap-2 lg:-top-6">
          <button
            type="button"
            disabled={!canScrollLeft}
            onClick={() => scroll(-1)}
            className={cn(
              "flex size-10 items-center justify-center",
              canScrollLeft ? "opacity-100" : "pointer-events-none opacity-30",
            )}
            aria-label="Scroll left"
          >
            <CaretLeftIcon size={24} />
          </button>
          <button
            type="button"
            disabled={!canScrollRight}
            onClick={() => scroll(1)}
            className={cn(
              "flex size-10 items-center justify-center",
              canScrollRight ? "opacity-100" : "pointer-events-none opacity-30",
            )}
            aria-label="Scroll right"
          >
            <CaretRightIcon size={24} />
          </button>
        </div>
      )}
      <div
        ref={mergeRefs(ref, innerRef)}
        className={cn(
          "grid w-full grid-flow-col justify-start gap-4",
          "snap-x snap-mandatory",
          "hidden-scroll scroll-px-6 overflow-x-scroll overflow-y-hidden",
          "*:snap-start *:w-[38vw] *:lg:w-80",
          className,
        )}
        onScroll={withArrows ? handleScroll : rest.onScroll}
        {...rest}
      >
        {children}
      </div>
    </div>
  );
}
