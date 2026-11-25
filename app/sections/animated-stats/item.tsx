import {
  createSchema,
  type WeaverseComponentProps,
} from "@weaverse/hydrogen/react-router";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { priceLocaleFor, resolveLocale } from "~/utils/locale";

const DURATION = 1600;

function formatNumber(n: number, locale: string, decimals: number) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

interface StatItemProps extends WeaverseComponentProps {
  ref?: React.Ref<HTMLDivElement>;
  value: string;
  prefix: string;
  suffix: string;
  label: string;
}

/**
 * A number that counts up from zero the first time it scrolls into view.
 * The server renders the final number, so it reads correctly without
 * JavaScript and for visitors with reduced motion.
 */
export default function StatItem(props: StatItemProps) {
  let { ref, value, prefix, suffix, label, ...rest } = props;
  let numberRef = useRef<HTMLSpanElement>(null);
  let { pathname } = useLocation();
  let target = Number.parseFloat(String(value ?? "").replace(/[^\d.]/g, ""));
  let decimals = String(value ?? "").split(".")[1]?.length ?? 0;
  let locale = priceLocaleFor(resolveLocale(pathname));
  let display = Number.isFinite(target)
    ? formatNumber(target, locale, decimals)
    : value;

  useEffect(() => {
    let el = numberRef.current;
    if (
      !el ||
      !Number.isFinite(target) ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    let frame = 0;
    let observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }
        observer.disconnect();
        let start = performance.now();
        function tick(now: number) {
          let t = Math.min((now - start) / DURATION, 1);
          // Ease out: fast at first, settling on the final number.
          let eased = 1 - (1 - t) ** 3;
          el.textContent = formatNumber(target * eased, locale, decimals);
          if (t < 1) {
            frame = requestAnimationFrame(tick);
          }
        }
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      el.textContent = formatNumber(target, locale, decimals);
    };
  }, [target, decimals, locale]);

  return (
    <div ref={ref} {...rest} className="stat px-2 text-center md:px-4">
      <div className="font-serif text-4xl leading-none tabular-nums md:text-6xl">
        {prefix}
        <span ref={numberRef}>{display}</span>
        {suffix}
      </div>
      {label && <p className="text-body-subtle mt-3">{label}</p>}
    </div>
  );
}

export const schema = createSchema({
  type: "animated-stats--item",
  title: "Stat",
  label: (data: StatItemProps) => data.label,
  settings: [
    {
      group: "Stat",
      inputs: [
        {
          type: "text",
          name: "value",
          label: "Number",
          defaultValue: "100",
          helpText: "Digits only, with an optional decimal point (4.9).",
        },
        { type: "text", name: "prefix", label: "Before the number" },
        { type: "text", name: "suffix", label: "After the number" },
        { type: "text", name: "label", label: "Label", defaultValue: "Label" },
      ],
    },
  ],
  presets: { value: "100", label: "Label" },
});
