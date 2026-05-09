import type {
  HydrogenComponentProps,
  InspectorGroup,
} from "@weaverse/hydrogen";
import { useThemeSettings } from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type React from "react";
import type { HTMLAttributes } from "react";
import { useEffect, useRef, useState } from "react";
import type { ThemeSettings } from "~/types/weaverse";
import { cn } from "~/utils/cn";
import type { BackgroundImageProps } from "./background-image";
import { backgroundInputs } from "./background-image";
import type { OverlayProps } from "./overlay";
import { overlayInputs } from "./overlay";
import { OverlayAndBackground } from "./overlay-and-background";
import { observe } from "./scroll-reveal";

export type BackgroundProps = BackgroundImageProps & {
  backgroundFor: "section" | "content";
  backgroundColor: string;
};

export interface SectionProps<T = any>
  extends Omit<VariantProps<typeof variants>, "padding">,
    Partial<Omit<HydrogenComponentProps<T>, "children">>,
    Omit<HTMLAttributes<HTMLElement>, "children">,
    Partial<BackgroundProps>,
    Partial<OverlayProps> {
  ref?: React.Ref<HTMLElement>;
  as?: React.ElementType;
  gap?: number;
  containerClassName?: string;
  children?: React.ReactNode;
  animate?: boolean;
}

const variants = cva("relative", {
  variants: {
    width: {
      full: "h-full w-full",
      stretch: "h-full w-full",
      fixed: "mx-auto h-full w-full max-w-(--page-width)",
    },
    padding: {
      full: "",
      stretch: "px-3 md:px-10 lg:px-16",
      fixed: "mx-auto px-3 md:px-4 lg:px-6",
    },
    verticalPadding: {
      none: "",
      small: "py-4 md:py-6 lg:py-8",
      medium: "py-8 md:py-12 lg:py-16",
      large: "py-12 md:py-24 lg:py-32",
    },
    overflow: {
      unset: "",
      hidden: "overflow-hidden",
    },
  },
  defaultVariants: {
    overflow: "hidden",
  },
});

export function Section(props: SectionProps) {
  let {
    ref,
    as: Component = "section",
    width,
    gap,
    overflow,
    verticalPadding,
    backgroundColor,
    backgroundFor,
    backgroundImage,
    backgroundFit,
    backgroundPosition,
    enableOverlay,
    overlayColor,
    overlayColorHover,
    overlayOpacity,
    className,
    children,
    containerClassName,
    style = {},
    animate = true,
    ...rest
  } = props;

  let { revealElementsOnScroll } = useThemeSettings<ThemeSettings>();
  let [isVisible, setIsVisible] = useState(false);
  let internalRef = useRef<HTMLElement>(null);

  let setRefs = (node: HTMLElement | null) => {
    (internalRef as React.RefObject<HTMLElement | null>).current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref && "current" in ref) {
      (ref as React.RefObject<HTMLElement | null>).current = node;
    }
  };

  useEffect(() => {
    if (!animate || !revealElementsOnScroll || !internalRef.current) {
      return;
    }
    return observe(internalRef.current, (isIntersecting) => {
      if (isIntersecting) {
        setIsVisible(true);
      }
    });
  }, [animate, revealElementsOnScroll]);

  style = {
    ...style,
    "--section-bg-color": backgroundColor,
    "--gap-desktop": `${gap ?? 0}px`,
    "--gap-mobile": (gap ?? 0) <= 20 ? `${gap ?? 0}px` : `${(gap ?? 0) / 2}px`,
  } as React.CSSProperties;

  const isBgForContent = backgroundFor === "content";
  const hasBackground = backgroundColor || backgroundImage;

  return (
    <Component
      ref={setRefs}
      {...rest}
      style={style}
      className={cn(
        variants({ padding: width, overflow, className }),
        hasBackground && !isBgForContent && "bg-(--section-bg-color)",
        animate &&
          revealElementsOnScroll && [
            "transition-all duration-700",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          ],
      )}
    >
      {!isBgForContent && <OverlayAndBackground {...props} />}
      <div
        className={cn(
          variants({ width, verticalPadding, overflow }),
          "space-y-(--gap-mobile) lg:space-y-(--gap-desktop)",
          hasBackground &&
            isBgForContent && ["bg-(--section-bg-color)", "px-4 sm:px-8"],
          containerClassName,
        )}
      >
        {isBgForContent && <OverlayAndBackground {...props} />}
        {children}
      </div>
    </Component>
  );
}

export const layoutInputs: InspectorGroup["inputs"] = [
  {
    type: "select",
    name: "width",
    label: "Content width",
    configs: {
      options: [
        { value: "full", label: "Full page" },
        { value: "stretch", label: "Stretch" },
        { value: "fixed", label: "Fixed" },
      ],
    },
    defaultValue: "fixed",
  },
  {
    type: "range",
    name: "gap",
    label: "Items spacing",
    configs: {
      min: 0,
      max: 60,
      step: 2,
      unit: "px",
    },
    defaultValue: 20,
  },
  {
    type: "select",
    name: "verticalPadding",
    label: "Vertical padding",
    configs: {
      options: [
        { value: "none", label: "None" },
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" },
      ],
    },
    defaultValue: "medium",
  },
];

export const sectionSettings: InspectorGroup[] = [
  { group: "Layout", inputs: layoutInputs },
  { group: "Background", inputs: backgroundInputs },
  { group: "Overlay", inputs: overlayInputs },
];
