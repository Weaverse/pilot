import { createSchema } from "@weaverse/hydrogen/react-router";
import { cva } from "class-variance-authority";
import type { CSSProperties } from "react";
import type { SectionProps } from "~/components/section";
import { Section } from "~/components/section";
import { cn } from "~/utils/cn";

// ponytail: fixed copy count; enough to fill wide screens for short lists.
const COPIES = 4;

interface TextMarqueeProps extends SectionProps {
  items: string;
  separator: string;
  textSize: "medium" | "large" | "huge";
  outlined: boolean;
  textColor: string;
  speed: number;
  direction: "left" | "right";
  pauseOnHover: boolean;
}

const textVariants = cva("", {
  variants: {
    textSize: {
      medium: "text-2xl md:text-4xl",
      large: "text-4xl md:text-6xl",
      huge: "text-5xl md:text-8xl",
    },
  },
  defaultVariants: { textSize: "large" },
});

/**
 * Large statement text scrolling continuously. One line of `items` per
 * phrase; the list is repeated so the loop has no gap.
 */
export default function TextMarquee(props: TextMarqueeProps) {
  let {
    items,
    separator,
    textSize,
    outlined,
    textColor,
    speed,
    direction,
    pauseOnHover,
    ...rest
  } = props;
  let phrases = (items || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <Section
      {...rest}
      width="full"
      containerClassName={cn(
        "group flex overflow-hidden font-serif leading-tight whitespace-nowrap",
        textVariants({ textSize }),
        outlined &&
          "text-transparent [-webkit-text-stroke:1px_var(--marquee-color)]",
      )}
      style={
        {
          color: outlined ? undefined : textColor,
          "--marquee-color": textColor || "currentColor",
          "--marquee-duration": `${speed ?? 30}s`,
        } as CSSProperties
      }
    >
      {Array.from({ length: COPIES }, (_, copy) => (
        <ul
          key={copy}
          aria-hidden={copy > 0 || undefined}
          className={cn(
            "animate-marquee flex shrink-0 items-center motion-reduce:animate-none",
            "[animation-duration:var(--marquee-duration)]",
            direction === "right" && "[animation-direction:reverse]",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
          )}
        >
          {phrases.map((phrase, idx) => (
            <li key={idx} className="flex items-center">
              <span className="px-[0.4em]">{phrase}</span>
              {separator && (
                <span aria-hidden className="px-[0.4em] text-[0.6em]">
                  {separator}
                </span>
              )}
            </li>
          ))}
        </ul>
      ))}
    </Section>
  );
}

export const schema = createSchema({
  type: "text-marquee",
  title: "Text marquee",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "textarea",
          name: "items",
          label: "Phrases",
          helpText: "One phrase per line.",
          defaultValue:
            "Made to last\nDesigned in small batches\nFree shipping over $100",
        },
        {
          type: "text",
          name: "separator",
          label: "Separator",
          defaultValue: "✦",
        },
      ],
    },
    {
      group: "Style",
      inputs: [
        {
          type: "select",
          name: "textSize",
          label: "Text size",
          configs: {
            options: [
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
              { value: "huge", label: "Huge" },
            ],
          },
          defaultValue: "large",
        },
        {
          type: "switch",
          name: "outlined",
          label: "Outlined text",
          defaultValue: false,
        },
        {
          type: "color",
          name: "textColor",
          label: "Text color",
        },
        {
          type: "color",
          name: "backgroundColor",
          label: "Background color",
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
      ],
    },
    {
      group: "Motion",
      inputs: [
        {
          type: "range",
          name: "speed",
          label: "Loop duration",
          configs: { min: 5, max: 90, step: 1, unit: "s" },
          defaultValue: 30,
          helpText: "Seconds for one pass. Lower is faster.",
        },
        {
          type: "toggle-group",
          name: "direction",
          label: "Direction",
          configs: {
            options: [
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ],
          },
          defaultValue: "left",
        },
        {
          type: "switch",
          name: "pauseOnHover",
          label: "Pause on hover",
          defaultValue: true,
        },
      ],
    },
  ],
  presets: {
    items:
      "Made to last\nDesigned in small batches\nFree shipping over $100\nRepairs for life",
    separator: "✦",
    textSize: "large",
    verticalPadding: "medium",
  },
});
