import { CaretDown } from "@phosphor-icons/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLocation, useSearchParams } from "@remix-run/react";
import Link from "~/components/link";
import { cn } from "~/lib/cn";
import type { SortParam } from "~/lib/filter";

const SORT_LIST: { label: string; key: SortParam }[] = [
  { label: "Featured", key: "featured" },
  {
    label: "Relevance",
    key: "relevance",
  },
  {
    label: "Price, (low to high)",
    key: "price-low-high",
  },
  {
    label: "Price, (high to low)",
    key: "price-high-low",
  },
  {
    label: "Best selling",
    key: "best-selling",
  },
  {
    label: "Newest",
    key: "newest",
  },
];

export function Sort() {
  let [searchParams] = useSearchParams();
  let location = useLocation();
  let currentSort =
    SORT_LIST.find(({ key }) => key === searchParams.get("sort")) ||
    SORT_LIST[0];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex items-center gap-1.5 h-12 border px-4 py-2.5 focus-visible:outline-none">
        <span>
          Sort by: <span className="font-semibold">{currentSort.label}</span>
        </span>
        <CaretDown />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="end"
          className="flex h-fit w-44 flex-col gap-2 border border-line-subtle bg-background p-5"
        >
          {SORT_LIST.map(({ key, label }) => {
            let params = new URLSearchParams(searchParams);
            params.set("sort", key);
            return (
              <DropdownMenu.Item key={key} asChild>
                <Link
                  to={`${location.pathname}?${params.toString()}`}
                  className={cn(
                    "hover:underline underline-offset-[6px] hover:outline-none",
                    currentSort.key === key && "font-bold",
                  )}
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
