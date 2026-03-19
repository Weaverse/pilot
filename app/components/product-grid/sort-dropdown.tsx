import { CaretDownIcon } from "@phosphor-icons/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLocation, useSearchParams } from "react-router";
import Link from "~/components/link";
import type { SortParam } from "~/types/others";
import { cn } from "~/utils/cn";

interface SortDropdownProps {
  options: Array<{
    label: string;
    key: SortParam;
  }>;
  className?: string;
}

export function SortDropdown({ options, className }: SortDropdownProps) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const currentSort =
    options.find(({ key }) => key === searchParams.get("sort")) || options[0];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(
          "flex h-12 items-center gap-1.5 border px-4 py-2.5 focus-visible:outline-hidden",
          className,
        )}
      >
        <span className="hidden lg:inline">
          Sort by: <span className="font-semibold">{currentSort.label}</span>
        </span>
        <span className="lg:hidden">Sort</span>
        <CaretDownIcon />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="end"
          className="flex h-fit w-44 flex-col gap-2 border border-gray-400 bg-background p-5 shadow"
        >
          {options.map(({ key, label }) => {
            const params = new URLSearchParams(searchParams);
            params.delete("cursor");
            params.delete("direction");
            params.set("sort", key);

            return (
              <DropdownMenu.Item key={key} asChild>
                <Link
                  to={`${location.pathname}?${params.toString()}`}
                  className={cn(
                    "underline-offset-[6px] hover:underline hover:outline-hidden",
                    currentSort.key === key && "font-bold",
                  )}
                  preventScrollReset
                >
                  {label}
                </Link>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
