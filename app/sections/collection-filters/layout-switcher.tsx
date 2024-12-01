import type { IconProps } from "@phosphor-icons/react";
import { cn } from "~/lib/cn";

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
        "flex",
        "[&>button]:text-[#b7b7b7] [&>button]:border-[#b7b7b7]",
        '[&>button[data-active="true"]]:text-[#696662]',
        '[&>button[data-active="true"]]:border-[#696662]',
        className,
      )}
    >
      <button
        type="button"
        data-active={value === 4}
        onClick={() => onChange(4)}
        className="border w-10 h-10 items-center justify-center hidden lg:flex"
      >
        <FourColumns className="w-5 h-5" />
      </button>
      <button
        type="button"
        data-active={value === 3}
        className="border w-10 h-10 items-center justify-center hidden lg:flex"
        onClick={() => onChange(3)}
      >
        <ThreeColumns className="w-5 h-5" />
      </button>
      <button
        type="button"
        data-active={value === 2}
        className="border w-10 h-10 items-center justify-center flex lg:hidden"
        onClick={() => onChange(2)}
      >
        <TwoColumns className="w-5 h-5" />
      </button>
      <button
        type="button"
        data-active={value === 1}
        className="border w-10 h-10 items-center justify-center flex lg:hidden"
        onClick={() => onChange(1)}
      >
        <LayoutList className="w-5 h-5" />
      </button>
    </div>
  );
}

function LayoutList(props: IconProps) {
  return (
    <svg
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12.5 9.5"
      {...props}
    >
      <path d="M12.5.75a.76.76 0 01-.75.75h-11A.76.76 0 010 .75.76.76 0 01.75 0h11a.76.76 0 01.75.75z" />
      <path d="M12.5 4.75a.76.76 0 01-.75.75h-11A.76.76 0 010 4.75.76.76 0 01.75 4h11a.76.76 0 01.75.75z" />
      <path d="M12.5 8.75a.76.76 0 01-.75.75h-11A.76.76 0 010 8.75.76.76 0 01.75 8h11a.76.76 0 01.75.75z" />
    </svg>
  );
}

function TwoColumns(props: IconProps) {
  return (
    <svg
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 5.5 12.5"
      {...props}
    >
      <path d="M.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 01.75 0z" />
      <path d="M4.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 014.75 0z" />
    </svg>
  );
}

function ThreeColumns(props: IconProps) {
  return (
    <svg
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 9.5 12.5"
      {...props}
    >
      <path d="M.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 01.75 0z" />
      <path d="M4.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 014.75 0z" />
      <path d="M8.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 018.75 0z" />
    </svg>
  );
}

function FourColumns(props: IconProps) {
  return (
    <svg
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 13.5 12.5"
      {...props}
    >
      <path
        id="Rectangle"
        d="M.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 01.75 0z"
      />
      <path d="M4.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 014.75 0z" />
      <path d="M8.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 018.75 0z" />
      <path d="M12.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11a.76.76 0 01.75-.75z" />
    </svg>
  );
}
