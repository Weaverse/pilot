import type { IconProps } from "@phosphor-icons/react";
import clsx from "clsx";
import { cn } from "~/lib/cn";

const LAYOUT_ICONS = {
  1: LayoutList,
  2: TwoColumns,
  3: ThreeColumns,
  4: FourColumns,
  5: FiveColumns,
};

export function LayoutSwitcher({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (number: number) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-1",
        "[&>button]:text-[#b7b7b7] [&>button]:border-[#b7b7b7]",
        '[&>button[data-active="true"]]:text-[#696662]',
        '[&>button[data-active="true"]]:border-[#696662]',
        className,
      )}
    >
      {[1, 2, 3, 4, 5].map((col) => {
        let Icon = LAYOUT_ICONS[col];
        return (
          <button
            key={col}
            type="button"
            data-active={value === col}
            onClick={() => onChange(col)}
            className={clsx(
              "border w-10 h-10 items-center justify-center",
              col <= 2 ? "flex lg:hidden" : "hidden lg:flex",
            )}
          >
            <Icon className="w-5 h-5" />
          </button>
        );
      })}
    </div>
  );
}

function LayoutList(props: IconProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="22" height="22" />
    </svg>
  );
}

function TwoColumns(props: IconProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="10" height="22" />
      <rect x="12" width="10" height="22" />
    </svg>
  );
}

function ThreeColumns(props: IconProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="6" height="22" />
      <rect x="8" width="6" height="22" />
      <rect x="16" width="6" height="22" />
    </svg>
  );
}

function FourColumns(props: IconProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="4" height="22" />
      <rect x="6" width="4" height="22" />
      <rect x="12" width="4" height="22" />
      <rect x="18" width="4" height="22" />
    </svg>
  );
}

function FiveColumns(props: IconProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="2.8" height="22" />
      <rect x="4.7998" width="2.8" height="22" />
      <rect x="9.6001" width="2.8" height="22" />
      <rect x="14.3999" width="2.8" height="22" />
      <rect x="19.2002" width="2.8" height="22" />
    </svg>
  );
}
