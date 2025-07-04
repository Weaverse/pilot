import type { IconProps } from "@phosphor-icons/react";
import clsx from "clsx";
import { cn } from "~/utils/cn";

const LAYOUT_ICONS = {
  1: LayoutList,
  2: TwoColumns,
  3: ThreeColumns,
  4: FourColumns,
  5: FiveColumns,
};

export type LayoutSwitcherProps = {
  gridSizeDesktop: number;
  gridSizeMobile: number;
  onGridSizeChange: (number: number) => void;
};

export function LayoutSwitcher({
  gridSizeDesktop,
  gridSizeMobile,
  onGridSizeChange,
  className,
}: LayoutSwitcherProps & { className?: string }) {
  return (
    <div
      className={cn(
        "flex gap-1",
        "[&>button]:border-[#b7b7b7] [&>button]:text-[#b7b7b7]",
        '[&>button[data-active="true"]]:text-[#696662]',
        '[&>button[data-active="true"]]:border-[#696662]',
        className,
      )}
    >
      {[1, 2, 3, 4, 5].map((col) => {
        const Icon = LAYOUT_ICONS[col];
        return (
          <button
            key={col}
            type="button"
            data-active={
              col > 2 ? gridSizeDesktop === col : gridSizeMobile === col
            }
            onClick={() => onGridSizeChange(col)}
            className={clsx(
              "h-12 w-12 items-center justify-center border",
              col > 2 ? "hidden lg:flex" : "flex lg:hidden",
            )}
          >
            <Icon className="h-[22px] w-[22px]" />
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
