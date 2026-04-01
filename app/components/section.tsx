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
    gap: {
      0: "",
      4: "space-y-1",
      8: "space-y-2",
      12: "space-y-3",
      16: "space-y-4",
      20: "space-y-5",
      24: "space-y-3 lg:space-y-6",
      28: "space-y-3.5 lg:space-y-7",
      32: "space-y-4 lg:space-y-8",
      36: "space-y-4 lg:space-y-9",
      40: "space-y-5 lg:space-y-10",
      44: "space-y-5 lg:space-y-11",
      48: "space-y-6 lg:space-y-12",
      52: "space-y-6 lg:space-y-[52px]",
      56: "space-y-7 lg:space-y-14",
      60: "space-y-7 lg:space-y-[60px]",
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

  let { revealElementsOnScroll } = useThemeSettings();
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
        hasBackground &&
          !isBgForContent &&
          "rounded-lg bg-(--section-bg-color)",
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
          variants({ gap, width, verticalPadding, overflow }),
          hasBackground &&
            isBgForContent && [
              "rounded-lg bg-(--section-bg-color)",
              "px-4 sm:px-8",
            ],
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
      step: 4,
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
